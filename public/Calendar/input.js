import { displayLoginPopup } from './loginpopup.js';
import Task from "./Task.js";

let userId = "";
let signOutPressed = false;
const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const abbrDaysOfWeek = daysOfWeek.map(elem => elem.substring(0, 3));
let dates = [];
let db = null;
let tasks = [];


firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // user is signed in
    userId = firebase.auth().currentUser.uid;

    // remove overlay
    let overlay = document.getElementById("overlay");
    overlay.style.display = "none";

    // create calendar
    createCalendar();
  } else {
    // user is signed out
    if (!signOutPressed) {
      displayLoginPopup();
    }
  }
});


// Main function which initializes calendar
// with tasks from database
async function createCalendar() {
  addSignoutButton();
  //let tasks = [];
  let date = getFirstDateToDisplay();
  dates = getAllDatesToDisplay(date); //sets global dates array

  // TODO: output surrounding weeks

  db = firebase.firestore();  //set global db variable
  let dayQueries = getQueries(dates);
  let promiseArr = [];
  for (let i = 0; i < dayQueries.length; i++) {
    promiseArr[i] = getTasksFromQuery(dayQueries[i])
      .then((tasksArr) => { tasks[i] = tasksArr });
  }
  await Promise.all(promiseArr);

  for (let i = 0; i < tasks.length; i++) {
    for (let j = 0; j < tasks[i].length; j++) {
      outputTask(tasks[i][j], i); //i == day of the week
    }
  }

  document.getElementById("saveButton").addEventListener("click", save);
  addPlusListeners(); // add event listeners for plus buttons
}


// Adds functionality to the signout button and
// redirects home when pressed
function addSignoutButton() {
  const signout = document.getElementById("signout");
  signout.addEventListener("click", (e) => {
    e.preventDefault();
    signOutPressed = true;
    firebase.auth().signOut()
      .then(() => {
        window.location.href = "../index.html";
      })
  })
}


// Check if the user selected another day
// other than the current one and update the date
function getFirstDateToDisplay() {
  let date = new Date();
  let yearToDisplay = localStorage.getItem("year");
  let monthToDisplay = localStorage.getItem("month");
  let dayToDisplay = localStorage.getItem("day");

  if (yearToDisplay !== null && monthToDisplay !== null
    && dayToDisplay !== null) {
    // A starting date was passed in
    date.setFullYear(yearToDisplay);
    date.setMonth(monthToDisplay);
    date.setDate(dayToDisplay);
    localStorage.removeItem("year");
    localStorage.removeItem("month");
    localStorage.removeItem("day");
  } else {
    // Change date to the last Monday
    date.setDate(date.getDate() - (date.getDay() + 6) % 7);
  }
  date.setHours(0, 0, 0, 0);
  return date;
}


// Returns an array of all dates to display
// starting with the date passed in
function getAllDatesToDisplay(firstDate) {
  let dates = [];
  for (let i = 0; i < 5; i++) {
    let newDate = new Date();
    newDate.setFullYear(firstDate.getFullYear());  //set year
    newDate.setDate(firstDate.getDate() + i);      //set day of month
    newDate.setMonth(firstDate.getMonth());        //set month
    newDate.setHours(0, 0, 0, 0);                  //set rest to 0
    dates[i] = newDate;
  }
  return dates;
}


// Returns an array of queries for tasks on each date 
// passed in
function getQueries(dates) {
  let dayQueries = [];
  let tasksRef = db.collection("users").doc(userId).collection("tasks");
  for (let i = 0; i < dates.length; i++) {
    dayQueries[i] = tasksRef.where("dateOfTask", "==", dates[i]);
  }
  return dayQueries;
}


// Executes a query for tasks on a day and returns an array
// of task objects corresponding to tasks on that day
async function getTasksFromQuery(query, dayIndex) {
  let dayTasksArr = [];
  await query.get()
    .then((querySnapshot) => {
      let i = 0;
      querySnapshot.docs.forEach((taskDoc) => {
        let newTask = new Task();
        newTask.dayOfWeek = dayIndex;
        newTask.documentRef = taskDoc.ref;
        newTask.description = taskDoc.data().description;
        newTask.taskNum = i;  // ith task of the day
        newTask.inDb = true;
        dayTasksArr.push(newTask);
        i++;
      })
    });
  return dayTasksArr;
}


