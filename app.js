var http = require('http'),
    path = require('path'),
    methods = require('methods'),
    express = require('express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    cors = require('cors'),
    passport = require('passport'),
    errorhandler = require('errorhandler'),
    mongoose = require('mongoose');

var isProduction = process.env.NODE_ENV === 'production';


// Create global app object
var app = express();

app.use(cors());
// Enable CORS from client-side
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});
// Normal express config defaults
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(require('method-override')());
app.use(express.static(__dirname + '/public'));

app.use(session({ secret: 'conduit', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }));

if (!isProduction) {
  app.use(errorhandler());
}

if(isProduction){
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect('mongodb://localhost/conduit');
  mongoose.set('debug', true);
}

require('./models/User');
require('./models/Article');
require('./models/Comment');
require('./models/Response');
require('./models/Message');
require('./models/Room');
require('./config/passport');
require('./socket.js');

app.use(require('./routes'));

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found lesy ry letié');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function(err, req, res, next) {
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({'errors': {
      message: err.message,
      error: err
    }});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({'errors': {
    message: err.message,
    error: {}
  }});
});


// finally, let's start our server...
var server = app.listen( process.env.PORT || 3000, function(){
  console.log('Listening on port ' + server.address().port);
});


let io = require('socket.io')(server);

// tableau id des utilisateurs connécté
let userConnected = {};

// Listening des connexions des utilisateurs
io.on('connection', function (socket) {
  
  // Gestion des utilisateurs
  socket.on('message', function(res){
    if (res.tag === 'userConnected') {
        userConnected[res.user] = {id: res.user, username: res.username, socketId: socket.id};
        socket.broadcast.emit('message', {tag: 'notifUserConnected', body: res.username + 'est maintenant connécté'});
        io.sockets.connected[socket.id].emit('message', {tag: 'welcomeMessage', body: 'Hello, you\'re welcome' + res.username});

        // Envoi liste user connected
        const tab = [];
        for (const key in userConnected) {
          if (userConnected.hasOwnProperty(key)) {
            tab.push(userConnected[key]);
          }
        }
        const msg = {tag: 'listUserConnected', users: tab}
        io.emit('message', msg);
        console.log('111111111111111111111111111111');
    }

    if ( res.tag === 'mp') {
      for (var k in userConnected) {
        if (k === res.idReceveur || k === res.idEnvoyeur) {
          io.sockets.connected[userConnected[k].socketId].emit('message', res);
        } 
      }
    }

    // if (res.tag === 'getAllUserConnected') {
    //   const tabAj = [{tag: 'getAllUserConnected'}];
    //   for (const key in userConnected) {
    //     if (userConnected.hasOwnProperty(key)) {
    //       tabAj.push(userConnected[key]);
    //     }
    //   }
    //   io.emit('message', tabAj);
    //   console.log('44444444444444444444444444444444444');
    // }

    if (res.tag === 'disconnect') {
      var tab = [];
        for (const key in userConnected) {
          if (userConnected.hasOwnProperty(key) && key !== message.idUser) {
            tab.push(userConnected[key]);
          } else if (userConnected.hasOwnProperty(key) && key === message.idUser) {
            if (io.sockets.connected[userConnected[key]]) {
              io.sockets.connected[userConnected[key].socketId].disconnect();
              console.log('5555555555555555555555555555555');
            } else {
              console.log('Socket not found');
            }
            
            console.log(userConnected[key].socketId + ' vient de se déconnécter');
          }
        }
        userConnected = tab;
        io.emit('message', tab);
        // console.log('liste updaté moins user déconnécté ' + JSON.stringify(tab));
    }

  })
});
