var socket = io();
socket.on('join', function(data) {
  console.log('ID: ' + data.id + ", " + data.name + ' is online now!.');
  $("#people").find('[data-id="' + data.id + '"]').show();
  $.ajax({
    url: '/users',
    type: 'POST',
    data: {
      action: 'online',
      user: data.id
    },
    success: function(result) {

    },
    error: function(error) {

    }
  });
});
socket.on('connection', function() {
  console.log("I'm online");
});

socket.on('disconnect', function() {
  console.log("I'm offline");
});

socket.on('chat', function(data) {
  $('li').last().removeAttr('tabindex');
  add_new_message(data.message, data.profileURL, true);
  $('li').last().focus();
})


$(document).ready(function() {
  $('#dropdown').dropdown({
    hover: false
  });
});
$(function() {
  $('#message').bind("enterKey", function(e) {
    send();
    $('#message').val('');
  });
  $('#message').keyup(function(e) {
    if (e.keyCode == 13) {
      $(this).trigger("enterKey");
    }
  });
  var getPeople = function() {
    $.ajax({
      url: '/getusers',
      type: 'GET',
      success: function(result) {
        for (var ind in result) {
          var user = result[ind];
          var profile = user.profile;
          console.log(user);
          var display = '';
          if (!user.online) {
            display = 'style="display:none";'
          }
          var li = "<li><a href='#''><img align='middle' width='44px' height='44px' class='circle' src='" + profile.url + "'/>   " + user.displayName + '<div class="online-badge" ' + display + ' data-id="' + user.objectId + '""></div></a></li>';
          //console.log(li);
          $('#people').append(li);
          $('#spinner').remove();
        }
      },
      error: function() {
        alert("well this is embarassing... if the problem persists please let us know at facebook.com/stembuds");
      }
    });
  }

  var getMessages = function() {
    $.ajax({
      url: '/getmessages',
      type: 'GET',
      success: function(result) {
        var count = 0;
        for (var key in result) {
          var msg = result[key];
          var user = msg.user;
          var isLast = false;
          if (count == result.length - 1)
            isLast = true;
          add_new_message(msg.message, user.profileURL, isLast);
          count++;
        }
        $('li').last().focus();
        $('#spinner-chat').remove();
      },
      error: function(error) {
        console.log(error);
      }
    });
  }
  $('#chat-box').ready(getMessages);
  $('#sidebar').ready(getPeople);
});
$('form').submit(function() {
  add_gchat();
})

function add_new_message(message, imgURL, isLast) {
  var li = '<li ' + (isLast ? "tabindex='1'" : '') + ' class="collection-item"><img src="' + imgURL + '" width="30px" height="30px" class="circle"/>' + message + '</li>';
  $('#chat-messages').append(li);
}

var send = function() {
  var message = $('#message').val();
  $.ajax({
    url: '/add_gchat',
    type: 'POST',
    data: {
      message: message
    },
    success: function(result) {
      console.log(result);
    },
    error: function(error) {
      console.log(error);
    }
  });
};
