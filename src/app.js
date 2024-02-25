var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const db = require('./db')
const session = require('express-session')
const SQLiteStore = require('connect-sqlite3')(session);
var indexRouter = require('../routes/index');
var adminRouter = require('../routes/admin');
const socketIO = require('socket.io')

var app = express();

// Create a server using the existing express app
const server = app.listen(3001, () => {
  console.log('Server is running on port 3001');
});

const io = socketIO(server);



class Player{
  constructor(id){
    this.id = id;
    this.x = undefined;
    this.y = undefined;
  }
  getPosition() {
    return { x: this.x, y: this.y };
  }
}

let players = {}; // Store players

// socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  // Create a new Player instance serverside
  let player = new Player(socket.id);
  players[socket.id] = player;

  // Broadcast the new user's information to all connected clients
  socket.broadcast.emit('newUserConnected', { playerId: socket.id, position: player.getPosition() });

  // Player positioning
  socket.on('playerPosition', (position) => {
    // Update the players position serverside
    player.x = position.x
    player.y = position.y

    //Broadcast the players new position
    socket.broadcast.emit('updatePlayerPosition', { playerId: socket.id, position: {x: player.x, y: player.y} });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    io.emit('userDisconnected', { playerId: socket.id });
    delete players[socket.id]
  });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// session setup
app.use(session({
  store: new SQLiteStore({ db: 'site.db' }),
  secret: 'anwdua9itjhuoj',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 30 }, // 30 min
  tz: 'UTC'
}));
app.use(express.static(path.join(__dirname, 'public')));



// defining routes
app.use('/', indexRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  req.db = db;
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// database querying
/*const queryUsers = 'SELECT * FROM users'

db.all(queryUsers,[],(err,rows)=>{
  if(err)return console.error(err.message)

  rows.forEach(row=>{
    console.log(row)
  })
})*/


module.exports = app;
