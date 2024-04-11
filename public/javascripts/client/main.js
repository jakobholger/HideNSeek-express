// setup canvas
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// scale all object depending on  canvas width // height
let scale = Math.min(canvas.width / 800, canvas.height / 600);

let speed = 1.8

let gameState = {state:undefined, time:10, winner:undefined};

let isMovingUp = false;
let isMovingDown = false;
let isMovingLeft = false;
let isMovingRight = false;

let isGameStarting = true

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  scale = Math.min(canvas.width / 800, canvas.height / 600);
});

// imports
import Barrier from './barrier.js'
import { checkCollision } from './utilities/collision.js';
import { lineRect } from './utilities/visibility.js';

let worldBorder = []
//top
worldBorder.push(new Barrier(-2000, -2000, 4000, 1000))

// bottom
worldBorder.push(new Barrier(-2000, 1000, 4000, 1000))

// left
worldBorder.push(new Barrier(-2000, -2000, 1000, 4000))

//right
worldBorder.push(new Barrier(1000, -2000, 1000, 4000))

let barriers = []

// create spawnbox, draw later in program
barriers.push(new Barrier(-100, -100, 200, 3))
barriers.push(new Barrier(-100, -100, 3, 200))
barriers.push(new Barrier(100, -100, 3, 200))

// around spawnarea
// topleft corner
barriers.push(new Barrier(-300, -300, 200, 3))
barriers.push(new Barrier(-300, -300, 3, 200))
// topright corner
barriers.push(new Barrier(100, -300, 200, 3))
barriers.push(new Barrier(300, -300, 3, 200))
//bottomleft corner
barriers.push(new Barrier(-300, 100, 3, 200))
barriers.push(new Barrier(-300, 300, 200, 3))
//bottom right corner
barriers.push(new Barrier(300, 100, 3, 200))
barriers.push(new Barrier(100, 300, 200, 3))

// barrier right spawn exit
barriers.push(new Barrier(500,-200,3,400))
barriers.push(new Barrier(500,0,300,3))

// right side of map
barriers.push(new Barrier(500,-750,3,300))
barriers.push(new Barrier(650,-500,150,3))

//box top right spawn
barriers.push(new Barrier(175,-612,150,150))

//barrier top spawn exit
barriers.push(new Barrier(1.5,-550,3,-200))
barriers.push(new Barrier(-400,-750,900,3))

//barrier top spawn exit
barriers.push(new Barrier(1.5,-550,3,-200))
barriers.push(new Barrier(-400,-750,800,3))

// spawn door
let spawnDoor = new Barrier(-100,100,200,3)

// playerclass
class Player{
  constructor(name){
    this.name = name
    this.isDead = false;
    this.isSeeker = false;
    this.isColliding = false
    this.width = 80
    this.drawX = canvas.width/2 - this.width/2
    this.height = 80
    this.drawY = canvas.height/2 - this.height/2
    this.x = 0 - this.width/2;
    this.y = 0 - this.height/2;
    this.dx = 0
    this.dy = 0
    this.previousX = 0 - this.width/2;
    this.previousY = 0 - this.height/2;
  }
  updatePosition(){
    this.drawX = canvas.width/2 - this.width/2
    this.drawY = canvas.height/2 - this.height/2
    if(isMovingUp){
      this.dy = -speed
    }
    if(isMovingDown){
      this.dy = speed
    }
    if(isMovingRight){
       this.dx = speed
    }
    if(isMovingLeft){
       this.dx = -speed
    }
    if(!isMovingUp && !isMovingDown){
      this.dy = 0
    }
    if(!isMovingRight && !isMovingLeft){
      this.dx = 0
    }
    this.x+=this.dx
    this.y+=this.dy
  }
  checkCollisions(){
    for(let i=0;i<barriers.length;i++){
      if(checkCollision(this,barriers[i]) && !this.isDead){
          this.x = this.previousX
          this.y = this.previousY
        }
    }
    if(this.x<-1000){
      this.x=-1000
    }
    if(this.x+this.width>1000){
      this.x=1000-this.width
    }
    if(this.y+this.height>1000){
      this.y=1000-this.height
    }
    if(this.y<-1000){
      this.y=-1000
    }
    if(this.x>spawnDoor.x && this.x+this.width<spawnDoor.x+spawnDoor.width
      && gameState.state == "starting" && this.isSeeker && this.y+this.height>spawnDoor.y){
        this.y = spawnDoor.y-this.height
    }
  } 
  draw(){
    this.previousX = this.x
    this.previousY = this.y
    this.updatePosition()
    this.checkCollisions()
    if(this.isDead){
      ctx.fillStyle = "rgba(255,255,255,0.4)"
      ctx.fillRect(this.drawX,this.drawY,this.width,this.height)
      ctx.font = "40px serif";
      ctx.fillStyle = "red"
      ctx.fillText("WASTED", canvas.width/2-ctx.measureText("WASTED").width/2, canvas.height/2 - 60)
    }
    else{
      ctx.fillStyle = "blue"
      ctx.fillRect(this.drawX,this.drawY,this.width,this.height)
      ctx.font = "20px serif";
      ctx.fillText(this.name, canvas.width/2-ctx.measureText(this.name).width/2, canvas.height/2 - 60)
    }
  }
}

