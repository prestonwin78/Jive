 export function displayLoginPopup(){
    //display overlay
    $("#login-page").show();

    //Add functionality to cancel and sign-in buttons
    $("#login-cancel").on("click", () => {
        console.log("hiding login page");
        $("#login-page").hide();
    })

    $("#login-submit").on("click", (e) => {
        e.preventDefault(); //don't submit form

        //get user email and password input
        let email = $("#login-email").val();
        let password = $("#login-password").val();

        //authenticate with firebase
        firebase.auth().signInWithEmailAndPassword(email, password)
        .then(
        (user) => {
            if(user){
                //if user successfully signs in, remove overlay
                $("#login-page").hide();
            } 
        }).catch(() => {
            //TODO: display error message
            //$("error-message").show();
        })
    });
}