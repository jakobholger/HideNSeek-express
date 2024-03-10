class Barrier{
    constructor(x,y,width,height,){
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }
    
    draw(ctx, canvas, player, color){
      ctx.fillstyle = color
      ctx.fillRect(canvas.width/2-player.width/2 - player.x + this.x,canvas.height/2-player.height/2 - player.y + this.y,this.width, this.height)
    }
  }

  export default Barrier;