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
      for (var k in userConnected) {
        if (k === message.idReceveur) {
          console.log('condition socket destinataire  ' + userConnected[k].socketId);
          io.sockets.connected[userConnected[k].socketId].emit('privateMessage', message);
          console.log('Private message ' + userConnected[k].socketId +'msg: ' + message.message);
        }
      }
    // console.log('idReceveur' + idReceveur);
    // io.emit('message', {type:'new-message', text: message});    
  });

  // déconnéction d'un utilisateur
  socket.on('manual-disconnection', function(socket) {
    console.log(JSON.stringify(socket) + ' est déconnécté');
  });


});