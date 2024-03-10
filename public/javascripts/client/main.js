// setup canvas
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// scale all object depending on  canvas width // height
let scale = Math.min(canvas.width / 800, canvas.height / 600);

let speed = 1.8

let gameState = {state:undefined, time:undefined};

let isMovingUp = false;
let isMovingDown = false;
let isMovingLeft = false;
let isMovingRight = false;

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

// spawn door
let spawnDoor = new Barrier(-100,100,200,3)

// playerclass
class Player{
  constructor(){
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
      if(checkCollision(this,barriers[i])){
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
    this.tick++
    this.updatePosition()
    this.checkCollisions()
    ctx.fillStyle = "blue"
    ctx.fillRect(this.drawX,this.drawY,this.width,this.height)
  }
}


let player = new Player()


class Enemy{
  constructor(id){
    this.isDead = false;
    this.isVisible = true;
    this.id = id
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

        if(checkCollision(this,player) && player.isSeeker){
            this.isDead = true;
          }


      let hit = lineRect(player.x + player.width/2, player.y + player.height/2, this.x + this.width/2, this.y + this.height/2, spawnDoor.x
        , spawnDoor.y, spawnDoor.width, spawnDoor.height)
        /*ctx.strokeStyle = "white"
        ctx.beginPath()
        ctx.moveTo((canvas.width/2-player.width/2 - player.x + this.x) + this.width/2 , (canvas.height/2-player.height/2 - player.y + this.y) + this.height/2)
        ctx.lineTo(player.x + player.width/2, player.y + player.height/2)
        ctx.stroke()*/

      if(hit && gameState.state == "starting" && player.isSeeker){
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

      if(hit){
        this.isVisible = false;
        break;
      }
    }
    if(this.isVisible){
      ctx.fillStyle = "red"
      ctx.fillRect(canvas.width/2-player.width/2 - player.x + this.x,canvas.height/2-player.height/2 - player.y + this.y,this.width,this.height)
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
    socket.emit('requestState')
  }, 16);

  socket.on('gameState',(data)=>{
    gameState.state = data.state;
    gameState.time = data.time
  })


  socket.on('updatePlayerPosition',(data) => {

    console.log(data)

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
    }
  });

  socket.on('userDisconnected',(data) => {
    console.log('A user disconnected:', data);
    const index = enemies.findIndex(enemy => enemy.id === data.playerId);
    if (index !== -1) {
      enemies.splice(index, 1);
    }
  });
  
  setInterval(() => {
    socket.emit('playerPosition', { id: socket.id ,x: player.x, y: player.y})
  }, 16);
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
    }
    else{
      player.isSeeker = false;
    }

    player.draw()

    if(gameState.state == "starting"){
        ctx.font = "48px serif";
        ctx.fillText(gameState.time, canvas.width/2-player.width/2 - player.x-20, canvas.height/2-player.height/2 - player.y -200  )
      if(player.isSeeker){
        spawnDoor.draw(ctx,canvas,player,"lightblue")
      } 
    }

    // draw countdown
    

  requestAnimationFrame(animate)
}
animate()


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
    speed = 2.5
  }
})

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