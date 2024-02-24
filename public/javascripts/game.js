const canvas = document.querySelector("canvas");
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isMovingForward = false;
let isMovingBackward = false;
let isMovingLeft = false;
let isMovingRight = false;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

let bari1 = {
  x:200,
  y:300,
  width:100,
  height:400
}

class Player{
  constructor(){
    this.id;
    this.width = 80
    this.x = canvas.width/2 - this.width/2
    this.height = 80
    this.y = canvas.height/2 - this.height/2
  }
  draw(){
    if(isMovingForward){
      this.y-=1
    }
    if(isMovingBackward){
      this.y+=1
    }
    if(isMovingRight){
      this.x+=1
    }
    if(isMovingLeft){
      this.x-=1
    }
    ctx.fillStyle = "red"
    ctx.fillRect(this.x,this.y,this.width,this.height)
  }
}

let player = new Player()


class Enemy{
  constructor(id){
    this.id = id
    this.width = 80
    this.x;
    this.height = 80
    this.y;
  }
  draw(){

    let left = lineLine(player.x,player.y,this.x,this.y,bari1.x,bari1.y, bari1.x, bari1.y+bari1.height)
    let right = lineLine(player.x,player.y,this.x,this.y,bari1.x+bari1.width,bari1.y, bari1.x+bari1.width, bari1.y+bari1.height)
    let top = lineLine(player.x,player.y,this.x,this.y,bari1.x,bari1.y, bari1.x+bari1.width, bari1.y)
    let bottom = lineLine(player.x,player.y,this.x,this.y,bari1.x,bari1.y+bari1.height, bari1.x+bari1.width, bari1.y+bari1.height)
    
    if (left || right || top || bottom) {
      
  }
  else{
    ctx.fillStyle = "red"
    ctx.fillRect(this.x,this.y,this.width,this.height)
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
      console.log("Player already in array.")
    }
    else{
      enemies.push(new Enemy(data.playerId))
    }
    console.log(data)
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
    socket.emit('playerPosition', { id: socket.id ,x: player.x, y: player.y})
  }, 20);
});

function animate(){
  // clear background with black
  ctx.fillStyle = "black"
  ctx.fillRect(0,0,canvas.width,canvas.height)

  // draw a barrier with white
  ctx.fillStyle = "white"
  ctx.fillRect(bari1.x,bari1.y,bari1.width,bari1.height)

  player.draw()

    // Draw enemies
    enemies.forEach(enemy => {
      enemy.draw();
    });

  requestAnimationFrame(animate)
}
animate()

window.addEventListener("keydown",(e)=>{
  if(e.code=="KeyW"){
    isMovingForward =true
  }
  if(e.code=="KeyS"){
    isMovingBackward = true
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
    isMovingForward = false
  }
  if(e.code=="KeyS"){
    isMovingBackward = false
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

