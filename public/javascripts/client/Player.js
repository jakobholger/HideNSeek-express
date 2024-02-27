class Player{
    constructor(scale, canvas, speed){
      this.speed = speed
      this.scale = scale
      this.width = 80 * this.scale
      this.x = canvas.width/2 - this.width/2
      this.height = 80 * this.scale
      this.y = canvas.height/2 - this.height/2
      this.relativeX = canvas.width/2 - this.width/2;
      this.relativeY = canvas.height/2 - this.height/2;
    }
    updatePosition(canvas, isMovingUp, isMovingDown, isMovingRight, isMovingLeft, speed){
      this.width = 80 * this.scale
      this.x = canvas.width/2 - this.width/2
      this.height = 80 * this.scale
      this.y = canvas.height/2 - this.height/2
      if(isMovingUp){
        this.relativeY-= this.speed
      }
      if(isMovingDown){
        this.relativeY+= this.speed
      }
      if(isMovingRight){
        this.relativeX+= this.speed
      }
      if(isMovingLeft){
        this.relativeX-= this.speed
      }
    }
    checkCollisions(worldBorder){
      for(let i=0;i<worldBorder.length;i++){
  
      }
    }
    draw(worldBorder, canvas, isMovingUp, isMovingDown, isMovingRight, isMovingLeft, ctx){
      this.checkCollisions(worldBorder)
      this.updatePosition(canvas, isMovingUp, isMovingDown, isMovingRight, isMovingLeft)
      ctx.fillStyle = "blue"
      ctx.fillRect(this.x,this.y,this.width,this.height)
    }
  }

export default Player;