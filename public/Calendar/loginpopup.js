 export function displayLoginPopup(){
    //display overlay
    let overlay = document.getElementById("overlay");
    overlay.style.display = "block";

    //Add functionality to cancel and sign-in buttons
    let cancelButton = document.getElementById("cancel-button");
    let submitButton = document.getElementById("signin-button");

    cancelButton.addEventListener("click", function(e){
        e.preventDefault();
        //redirect to home page
        window.location.href = "../index.html";
    });

    submitButton.addEventListener("click", function(e){
        e.preventDefault(); //don't submit form

        //get user email and password input
        let email = document.getElementById("usernameinput").value.toString();
        let password = document.getElementById("passwordinput").value;

        //authenticate with firebase
        firebase.auth().signInWithEmailAndPassword(email, password)
        .then(
        (user) => {
            if(user){
                //if user successfully signs in, remove overlay
                //and proceed to main logic
                let overlay = document.getElementById("overlay");
                overlay.style.display = "none";
                afterInit();  //main logic
            } 
        }).catch(function(e){
            //display error message
            document.getElementById("error-message").style.display = "inline-block";
        });
    });
}