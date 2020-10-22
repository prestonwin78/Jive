$(document).ready(() => {
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

export async function performRowAnimation(){
  let promise = new Promise((resolve, reject) => {
    initializeStyles()
    .then(async () => {
      await animateRows();
      resolve();
    })
  });
  await promise;
}

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

async function animateRows() {
  $("#day-row-1").show();
  $("#day-row-2").show();
  let promise1 = $("#day-row-1").animate({
    marginTop: "0px",
    opacity: "100%"
  }, 2000).promise();
  let promise2 = $("#day-row-2").animate({
    marginTop: "0px",
    opacity: "100%"
  }, 2000).promise();
  await Promise.all([promise1, promise2]);
}