let player = new Player(playerUsername)

class Enemy{
  constructor(id){
    this.id = id
    this.name = ""
    this.isDead = false;
    this.isVisible = true;
    this.width = 80
    this.x = canvas.width/2 - this.width/2;
    this.height = 80
    this.y = canvas.height/2 - this.height/2;
    this.isSeeker = false;
  }
  updatePosition(){
    this.width = 80 
    this.height = 80
  }
  draw(){
    this.updatePosition() 

        if(checkCollision(this,player) && this.isSeeker && gameState.state == "running"){
            player.isDead = true;
          }


      let hit = lineRect(player.x + player.width/2, player.y + player.height/2, this.x + this.width/2, this.y + this.height/2, spawnDoor.x
        , spawnDoor.y, spawnDoor.width, spawnDoor.height)
        /*ctx.strokeStyle = "white"
        ctx.beginPath()
        ctx.moveTo((canvas.width/2-player.width/2 - player.x + this.x) + this.width/2 , (canvas.height/2-player.height/2 - player.y + this.y) + this.height/2)
        ctx.lineTo(player.x + player.width/2, player.y + player.height/2)
        ctx.stroke()*/

      if(hit && gameState.state == "starting" && player.isSeeker && gameState.time >= 0){
        this.isVisible = false;
      }
    

    for(let i=0;i<barriers.length;i++){
      let hit = lineRect(player.x + player.width/2, player.y + player.height/2, this.x + this.width/2, this.y + this.height/2, barriers[i].x
        , barriers[i].y, barriers[i].width, barriers[i].height)
        /*ctx.strokeStyle = "white"
        ctx.beginPath()
        ctx.moveTo((canvas.width/2-player.width/2 - player.x + this.x) + this.width/2 , (canvas.height/2-player.height/2 - player.y + this.y) + this.height/2)
        ctx.lineTo(player.x + player.width/2, player.y + player.height/2)
        ctx.stroke()*/

      if(hit && !player.isDead){
        this.isVisible = false;
        break;
      }
    }
    // hiders are red for seeker
    if(this.isVisible && !this.isDead && player.isSeeker){
      ctx.fillStyle = "red"
      ctx.fillRect(canvas.width/2-player.width/2 - player.x + this.x,canvas.height/2-player.height/2 - player.y + this.y,this.width,this.height)
      ctx.font = "20px serif";
      ctx.fillText(this.name, canvas.width/2-player.width/2 - player.x + this.x - ctx.measureText(this.name).width/2 + this.width/2, canvas.height/2-player.height/2 - player.y + this.y - 20)
    }
    // friendly
    if(this.isVisible && !this.isDead && !this.isSeeker && !player.isSeeker){
      ctx.fillStyle = "lightblue"
      ctx.fillRect(canvas.width/2-player.width/2 - player.x + this.x,canvas.height/2-player.height/2 - player.y + this.y,this.width,this.height)
      ctx.font = "20px serif";
      ctx.fillText(this.name, canvas.width/2-player.width/2 - player.x + this.x - ctx.measureText(this.name).width/2 + this.width/2, canvas.height/2-player.height/2 - player.y + this.y - 20)
    }
    // enemy seeker
    if(this.isVisible && !this.isDead && this.isSeeker){
      ctx.fillStyle = "red"
      ctx.fillRect(canvas.width/2-player.width/2 - player.x + this.x,canvas.height/2-player.height/2 - player.y + this.y,this.width,this.height)
      ctx.font = "20px serif";
      ctx.fillText(this.name, canvas.width/2-player.width/2 - player.x + this.x - ctx.measureText(this.name).width/2 + this.width/2, canvas.height/2-player.height/2 - player.y + this.y - 20)
    }
    // player and enemy is dead
    if(this.isDead && player.isDead){
      ctx.fillStyle = "rgba(255,255,255,0.4)"
      ctx.fillRect(canvas.width/2-player.width/2 - player.x + this.x,canvas.height/2-player.height/2 - player.y + this.y,this.width,this.height)
      ctx.font = "20px serif";
      ctx.fillText(this.name, canvas.width/2-player.width/2 - player.x + this.x - ctx.measureText(this.name).width/2 + this.width/2, canvas.height/2-player.height/2 - player.y + this.y - 20)
    }
    else{
      this.isVisible = true;
    }
  }
}


let enemies = [];


