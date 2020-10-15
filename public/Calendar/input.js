import { displayLoginPopup } from './loginpopup.js';
import Task from "./Task.js";

let userId = "";
let signOutPressed = false;
const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const abbrDaysOfWeek = daysOfWeek.map(elem => elem.substring(0, 3));
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
  let dates = getAllDatesToDisplay(date);
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
function getAllDatesToDisplay(date) {
  let dates = [];
  for (let i = 0; i < 5; i++) {
    let newDate = new Date();
    newDate.setFullYear(date.getFullYear());  //set year
    newDate.setDate(date.getDate() + i);      //set day of month
    newDate.setMonth(date.getMonth());        //set month
    newDate.setHours(0, 0, 0, 0);             //set rest to 0
    dates[i] = newDate;
  }
  return dates;
}

// Returns an array of queries for each date 
// passed in
function getQueries(dates) {
  let dayQueries = [];
  let tasksRef = db.collection("users").doc(userId).collection("tasks");

  /* end testing */
  for (let i = 0; i < dates.length; i++) {
    console.log("getting query where date == " + dates[i]);
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
      querySnapshot.forEach((taskDoc, i) => {
        console.log('creating new task');
        let newTask = new Task();
        newTask.dayOfWeek = dayIndex;
        newTask.document = taskDoc;
        newTask.description = taskDoc.data().description;
        newTask.taskNum = i;  // ith task of the day
        dayTasksArr.push(newTask);
      })
    });
  return dayTasksArr;
}

// Outputs a task on the screen
function outputTask(task, dayOfWeek) {
  let listToUpdate = document.getElementById(
    abbrDaysOfWeek[dayOfWeek] + "-tasks"  //ex: list id is mon-tasks
  );
  let deleteContainer = document.getElementById(
    "deletecontainer" + abbrDaysOfWeek[dayOfWeek]
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
  newDeleteElem.id = "delete" + dayOfWeek + task.taskNum;
  newDeleteElem.className = "deletemark";
  newDeleteElem.src = "./images/deletemark.svg";

  newDeleteElem.addEventListener("click", deleteTask);
  deleteContainer.appendChild(newDeleteElem);
  task.deleteButton = newDeleteElem;
}

function deleteTask() {
  console.log("in delete task");
  // Mark task as deleted (lazy deletion)
  // Remove from the 
}

function save(/*tasks*/) {
  tasks.forEach((list) => {
    list.forEach((task) => {
      updateTask(task);
    })
  })
}

function updateTask(task) {
  // TODO: remove deleted tasks from db
  // TODO: add added tasks to db
  if (task.deleted) {
    console.log("deleting task");
  }
  task.document.ref.update({
    description: task.listElement.value
  }).catch(error => console.log(error));
}

function addTask(event) {
  //Figure out which plus called it
  //get the list
  //append new element to end of list
  //create new task document
}