// Outputs a task on the screen
function outputTask(task, dayIndex) {
  let listToUpdate = document.getElementById(
    abbrDaysOfWeek[dayIndex] + "-tasks"  //ex: list id is mon-tasks
  );
  let deleteContainer = document.getElementById(
    "deletecontainer" + abbrDaysOfWeek[dayIndex]
  );

  let newInputElem = document.createElement("input");
  newInputElem.type = "text";
  newInputElem.maxLength = "30";
  newInputElem.value = task.description;
  task.listElement = newInputElem;  // give task object the input element

  let newListItem = document.createElement("li");
  newListItem.setAttribute("value", task.description) // TODO: duplicate description values?
  newListItem.appendChild(newInputElem);

  listToUpdate.appendChild(newListItem);

  let newDeleteElem = document.createElement("img");
  newDeleteElem.id = "delete" + abbrDaysOfWeek[dayIndex] + task.taskNum;
  newDeleteElem.className = "deletemark";
  newDeleteElem.src = "./images/deletemark.svg";

  newDeleteElem.addEventListener("click", deleteTask);
  deleteContainer.appendChild(newDeleteElem);
  task.deleteButton = newDeleteElem;
}


// Delete task from user view but NOT from the
// database 
function deleteTask(event) {
  event.preventDefault();
  // Figure out which task called it
  let day = event.target.id.substring(6, 9);
  let dayIndex = abbrDaysOfWeek.indexOf(day);
  let taskToDelete = null;
  // Find task to delete
  for (let i = 0; i < tasks[dayIndex].length; i++) {
    if (tasks[dayIndex][i].deleteButton === event.target) {
      taskToDelete = tasks[dayIndex][i];
    }
  }
  // Remove from the dom
  taskToDelete.listElement.style.display = "none";
  taskToDelete.deleteButton.style.display = "none";
  // Mark task as deleted (lazy deletion)
  taskToDelete.deletedFromDom = true;
}


// Updates each task in the database when the user
// hits the save button
function save() {
  tasks.forEach((list) => {
    list.forEach((task) => {
      updateTask(task);
    })
  })
}


// Updates a task in the database based on properties
// of the task.
function updateTask(task) {
  if (task.deletedFromDom && !task.deletedFromDb
    && task.inDb) {
    // if task is marked as deleted but not yet 
    // deleted from the database, delete from the database
    task.documentRef.delete()
      .then(() => { task.deletedFromDb = true; });
  } else if (task.addedToDom && !task.inDb) {
    // If task is new, add to the database
    db.collection("users").doc(userId)
      .collection("tasks").add({
        dateOfTask: task.date,
        description: task.listElement.value,
        status: "incomplete"
      })
      .then((docRef) => {
        task.documentRef = docRef;
        task.inDb = true;
      });
  } else if (!task.deletedFromDom && !task.deletedFromDb
    && task.inDb) {
    // If task not deleted from the database or dom, update
    // to match the text currently on the page
    task.documentRef.update({
      description: task.listElement.value
    }).catch(error => console.log(error));
  }
}


// Add new task to the dom based on which
// plus button clicked but don't add to database
function addTask(event) {
  event.preventDefault();
  // Figure out which plus called it
  // by first three characters - ex: (id == 'monplus')
  let dayAbbr = event.target.id.substr(0, 3);
  let dayIndex = abbrDaysOfWeek.indexOf(dayAbbr);
  // Add new task
  let newTask = new Task();
  newTask.date = dates[dayIndex];
  newTask.taskNum = tasks[dayIndex].length;
  newTask.addedToDom = true;
  tasks[dayIndex].push(newTask);
  outputTask(newTask, dayIndex); // add element to dom
}


// Add an addtask event listener for each day of the week
function addPlusListeners() {
  abbrDaysOfWeek.forEach((dayAbbr) => {
    document.getElementById(dayAbbr + "plus")
      .addEventListener("click", addTask);
  });
}