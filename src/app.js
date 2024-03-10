var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//const db = require('./db')
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
    this.isSeeker = false;
  }
  getPosition() {
    return { x: this.x, y: this.y };
  }
}

let players = {}; // Store players

let gameState = {state:"starting", time:10}

function startGame(){
  let countdownTime = 10
  const countdownInterval = setInterval(function() {
    // Decrement the countdown time
    countdownTime--;
    gameState.time = countdownTime

    // If the countdown reaches 0, change the game state and stop updating
    if (countdownTime < 1) {
      gameState.state = "running"
      clearInterval(countdownInterval);
    }
  }, 1000);
}




// socket.io connection handling
io.on('connection', (socket) => {

  // Create a new Player instance serverside
  let player = new Player(socket.id);
  players[socket.id] = player;

  // gamestate
  console.log('A user connected');



  if(Object.keys(players).length<2){
    socket.broadcast.emit('gameState', {state:"running", time:0})
  }
  else{
    const keys = Object.keys(players);
    players[keys[0]].isSeeker = true;
    startGame()
  }



  // Broadcast the new user's information to all connected clients
  socket.broadcast.emit('newUserConnected', { playerId: socket.id, position: player.getPosition() });

  // Player positioning
  socket.on('playerPosition', (position) => {
    // Update the players position serverside
    player.x = position.x
    player.y = position.y

    //Broadcast the players new position
    socket.broadcast.emit('updatePlayerPosition', { playerId: socket.id, position: {x: player.x, y: player.y}, role: player.isSeeker });
  });

  socket.on('requestState', ()=>{
    socket.broadcast.emit('gameState', gameState)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected');
    io.emit('userDisconnected', { playerId: socket.id });
    delete players[socket.id]

    if(Object.keys(players).length<2){
      io.emit('gameState', {state:"running", time:0})
    }
    else{
      startGame()
    }
  });
});

// view engine setup
app.set('views', path.join(__dirname, '../views'));
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
app.use(express.static(path.join(__dirname, '../public')));



// defining routes
app.use('/', indexRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
const notFoundHandler = (req, res, next) => {
  const ipAddress = req.ip.replace(/^::ffff:/, ''); // Remove the IPv6 part
  console.log('Client IP Address:', ipAddress);
  res.status(404).json({
      error: 404,
      message: "Route not found."
    })
    
  // Gracefully shut down the server
  server.close(() => {
    console.log('Server is shutting down');
    process.exit(0); // Exit the process (optional)
  });
  }
  app.use(notFoundHandler);




// database querying
/*const queryUsers = 'SELECT * FROM users'

db.all(queryUsers,[],(err,rows)=>{
  if(err)return console.error(err.message)

  rows.forEach(row=>{
    console.log(row)
  })
})*/


module.exports = app;
