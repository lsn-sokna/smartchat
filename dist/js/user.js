

$(document).ready(function () {
  $('#spinner').hide();
  var login = function(){
    $('#spinner').show();
    var email = $('#email').val();
    var password = $('#password').val();
    console.log(email + ', ' + password);
    $.ajax({
      url:'/login',
      type:'POST',
      data: {
        email:email,
        password:password
      },
      success:function(result){
        location.reload();
      },
      error:function(error){
        console.log(error);
      }
    });
  }
  $('#password').bind("enterKey", function(e) {
    login();
  });
  $('#password').keyup(function(e) {
    if (e.keyCode == 13) {
      $(this).trigger("enterKey");
    }
  });
  $('#submit-btn').click(login);
})