document.addEventListener('DOMContentLoaded', function () {
  const socket = io(); // Connect to the server

  // on receive of connectedUsers

  socket.on('newUserConnected',(data)=>{
    console.log('New user connected:', data)
    enemies.push(new Enemy(data.playerId));
  })

  setInterval(() => {
    socket.emit('playerInformation', { id: socket.id ,x: player.x, y: player.y, isDead:player.isDead, name:player.name})
  }, 16);


  socket.on('gameState',(data)=>{
    gameState.state = data.state;
    gameState.time = data.time;
    gameState.winner = data.winner;

    if(gameState.state == "starting" && !isGameStarting){
      player.x = -40
      player.y = -40
      player.isDead = false;
      isGameStarting = true;
    }
    if(gameState.winner == "seeker"){
      console.log("seeker won")
      player.isDead = false;
      isGameStarting = false;
      // display message seeker win
    }
    if(gameState.winner == "hider"){
      console.log("hider won")
      player.isDead = false;
      isGameStarting = false;
      // display message hider win
    }
  })

  socket.on('updatePlayerPosition',(data) => {

    //console.log(data)
    

    const foundObject = enemies.find(obj => obj.id === data.playerId);

    if(foundObject){
      //console.log("Player already in array.")
    }
    else{ 
      enemies.push(new Enemy(data.playerId))
    }
    const enemyToUpdate = enemies.find(enemy => enemy.id === data.playerId);
    if (enemyToUpdate) {
      enemyToUpdate.x = data.position.x;
      enemyToUpdate.y = data.position.y;
      enemyToUpdate.isSeeker = data.role
      enemyToUpdate.isDead = data.isDead
      enemyToUpdate.name = data.name
    }
  });

  socket.on('userDisconnected',(data) => {
    console.log('A user disconnected:', data);
    const index = enemies.findIndex(enemy => enemy.id === data.playerId);
    if (index !== -1) {
      enemies.splice(index, 1);
    }
  });
  
});

function animate(){
  // clear background with black
  ctx.fillStyle = "black"
  ctx.fillRect(0,0,canvas.width,canvas.height)

  // draw world border
  ctx.fillStyle = "white"
  for(let i=0;i<worldBorder.length;i++){
    worldBorder[i].draw(ctx, canvas, player, "white")
  }

  // draw a barriers
  for(let i=0;i<barriers.length;i++){
    barriers[i].draw(ctx, canvas, player, "white")
  }
  
    // Draw enemies
    enemies.forEach(enemy => {
      enemy.draw();
    });

    let enemyIsSeeker = false;
    for(let i=0;i<enemies.length;i++){
      if(enemies[i].isSeeker){
        enemyIsSeeker = true;
      }
    }
    if(!enemyIsSeeker){
      player.isSeeker = true;
      speed = 2
    }
    else{
      player.isSeeker = false;
      speed = 1.8
    }

    player.draw()
        ctx.font = "48px serif";
        ctx.fillText(gameState.time, canvas.width/2-player.width/2 - player.x-20, canvas.height/2-player.height/2 - player.y -200)
      if(player.isSeeker && gameState.state == "starting" && gameState.time>=0){
        spawnDoor.draw(ctx,canvas,player,"lightblue")
      } 
  
      if(gameState.state == "starting" && !isGameStarting){
        console.log("Starting")
        isGameStarting = true;
      }

  requestAnimationFrame(animate)
}
animate()

let canSprint = true;
let sprintTimer = false;

window.addEventListener("keydown",(e)=>{
  if(e.code=="KeyW"){
    isMovingUp =true
  }
  if(e.code=="KeyS"){
    isMovingDown = true
  }
  if(e.code=="KeyD"){
    isMovingRight = true
  }
  if(e.code=="KeyA"){
    isMovingLeft = true
  }
  if(e.code=="ShiftLeft"){
    if(canSprint){
      if(player.isSeeker){
        speed = 2.5
      }
      if(!player.isSeeker){
        speed = 2
      }
      if(!sprintTimer){
        sprintFunction()
      }
    }
  }
})

function sprintFunction(){
  let countdownTime = 4
  sprintInterval()
  const sprintInterval = setInterval(function() {
    sprintTimer = true;
      countdownTime--;
      // If the countdown reaches 0, change to waitTimer
      if (countdownTime == 0) { 
        canSprint = false
        clearInterval(startInterval);
        let waitTimer = 4
        const waitInterval = setInterval(function() {
          // Decrement the countdown time
          waitTimer--
    
          // If the countdown reaches 0, change the game state and stop updating
          if (waitTimer == 0) {
            clearInterval(waitInterval);
            canSprint = true
            sprintTimer = false;
          }
        }, 1000);
      }
    }, 1000);
}


window.addEventListener("keyup",(e)=>{
  if(e.code=="KeyW"){
    isMovingUp = false
  }
  if(e.code=="KeyS"){
    isMovingDown = false
  }
  if(e.code=="KeyD"){
    isMovingRight = false
  }
  if(e.code=="KeyA"){
    isMovingLeft = false
  }
  if(e.code=="ShiftLeft"){
    speed = 1.8
  }
})  