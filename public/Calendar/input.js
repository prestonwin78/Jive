
import {displayLoginPopup} from './loginpopup.js';

let userId = "";
let signOutPressed = false;

//Add state listener to listen for user signin/signout  
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log("user is signed in");
    userId = firebase.auth().currentUser.uid;
    console.log("Userid: " + userId);
    //remove overlay
    let overlay = document.getElementById("overlay");
    overlay.style.display = "none";
    //proceed to main logic
    afterInit();
  } else {
    //If the signout button was not pressed, 
    //display the sign-in overlay
    console.log("user is signed out");
    
    if(!signOutPressed){
      displayLoginPopup();
    }
  }
});

//AfterInit adds all functionality for the calendar and is called
//after the user successfully signs in
function afterInit(){

// Add signout functionality Sign out
let signout = document.getElementById("signout");
signout.addEventListener("click", (e) => {
  e.preventDefault();
  signOutPressed = true;
  firebase.auth().signOut()
  .then(function (){
    console.log("User signed out");
    window.location.href = "../index.html";
  });
});

let db = firebase.firestore();

let monTaskDocs = [];
let tueTaskDocs = [];
let wedTaskDocs = [];
let thuTaskDocs = [];
let friTaskDocs = [];
let monTaskListItems = [];
let tueTaskListItems = [];
let wedTaskListItems = [];
let thuTaskListItems = [];
let friTaskListItems = [];
let numTasks = [0, 0, 0, 0, 0]; //number of monday tasks held in [0]

// Initialize the calendar+populate with the week's tasks

//find out what day it is
let date = new Date();

let yearToDisplay = localStorage.getItem("year");
let monthToDisplay = localStorage.getItem("month");
let dayToDisplay = localStorage.getItem("day");


if(yearToDisplay != null){
  let dateToDisplay = new Date();
  dateToDisplay.setFullYear(yearToDisplay);
  dateToDisplay.setMonth(monthToDisplay);
  dateToDisplay.setDate(dayToDisplay);

  date = dateToDisplay; //change date to one user passed in

  console.log("date: " + date);
  
  localStorage.removeItem("year");
  localStorage.removeItem("month");
  localStorage.removeItem("day");
}

date.setHours(0, 0, 0, 0);  //set current date to midnight
console.log("date: " + date);
console.log("modified: " + date.getDate());
var dayOfWeek = date.getDay();
//calculate what days are mon, tues, wed, thur, fri
var monTasks = null;
var tueTasks = null;
var wedTasks = null;
var thuTasks = null;
var friTasks = null;
var mondayDate = new Date();
var tuesdayDate = new Date();
var wednesdayDate = new Date();
var thursdayDate = new Date();
var fridayDate = new Date();

mondayDate.setFullYear(date.getFullYear());
tuesdayDate.setFullYear(date.getFullYear());
wednesdayDate.setFullYear(date.getFullYear());
thursdayDate.setFullYear(date.getFullYear());
fridayDate.setFullYear(date.getFullYear());

mondayDate.setMonth(date.getMonth());
tuesdayDate.setMonth(date.getMonth());
wednesdayDate.setMonth(date.getMonth());
thursdayDate.setMonth(date.getMonth());
fridayDate.setMonth(date.getMonth());

mondayDate.setHours(0, 0, 0, 0);
tuesdayDate.setHours(0, 0, 0, 0);
wednesdayDate.setHours(0, 0, 0, 0);
thursdayDate.setHours(0, 0, 0, 0);
fridayDate.setHours(0, 0, 0, 0);
  
if(dayOfWeek == 0){ //current day is sunday
  mondayDate.setDate(date.getDate() - 6);
  tuesdayDate.setDate(date.getDate() - 5);
  wednesdayDate.setDate(date.getDate() - 4);
  thursdayDate.setDate(date.getDate() - 3);
  fridayDate.setDate(date.getDate() - 2);
}
else if(dayOfWeek == 1){ //current day is monday
  mondayDate.setDate(date.getDate());
  tuesdayDate.setDate(date.getDate() + 1);
  wednesdayDate.setDate(date.getDate() + 2);
  thursdayDate.setDate(date.getDate() + 3);
  fridayDate.setDate(date.getDate() + 4);
}
else if(dayOfWeek == 2){ //current day is tuesday
  mondayDate.setDate(date.getDate() - 1);
  tuesdayDate.setDate(date.getDate());
  wednesdayDate.setDate(date.getDate() + 1);
  thursdayDate.setDate(date.getDate() + 2);
  fridayDate.setDate(date.getDate() + 3);
}
else if(dayOfWeek == 3){ //current day is wednesday
  mondayDate.setDate(date.getDate() - 2);
  tuesdayDate.setDate(date.getDate() - 1);
  wednesdayDate.setDate(date.getDate());
  thursdayDate.setDate(date.getDate() + 1);
  fridayDate.setDate(date.getDate() + 2);
}
else if(dayOfWeek == 4){ //current day is thursday
  mondayDate.setDate(date.getDate() - 3);
  tuesdayDate.setDate(date.getDate() - 2);
  wednesdayDate.setDate(date.getDate() - 1);
  thursdayDate.setDate(date.getDate());
  fridayDate.setDate(date.getDate() + 4);
}
else if(dayOfWeek == 5){ //current day is friday
  mondayDate.setDate(date.getDate() - 4);
  tuesdayDate.setDate(date.getDate() - 3);
  wednesdayDate.setDate(date.getDate() - 2);
  thursdayDate.setDate(date.getDate() - 1);
  fridayDate.setDate(date.getDate());
}
else if(dayOfWeek == 6){ //current day is saturday
  mondayDate.setDate(date.getDate() - 5);
  tuesdayDate.setDate(date.getDate() - 4);
  wednesdayDate.setDate(date.getDate() - 3);
  thursdayDate.setDate(date.getDate() - 2);
  fridayDate.setDate(date.getDate() - 1);
}

// Week section - outputs date elements for weeks 
// surrounding the current week and adds functionality
/* *************************************************** */
let surroundingWeeks = [];  //holds monday of surrounding weeks
//Displays html elements for weeks on the page
function outputDates(){
  let dateArr = getDates();
  let i = 0;
  console.log(dateArr);
  let weeklist = document.getElementById("weeklist");
  dateArr.forEach(function(d){
    let newWeekElem = document.createElement("li");
    newWeekElem.innerHTML = dateArr[i++];
    newWeekElem.id = "weekElem" + i;
    weeklist.appendChild(newWeekElem);
    weeklist.addEventListener("click", refreshWithNewWeek);
  });
}

// getDates(): returns 5 dates of mondays in an array
// first 2 elements hold dates of mondays for 2 weeks before current week
// middle element holds date of monday 
function getDates(){
  let dateArr = [];
  
  for(let i = -2; i <= 2; i++){
    let newDate = new Date();
    console.log("original: " + date);
    console.log("monday date: " + mondayDate);
    newDate.setFullYear(mondayDate.getFullYear());
    newDate.setMonth(mondayDate.getMonth());
    newDate.setDate(mondayDate.getDate() + 7 * i);
    console.log("newdate: " + newDate);
    let dateOutput = "";
    dateOutput += newDate.getMonth() + 1;
    dateOutput += "/"
    dateOutput += newDate.getDate();
    dateArr.push(dateOutput);
    // + 3 to make [-2, 2] into [1, 5]
    surroundingWeeks[i + 3] = newDate;  //for cookie storage
  }

  return dateArr;
}

//refreshWithNewWeek(event): is called when user clicks on date
//to switch to another week. It sets a cookie with the year, 
//month, and day the user wants to switch to and refreshes
//the page
function refreshWithNewWeek(event){
  console.log("in refresh");
  //get week index of calling element's id
  let weekIndex = parseInt(event.target.id.substring(8, 9), 10);

  console.log(surroundingWeeks[weekIndex]);

  //get the year, month, and day using the weekIndex
  let year = surroundingWeeks[weekIndex].getFullYear();
  let month = surroundingWeeks[weekIndex].getMonth();
  let day = surroundingWeeks[weekIndex].getDate();

  //set cookies
  localStorage.setItem("year", year);
  localStorage.setItem("month", month);
  localStorage.setItem("day", day);
  
  window.location.reload(true); //reload but don't cache
}

//get query to get tasks for each day  
var tasksRef = db.collection("users").doc(userId).collection("tasks");
var monQuery = tasksRef.where("dateOfTask", "==", mondayDate);
var tueQuery = tasksRef.where("dateOfTask", "==", tuesdayDate);
var wedQuery = tasksRef.where("dateOfTask", "==", wednesdayDate);
var thuQuery = tasksRef.where("dateOfTask", "==", thursdayDate);
var friQuery = tasksRef.where("dateOfTask", "==", fridayDate);

/*  outputTasks(outputDoc, dayOfWeek) : takes in a task document and 
    outputs the document in a list item on the correct day of the week
    on the web page
*/
 outputDates();

function outputTasks(outputDoc, dayOfWeek){
  //console.log("in output tasks");
  //console.log("passed in: " + dayOfWeek);

  //add task already created to array  

let listToUpdate = null;
let taskListItemsRef = null;
let currentDay = "";
let deleteContainer = "";

switch(dayOfWeek){
  case 1:
    listToUpdate = document.getElementById("mon-tasks");
    monTaskDocs.push(outputDoc);
    taskListItemsRef = monTaskListItems;
    currentDay = "mon";
    deleteContainer = document.getElementById("deletecontainermon");
    break;
  case 2:
    listToUpdate = document.getElementById("tue-tasks");
    tueTaskDocs.push(outputDoc);
    taskListItemsRef = tueTaskListItems;
    currentDay = "tue";
    deleteContainer = document.getElementById("deletecontainertue");
    break;
  case 3:
    listToUpdate = document.getElementById("wed-tasks");
    wedTaskDocs.push(outputDoc);
    taskListItemsRef = wedTaskListItems;
    currentDay = "wed";
    deleteContainer = document.getElementById("deletecontainerwed");
    break;
  case 4:
    listToUpdate = document.getElementById("thu-tasks");
    thuTaskDocs.push(outputDoc);
    taskListItemsRef = thuTaskListItems;
    currentDay = "thu";
    deleteContainer = document.getElementById("deletecontainerthu");
    break;
  case 5:
    listToUpdate = document.getElementById("fri-tasks");
    friTaskDocs.push(outputDoc);
    taskListItemsRef = friTaskListItems;
    currentDay = "fri";
    deleteContainer = document.getElementById("deletecontainerfri");
    break;
  default:
    console.log("ERROR: NO LIST TO UPDATE");
  }

  //Create new element to hold document description
  let newElem = document.createElement("input");
  newElem.type = "text";
  newElem.maxLength = "30";
  newElem.value = outputDoc.data().description;

  let newListItem = document.createElement("li");
  newListItem.setAttribute("value", outputDoc.data().description);
  newListItem.appendChild(newElem);

  listToUpdate.appendChild(newListItem); 
  //taskListItemsRef.push(newListItem); //so it can be updated later
  taskListItemsRef.push(newElem); //changed

  //Create new element to hold delete button
  let newDeleteElem = document.createElement("img");
  //id of element: example - deletemon3 - third task of monday
  //dayOfWeek - 1 because the array is 0 indexed whereas the 
  //  dayOfWeek variable is 1-5
  newDeleteElem.id = "delete" + currentDay + numTasks[dayOfWeek - 1]++;
  newDeleteElem.className = "deletemark";
  newDeleteElem.src="images/deletemark.svg";
  console.log(numTasks.toString());
  newDeleteElem.addEventListener("click", deleteTask);
  deleteContainer.appendChild(newDeleteElem);

  // <img id="deletemark" src="images/deletemark.svg">
}

//Get the tasks for each day of the week 
//execute queries and store results

monQuery.get()
.then( function(querySnapshot) {
  //querySnapshot.forEach(outputTasks, 1); 
  querySnapshot.forEach( function (tasks) {
      outputTasks(tasks, 1);
    }
  );
});
tueQuery.get()
.then( function(querySnapshot) {
  //querySnapshot.forEach(outputTasks, 2); 
  querySnapshot.forEach( function (tasks) {
    outputTasks(tasks, 2);
  }
  );
});
wedQuery.get()
.then( function(querySnapshot) {
  //querySnapshot.forEach(outputTasks, 3); 
  querySnapshot.forEach( function (tasks) {
    outputTasks(tasks, 3);
  }
  );
});
thuQuery.get()
.then( function(querySnapshot) {
  //querySnapshot.forEach(outputTasks, 4); 
  querySnapshot.forEach( function (tasks) {
    outputTasks(tasks, 4);
  }
  );
});
friQuery.get()
.then( function(querySnapshot) {
  //querySnapshot.forEach(outputTasks, 5); 
  querySnapshot.forEach( function (tasks) {
    outputTasks(tasks, 5);
  }
  );
});

// ********************************************** 
// After initial web page setup
// **********************************************

/* User input */

let mon = document.getElementById("monday");
let tue = document.getElementById("tuesday");
let wed = document.getElementById("wednesday");
let thu = document.getElementById("thursday");
let fri = document.getElementById("friday");

/* 
*/
function addTask(event) {
    event.preventDefault();

    let tasklist = null;
    var taskDate = null;

    let taskDocsRef = null;
    let listItemsRef = null;

    let currentDay = "";  //holds "mon", "tues", etc
    let dayOfWeekIndex = -1;  //holds 0, 1, ... 4 based on day of week
    let deleteContainer = "";
    
    //based on which plus button was pressed, get various information
    if(event.target.id == "monplus"){
        tasklist = document.getElementById("mon-tasks");
        taskDate = mondayDate;
        taskDocsRef = monTaskDocs;
        listItemsRef = monTaskListItems;
        currentDay = "mon";
        dayOfWeekIndex = 0;
        deleteContainer = document.getElementById("deletecontainermon");
    } else if (event.target.id == "tueplus"){
        tasklist = document.getElementById("tue-tasks");
        taskDate = tuesdayDate;
        taskDocsRef = tueTaskDocs;
        listItemsRef = tueTaskListItems;
        currentDay = "tue";
        dayOfWeekIndex = 1;
        deleteContainer = document.getElementById("deletecontainertue");
    } else if (event.target.id == "wedplus"){
        tasklist = document.getElementById("wed-tasks");
        taskDate = wednesdayDate;
        taskDocsRef = wedTaskDocs;
        listItemsRef = wedTaskListItems;
        currentDay = "wed";
        dayOfWeekIndex = 2;
        deleteContainer = document.getElementById("deletecontainerwed");
    } else if (event.target.id == "thuplus"){
        tasklist = document.getElementById("thu-tasks");
        taskDate = thursdayDate;
        taskDocsRef = thuTaskDocs;
        listItemsRef = thuTaskListItems;
        currentDay = "thu";
        dayOfWeekIndex = 3;
        deleteContainer = document.getElementById("deletecontainerthu");
    } else if (event.target.id == "friplus"){
        tasklist = document.getElementById("fri-tasks");
        taskDate = fridayDate;
        taskDocsRef = friTaskDocs;
        listItemsRef = friTaskListItems;
        currentDay = "fri";
        dayOfWeekIndex = 4;
        deleteContainer = document.getElementById("deletecontainerfri");
    }

    db.collection("users").doc(userId)
    .collection("tasks").add({
      dateOfTask: taskDate,
      description: "",
      status: ""
    }).then( function(docRef){
      console.log("description: " + docRef.id);
      let docSnap = db.collection("users").doc(userId)
      .collection("tasks").doc(docRef.id).get()
      .then(function(snap){
        taskDocsRef.push(snap);
      });
    });
    
    let newElem = document.createElement("input");
    newElem.type = "text";
    newElem.maxLength = "30";

    let newListItem = document.createElement("li");
    newListItem.appendChild(newElem);

    tasklist.appendChild(newListItem);

    listItemsRef.push(newElem);

    //Create new element to hold delete button
    let newDeleteElem = document.createElement("img");
    //id of element: example - deletemon3 - third task of monday
    //dayOfWeek - 1 because the array is 0 indexed whereas the 
    //  dayOfWeek variable is 1-5
    newDeleteElem.id = "delete" + currentDay + numTasks[dayOfWeekIndex]++;
    newDeleteElem.className = "deletemark";
    newDeleteElem.src="images/deletemark.svg";
    console.log(numTasks.toString());
    newDeleteElem.addEventListener("click", deleteTask);
    deleteContainer.appendChild(newDeleteElem);
    return;
}

// updateTasks() - updates the firestore database
// to hold the current information for each task
function updateTasks(){
  let i1 = 0, i2 = 0, i3 = 0, i4 = 0, i5 = 0;
  
  monTaskListItems.forEach(
    function(item){
      //update value in corresponding doc element
      console.log("i1 " + i1);
      console.log("monTaskDocs[i1]: " + monTaskDocs[i1]);
      console.log("montaskdocs[i1]: " + monTaskDocs[i1].id);
      console.log("item.value" + item.value);

      monTaskDocs[i1].ref.update({
        description: item.value
      })
      .then(function(){console.log("doc written");})
      .catch(function(){console.log("error writing");});
      i1++;
    }
  ); //this block repeated for each day
  
   tueTaskListItems.forEach(
     function(item){
        //update value in corresponding doc element
        tueTaskDocs[i2].ref.update({
          description: item.value
        })
        .then(function(){console.log("doc written");})
        .catch(function(){console.log("error writing");});
        i2++;
     }
   );

   wedTaskListItems.forEach(
     function(item){
        //update value in corresponding doc element
        //console.log(wedTaskDocs[i3].description.dateOfTask);
        wedTaskDocs[i3].ref.update({
          description: item.value
        })
        .then(function(){console.log("doc written");})
        .catch(function(){console.log("error writing");});
        i3++;
     }
   );

   thuTaskListItems.forEach(
     function(item){
        //update value in corresponding doc element
        thuTaskDocs[i4].ref.update({
          description: item.value
        })
        .then(function(){console.log("doc written");})
        .catch(function(){console.log("error writing");});
        i4++;
     }
   );

   friTaskListItems.forEach(
     function(item){
        //update value in corresponding doc element
        friTaskDocs[i5].ref.update({
          description: item.value
        })
        .then(function(){console.log("doc written");})
        .catch(function(){console.log("error writing");});
        i5++;
     }
   );
}

function deleteTask(event) {
  event.preventDefault();
  console.log("in deleteTask");
  //remember it will have deletewed2 or something like that
  let eventId = event.target.id;
  let day = eventId.substring(6, 9);
  let num = eventId.substring(9, 10);  

  let documentArray = null;
  let taskListItemsArr = null;
  
  switch(day){
    case "mon":
      documentArray = monTaskDocs;
      taskListItemsArr = monTaskListItems;
      break;
    case "tue":
      documentArray = tueTaskDocs;
      taskListItemsArr = tueTaskListItems;
      break;
    case "wed":
      documentArray = wedTaskDocs;
      taskListItemsArr = wedTaskListItems;
      break;
    case "thu":
      documentArray = thuTaskDocs;
      taskListItemsArr = thuTaskListItems;
      break;
    case "fri":
      documentArray = friTaskDocs;
      taskListItemsArr = friTaskListItems;
      break;
    default: 
      console.log("error parsing day");
  }

  documentArray[num].ref.delete()
  .then(function(){
    console.log("document deleted");

  })
  .catch(function(e){
    console.log("error deleting document");
    console.log(e);
  });

  //remove the deleted task from the display
  taskListItemsArr[num].style.display = "none";
  //remove the delete button from the display 
  event.target.style.display = "none";

}

//Add event listeners to add task (plus) buttons
let monPlus = document.getElementById("monplus");
let tuePlus = document.getElementById("tueplus");
let wedPlus = document.getElementById("wedplus");
let thuPlus = document.getElementById("thuplus");
let friPlus = document.getElementById("friplus");

monPlus.addEventListener("click", addTask);
tuePlus.addEventListener("click", addTask);
wedPlus.addEventListener("click", addTask);
thuPlus.addEventListener("click", addTask);
friPlus.addEventListener("click", addTask);

let saveButton = document.getElementById("saveButton");
saveButton.addEventListener('click', updateTasks);

} // end afterInit()