import { displayLoginPopup } from './loginpopup.js';

export function displaySignupPopup () {
  $("#signup-page").show();

  $("#signup-cancel").on("click", () => {
    $("#signup-page").hide();
  })

  $("#signup-submit").on("click", () => {
    let email = $("#signup-email").val();
    let password = $("#signup-password").val();
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(() => {
      $("#signup-page").hide();
      $("#success-block").show();
      displayLoginPopup();
    })
    .catch((error) => {
      // TODO: catch error
    });
  })
}