$(document).ready(function() {
  $.ajax({
    type: "GET",
    datatype: "json",
    url: "/user/authorize",
    success: function() {
      console.log("success");
    }
  })
});



////// Profile Button Div Switch /////

$(".menu button").on("click", function(){
  var button_id = "." + $(this).attr("id");
  $(".credentials").hide();
  $(".team_management").hide();
  $(".user_management").hide();
  $(button_id).show();
});
