

////// Map List Switch ///////

  $(".switch").change(function() {
      var userinput = $(this);
      if (userinput.prop("checked")){
        $("#map").show();
        $("#list").hide();
      } else {
        $("#map").hide();
        $("#list").show();
      }
    });


////// Add data to list ///////


function getListData(){
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: '/user/listView',
    success: function(data){
      console.log(data);
    }
  });
};

$(document).ready(function(){
  getListData();
});
