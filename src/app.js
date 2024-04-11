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
    this.name;
    this.x = undefined;
    this.y = undefined;
    this.isSeeker = false;
    this.isDead = false;
  }
  getPosition() {
    return { x: this.x, y: this.y };
  }
}

let players = {}; // Store players

let gameState = {state:"running", time:10, winner:""}

let isGameStarted = false;

let shouldGameRun = true;

let stopGame = false;

function startGame(){
  gameState.state = "starting"
  let countdownTime = 10
  let gameTime = 20
  const startInterval = setInterval(function() {
    // Decrement the countdown time
    gameState.time = countdownTime
    console.log("Starttimer left: " + gameState.time)
    countdownTime--;
    // If the countdown reaches 0, change the game state and stop updating
    if (countdownTime == 0) {
      gameState.state = "running"
      clearInterval(startInterval);
      const gameInterval = setInterval(function() {
        // Decrement the countdown time
        gameState.time = gameTime
        console.log("Gametime left: " + gameState.time)
        gameTime--;

        if(stopGame){
          clearInterval(gameInterval)
          startGame()
          stopGame = false;
        }
        // If the countdown reaches 0, change the game state and stop updating
        if (gameTime == 0) {
          clearInterval(gameInterval);
          if(shouldGameRun /* boolean to keep running */){
            for(let key in players){
              players[key].isSeeker = false;
            }
            const keys = Object.keys(players);
            players[keys[Math.floor(Math.random() * keys.length)]].isSeeker = true;
            startGame()
          }
        }
      }, 1000);
    }
  }, 1000);
}

function checkDeadPlayers(){
  gameState.winner = ""
  let deadPlayers = 0;
  for(let key in players){
    if(players[key].isDead){
      deadPlayers++
    }
  }
  if(deadPlayers == Object.keys(players).length-1 && gameState.state == "running" && gameState.time>0){
    console.log("seeker")
    gameState.winner = "seeker"
    stopGame = true    
  }
  if(deadPlayers < Object.keys(players).length-1 && gameState.state == "running" && gameState.time == 2){
    console.log("hider")
    gameState.winner = "hider"
    stopGame = true
  }
}

  // 60hz gamestate emitter
  setInterval(() => {

    // see who is winner
    checkDeadPlayers()

    // Emit game state
    io.emit('gameState', gameState)
  }, 16);


// socket.io connection handling
io.on('connection', (socket) => {

  // Create a new Player instance serverside
  let player = new Player(socket.id);
  players[socket.id] = player;
  console.log('A user connected');


  // on connection what should be sent?
  if(Object.keys(players).length < 2){
    gameState.state = "running"
    gameState.time = 0
    gameState.winner = ""
    shouldGameRun = false
  }
  if(Object.keys(players).length>=2 && isGameStarted){
    // continue running
  }
  if(Object.keys(players).length==2 && !isGameStarted){
    for(let key in players){
      players[key].isSeeker = false;
    }
    const keys = Object.keys(players);
    players[keys[Math.floor(Math.random() * keys.length)]].isSeeker = true;
    shouldGameRun = true;
    startGame()
    isGameStarted = true;
  }



  // Broadcast the new user's information to all connected clients
  socket.broadcast.emit('newUserConnected', { playerId: socket.id, position: player.getPosition() });

  // Player positioning
  socket.on('playerInformation', (data) => {
    // Update the players position serverside
    player.x = data.x
    player.y = data.y
    player.isDead = data.isDead
    player.name = data.name

    //Broadcast the players new position
    socket.broadcast.emit('updatePlayerPosition', { playerId: socket.id, position: {x: player.x, y: player.y}, role: player.isSeeker, isDead: player.isDead, name: player.name });
  });



  socket.on('disconnect', () => {
    console.log('User disconnected');
    
    io.emit('userDisconnected', { playerId: socket.id });
    delete players[socket.id]

    if(Object.keys(players).length<2){
      gameState.state = "running"
      gameState.time = 0
      gameState.winner = ""
    }
    else{

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
