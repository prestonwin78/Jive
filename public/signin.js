// when element with id submit is clicked
//  authenticate and then redirect to the calendar page
//  the calendar page will get the tasks

let submitButton = document.getElementById("submit");
let cancelButton = document.getElementById("cancel");

//localStorage.setItem("mytime", Date.now());
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// ***REMOVED***
firebase.auth().onAuthStateChanged( function(user){
    if(user){
        console.log("user signed in");
        console.log("user id: " + user.uid);
        //window.location.href = "./Calendar/calendar.html";
        //window.location.replace("./Calendar/calendar.html");
    } else {
        console.log("No user");
    }
});

function authenticateUser(event){
    event.preventDefault();

    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    
    let result = firebase.auth().signInWithEmailAndPassword(email, password)
    .then(
        (user) => {
            //alert("User: " + JSON.stringify(user));
            localStorage.setItem('userData', JSON.stringify(user));
            window.location.replace("./Calendar/calendar.html");
        }
    )
    .catch(console.log);
}


function cancelSignin(event){
    //When cancel pressed, redirect to 
    //main page
    window.location.href = "./index.html";
}


submitButton.addEventListener("click", authenticateUser);
cancelButton.addEventListener("click", cancelSignin);