////// Add data to list ///////

function getListData(){
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: '/user/listView',
    success: function(data){
      for (var i = 0; i < data.length; i++) {
        var time = new Date(data[i].start)
        $(".list").append("<tr><td>" + data[i].team_id + "</td><td>" + time + "</td><td>" + data[i].jobtype + "</td><td>" + data[i].address + "</td><td>" + data[i].phone + "</td></tr>");
      };
    }
  });
};

$(document).ready(function(){
  getListData();
});
