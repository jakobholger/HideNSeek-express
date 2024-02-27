class Barrier{
    constructor(x,y,width,height){
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }
    updatePosition(){
      
    }
    draw(ctx, canvas, player){
      this.updatePosition()
      
      ctx.fillRect(canvas.width/2-player.width/2 - player.relativeX + this.x,canvas.height/2-player.height/2 - player.relativeY + this.y,this.width, this.height)
    }
  }

  export default Barrier;