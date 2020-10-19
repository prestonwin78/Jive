$(document).ready(() => {
  console.log("doc ready");
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