// when element with id submit is clicked
//  authenticate and then redirect to the calendar page
//  the calendar page will get the tasks

let submitButton = document.getElementById("submit");
let cancelButton = document.getElementById("cancel");

function processNewUser(event){
    event.preventDefault();
    
    //Get email user input
    let email = document.getElementById("email").value;
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    
    //TODO: verify complexity requirements
    
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then( function() {
       let id = firebase.auth().currentUser.uid;
       console.log("user id: " + id);

       //create new user document in Firestore which
       //references the user ID in Firebase auth
       let db = firebase.firestore();
       db.collection("users").doc(id).set({
            email: email,
            firstName: "",
            userID: id
       });
    });
}

function cancelSignup(event){
    //When cancel pressed, redirect to 
    //main page
    window.location.href = "./index.html";
}


submitButton.addEventListener("click", processNewUser);
cancelButton.addEventListener("click", cancelSignup);

