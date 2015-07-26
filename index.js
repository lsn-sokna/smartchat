  //modules
  var express = require('express');
  var app = express();
  var http = require('http').Server(app);
  var io = require('socket.io')(http);
  var bodyParser = require('body-parser');
  var Parse = require('parse').Parse;
  var cookieParser = require('cookie-parser');
  var flash = require('connect-flash');
  var session = require('express-session');
  var multer = require('multer');
  var fs = require('fs');
  var request = require('request');

  var users = [];
  //app configuration
  var ParseAppKey = 'YOUR_APP_KEY';
  var ParseAPIKey = 'YOUR_API_KEI';
  Parse.initialize('YOUR_APP_KEY_HERE', 'YOUR_JAVASCRIPT_KEY');
  app.set('port', (process.env.PORT || 5000));
  app.set('view engine', 'ejs');
  app.use(cookieParser('secret'));
  app.use(session({
    secret: 'soknaly086216261',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 3600000
    }
  }));
  app.use(multer({
    dest: '/tmp/'
  }));
  app.use(bodyParser.urlencoded({
    extended: false
  }));
  app.use(flash());

  //helper functions

  var serialize = function(obj) {
    var str = [];
    for (var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
  }

  var rand = function() {
    return Math.random().toString(36).substr(2);
  };

  var token = function() {
    return rand() + rand();
  };

  function getCurrentUser(sessionToken, response) {
    var options = {
      uri: 'https://api.parse.com/1/users/me',
      method: 'GET',
      headers: {
        "X-Parse-Application-Id": ParseAppKey,
        "X-Parse-REST-API-Key": ParseAPIKey,
        "X-Parse-Session-Token": sessionToken
      }
    };
    request(options, function(error, body, res) {
      response(JSON.parse(res));
    });
  };

  io.on('connection', function(socket) {
    console.log('connected to socket');
    socket.on('join', function(data) {
      console.log(displayName + ' joined chat room');
      io.sockets.emit('join', data);
    });
    socket.on('disconnect', function() {

    })
  })

  //set routes
  app.get('/index', function(request, response) {
    response.sendFile(__dirname + '/index.html');
  });

  app.get('/', function(request, response) {
    if (request.session.user) {
      var user = request.session.user;
      var query = new Parse.Query(Parse.User);
      query.get(user.objectId, {
        success: function(result) {
          result.set('online', true);
          result.save();
        },
        error: function(error) {
        }
      });
      io.sockets.emit('join', {
        id: user.objectId,
        name: user.displayName
      });
      response.render(__dirname + '/views/pages/main', {
        user: user
      });
    } else {
      response.render(__dirname + '/views/pages/login');
    }
  });

  app.get('/src/:foldername/:filename', function(request, response, next) {
    var foldername = request.params.foldername;
    var filename = request.params.filename;
    response.sendFile(__dirname + '/dist/' + foldername + '/' + filename);
  });

  app.get('/src/:foldername/:childname/:filename', function(request, response, next) {
    var foldername = request.params.foldername;
    var childname = request.params.childname;
    var filename = request.params.filename;
    var path = __dirname + '/dist/' + foldername + '/' + childname + '/' + filename;
    response.sendFile(path);
  });

  app.get('/views/:foldername/:filename', function(request, response) {
    var foldername = request.params.foldername;
    var filename = request.params.filename;
    response.sendFile(__dirname + '/views/' + foldername + '/' + filename);
  });

  app.get('/login', function(request, response) {
    response.redirect('/');
  });

  app.post('/login', function(req, response) {
    var email = req.body.email;
    var password = req.body.password;
    Parse.User.logIn(email, password, {
      success: function(user) {
        req.session.user = user;
        response.redirect('/');
      },
      error: function(error) {
        response.send(error);
      }
    });
  })

  app.get('/signup', function(request, response) {
    response.redirect('/');
  })

  app.get('/logout', function(request, response) {
    Parse = require('parse').Parse;
    Parse.User.logOut();
    request.session.user = null;
    response.redirect('/');
  })

  app.post('/signup', function(request, response) {
    var email = request.body.email;
    var password = request.body.password;
    var displayName = request.body.fullname;
    console.log(email);
    console.log(password);
    var file = request.files.profile;
    var fileName = token() + '.' + file.extension;
    fs.readFile(file.path, function(error, data) {
      console.log(data.toString('base64'));
      if (data) {
        var imgBase64 = data.toString('base64');
        var profileImage = new Parse.File(fileName, {
          base64: imgBase64
        });
        profileImage.save().then(function() {
          var user = new Parse.User();
          user.set('username', email);
          user.set('password', password);
          user.set('email', email);
          user.set('displayName', displayName);
          user.set('profile', profileImage);
          user.signUp(null, {
            success: function(user) {
              console.log('Sign up success! Weclome ' + user.get('displayName'));
              request.session.user = user;
              response.redirect('/');
            },
            error: function(user, error) {
              console.log(error.message);
              response.send('Error: ' + error.message);
            }
          });
        }, function(error) {

        });
      }
    });
  });

  app.get('/getmessages', function(request, response) {
    var msgObj = Parse.Object.extend('Message');
    var query = new Parse.Query(msgObj);
    query.include('user');
    query.find({
      success: function(messages) {
        var results = [];
        for (var key in messages) {
          var msg = messages[key];
          var user = {
            id: msg.get('user').id,
            name: msg.get('user').displayName,
            profileURL: msg.get('user').get('profile').url()
          }
          var message = {
            message: msg.get('message'),
            user: user,
            created_at: msg.createdAt,
          }
          results.push(message);
        }
        response.send(results);
      },
      error: function(error) {
        response.send(error);
      }
    });
  })

  app.post('/add_gchat', function(request, response) {
    console.log('add_chat called');
    console.log(request.body.message);
    var message = request.body.message;
    var Message = Parse.Object.extend('Message');
    var msg = new Message();
    msg.set('message', message);
    console.log(request.session.user.objectId);
    msg.set('userid', request.session.user.objectId);
    io.sockets.emit('chat', {
      message: message,
      profileURL: request.session.user.profile.url
    })
    msg.save(null, {
      success: function(result) {
        response.send(result);
      },
      error: function(result, error) {
        response.send(error);
      }
    });

  })

  app.get('/getusers', function(request, response) {
    var query = new Parse.Query(Parse.User);
    query.find({
      success: function(user_result) {
        response.send(user_result);
      },
      error: function(error) {
        response.send(error.message);
      }
    });
  });

  app.post('/users/', function(request, response) {
    var action = request.body.action;
    var user = request.body.user;
    Parse.Cloud.run('setStatus', {
      user: user,
      status: action == 'online' ? true : false
    }, {
      success: function(result) {
        response.send(result)
      },
      error: function(error) {
        response.send(error.message);
      }
    });
  })

  http.listen(app.get('port'), function() {
    console.log('Listening to *: ' + app.get('port'));
  });
