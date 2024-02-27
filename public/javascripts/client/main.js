const canvas = document.querySelector("canvas");
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// scale all object depending on  canvas width // height
let scale = Math.min(canvas.width / 800, canvas.height / 600);

let gameSpeed = 1.5

let speed = gameSpeed * scale

let isMovingUp = false;
let isMovingDown = false;
let isMovingLeft = false;
let isMovingRight = false;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  scale = Math.min(canvas.width / 800, canvas.height / 600);
});

let worldBorder = [
  { x: -2000, y: -2000, width: 2000 + canvas.width + 2000, height: 1000},
  { x: -2000, y: canvas.height + 1000, width: 2000 + canvas.width + 2000, height: 1000},
  { x: -2000, y: -2000, width: 1000, height: 2000 + canvas.height+1002},
  { x: canvas.width+1000, y: -2000, width: 1000, height: 2000 + canvas.height + 2000}
]

let barriers = []

import Barrier from './barrier.js'

barriers.push(new Barrier(200,300,10,400,ctx, scale))
barriers.push(new Barrier(700,300,300,10,ctx, scale))
barriers.push(new Barrier(1000,500,10,400,ctx, scale))

console.log(barriers)

class Player{
  constructor(){
    this.width = 80 * scale
    this.x = canvas.width/2 - this.width/2
    this.height = 80 * scale
    this.y = canvas.height/2 - this.height/2
    this.relativeX = canvas.width/2 - this.width/2;
    this.relativeY = canvas.height/2 - this.height/2;
  }
  updatePosition(){
    this.width = 80 * scale
    this.x = canvas.width/2 - this.width/2
    this.height = 80 * scale
    this.y = canvas.height/2 - this.height/2
    if(isMovingUp){
      this.relativeY-= speed
    }
    if(isMovingDown){
      this.relativeY+= speed
    }
    if(isMovingRight){
      this.relativeX+= speed
    }
    if(isMovingLeft){
      this.relativeX-= speed
    }
  }
  checkCollisions(){
    for(let i=0;i<worldBorder.length;i++){

    }
  }
  draw(){
    this.checkCollisions()
    this.updatePosition()
    ctx.fillStyle = "blue"
    ctx.fillRect(this.x,this.y,this.width,this.height)
  }
}

let player = new Player()


class Enemy{
  constructor(id){
    this.id = id
    this.width = 80 * scale
    this.x = canvas.width/2 - this.width/2;
    this.height = 80 * scale
    this.y = canvas.height/2 - this.height/2;
  }
  updatePosition(){
    this.width = 80 * scale
    this.height = 80 * scale
    console.log({enemy_x: Math.round(this.x), enemy_y: Math.round(this.y)}, {player_x: Math.round(player.relativeX), player_y:Math.round(player.relativeY)})
  }
  draw(){
    this.updatePosition()
    let left;
    let right;
    let top;
    let bottom;
    for(let i=0;i<barriers.length;i++){
    left = lineLine(player.relativeX,player.relativeY,this.x,this.y,barriers[i].x,barriers[i].y, barriers[i].x, barriers[i].y+barriers[i].height)
    right = lineLine(player.relativeX,player.relativeY,this.x,this.y,barriers[i].x+barriers[i].width,barriers[i].y, barriers[i].x+barriers[i].width, barriers[i].y+barriers[i].height)
    top = lineLine(player.relativeX,player.relativeY,this.x,this.y,barriers[i].x,barriers[i].y, barriers[i].x+barriers[i].width, barriers[i].y)
    bottom = lineLine(player.relativeX,player.relativeY,this.x,this.y,barriers[i].x,barriers[i].y+barriers[i].height, barriers[i].x+barriers[i].width, barriers[i].y+barriers[i].height)
    }    
    if (left || right || top || bottom) {
     console.log("not visible")
    }
    else{
      ctx.fillStyle = "red"
      ctx.fillRect(canvas.width/2-player.width/2 - player.relativeX + this.x,canvas.height/2-player.height/2 - player.relativeY + this.y,this.width,this.height)
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

  socket.on('updatePlayerPosition',(data) => {

    const foundObject = enemies.find(obj => obj.id === data.playerId);

    if(foundObject){
      //console.log("Player already in array.")
    }
    else{
      enemies.push(new Enemy(data.playerId))
    }
    //console.log(data)
    const enemyToUpdate = enemies.find(enemy => enemy.id === data.playerId);
    if (enemyToUpdate) {
      enemyToUpdate.x = data.position.x;
      enemyToUpdate.y = data.position.y;
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
    socket.emit('playerPosition', { id: socket.id ,x: player.relativeX, y: player.relativeY})
  }, 20);
});

function animate(){
  if(isMovingUp){
    for(let i=0;i<worldBorder.length;i++){
      worldBorder[i].y+= speed
    }

  }

  if(isMovingDown){
    for(let i=0;i<worldBorder.length;i++){
      worldBorder[i].y-= speed
    }
  }

  if(isMovingRight){
    for(let i=0;i<worldBorder.length;i++){
      worldBorder[i].x-= speed
    }
  }

  if(isMovingLeft){
    for(let i=0;i<worldBorder.length;i++){
      worldBorder[i].x+= speed
    }
  }
 
  // clear background with black
  ctx.fillStyle = "black"
  ctx.fillRect(0,0,canvas.width,canvas.height)

  // draw world border
  ctx.fillStyle = "white"
  for(let i=0;i<worldBorder.length;i++){
    ctx.fillRect(worldBorder[i].x, worldBorder[i].y, worldBorder[i].width, worldBorder[i].height)
  }

  // draw a barrier with white
  ctx.fillStyle = "white"
  for(let i=0;i<barriers.length;i++){
    barriers[i].draw(ctx, canvas, player)
  }
  
    // Draw enemies
    enemies.forEach(enemy => {
      enemy.draw();
    });

    player.draw()

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
})



function lineLine(x1,y1,x2,y2,x3,y3,x4,y4){
  let uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
  let uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
    return true;
  }
  return false;
}

function lineIntersect(){
  lineLine(x1,y1,x2,y2,x3,y3,x4,y4)
}

