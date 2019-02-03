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
  socket.on('userConnected', function(res){
    // Notification coté front si nouvelle utilisateur expecté l'user qui vient de se connecter
    socket.broadcast.emit('notifUserConnected', {message: res.username + 'est maintenant connécté'});
    // envoi du message de bienvenue pour l'user connécté
    io.sockets.connected[socket.id].emit('welcomeMessage', 'Hello, you\'re welcome' + res.username);
    // mise à jour du tableau user connécté coté serveur
    userConnected[res.user] = {id: res.user, username: res.username, socketId: socket.id};
    // mise à jour du tableau user connécté coté client
    io.emit('listeConnectedUser', userConnected);
  })

  // Gestion des messages privées
  socket.on('message', (message) => {
    // Persister les mp dans mongodb
    // create room first
    if ( message.tag === 'mp') {
      var roomName = message.idEnvoyeur + message.idReceveur;
      var Room = mongoose.model('Room');
      Room.findOne({name: roomName}).then(function(res) {
        if(!res) { 
          console.log('room introuvable du coup création room');
          saveNewRoomToDatabase(message).then(function(res) {
            console.log(res);
          });
      } else if (res) {
        res.mergeDiscussion(message.message);
      }

      })

    }

    // then insert message to room

    console.log(message.message);
    console.log('userConnected length' + JSON.stringify(userConnected.length));
    console.log('message tag ' + JSON.stringify(message.tag));

      for (var k in userConnected) {
        console.log('userConnected k ' + JSON.stringify(userConnected[k]));
        if (k === message.idReceveur) {
          console.log('condition socket destinataire  ' + userConnected[k].socketId);
          io.sockets.connected[userConnected[k].socketId].emit('privateMessage', message);
          console.log('Private message to ' + userConnected[k].socketId +' msg: ' + message.message);
        } else if (userConnected.length === 1 && message.tag === 'mp') {
          console.log('user not found');
          io.sockets.connected[userConnected[k].socketId].emit('privateMessage', message);
          console.log('force to emit');
        }
      }

    // console.log('idReceveur' + idReceveur);
    // io.emit('message', {type:'new-message', text: message});
  
    // Liste des utilisateurs connécté on demand
    if (message === 'getAllUserConnected') {
        const tabAj = [];
        for (const key in userConnected) {
          if (userConnected.hasOwnProperty(key)) {
            tabAj.push(userConnected[key]);
          }
        }
        io.emit('listeConnectedUser', tabAj);
    }

    // Gestion déconnection utilisateur
    if (message.message === 'disconnect') {
      var tab = [];
        for (const key in userConnected) {
          if (userConnected.hasOwnProperty(key) && key !== message.idUser) {
            tab.push(userConnected[key]);
          } else if (userConnected.hasOwnProperty(key) && key === message.idUser) {
            io.sockets.connected[userConnected[k].socketId].disconnect();
            console.log(userConnected[k].socketId + ' vient de se déconnécter');
          }
          
        }
        userConnected = tab;
        // io.emit('listeConnectedUser', tab);
        // console.log('liste updaté moins user déconnécté ' + JSON.stringify(tab));
    }

  });





  // déconnéction d'un utilisateur
  // socket.on('disconnect', function(socket) {
  //   io.sockets.connected[socket].disconnect();
  // });


});

function saveNewRoomToDatabase(params) {

  var Room = mongoose.model('Room');
  var User = mongoose.model('User');
  var room = new Room();
  Promise.resolve(
    User.findById(params.idReceveur)
  ).then(function(user) {
    room.name = params.idEnvoyeur + params.idReceveur;
    room.message = params.message;
    room.message.sender = user;

    return room.save().then(function(res){
      return res;
    })

  });
}
