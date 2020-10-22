$(document).ready(() => {
  initializeStyles()
  .then(() => {
    animateRows();
  })
  $(".daycard")
    .on('mouseenter', (event) => {
      $(event.currentTarget).find(".delete-container").css({
        visibility: "visible"
      });
      $(event.currentTarget).find(".plus-container").css({
        visibility: "visible"
      });
    })
    .on('mouseleave', (event) => {
      $(event.currentTarget).find(".delete-container").css({
        visibility: "hidden"
      });
      $(event.currentTarget).find(".plus-container").css({
        visibility: "hidden"
      });
    });
});

async function initializeStyles(){
  $("#day-row-1").css({
    marginTop: "50px",
    opacity: "0%",
    visibility: "visible"
  });
  $("#day-row-2").css({
    marginTop: "50px",
    opacity: "0%",
    visibility: "visible"
  });
}

function animateRows() {
  $("#day-row-1").show();
  $("#day-row-2").show();
  $("#day-row-1").animate({
    marginTop: "0px",
    opacity: "100%"
  }, 2000);
  $("#day-row-2").animate({
    marginTop: "0px",
    opacity: "100%"
  }, 2000);
}