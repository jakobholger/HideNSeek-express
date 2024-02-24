const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d")

let ParticleMov = []

window.addEventListener("mousemove",(e)=>{
    mouse.x = e.x
    mouse.y = e.y
    ParticleMov.push(new mouseParticle(Math.random()*100+50,1))
})

window.addEventListener("resize",()=>{
canvas.width = window.innerWidth
canvas.height = window.innerHeight
})

canvas.width = window.innerWidth
canvas.height = window.innerHeight

let mouse = {
    x: canvas.width/2,
    y: canvas.height/2
}

let particleArr = []
let particleNum = 90

class mouseParticle{
    constructor(){
        this.radius = Math.random()*8+2
        this.x = mouse.x + (Math.round(Math.random()) * 2 - 1)*Math.random()*5
        this.y = mouse.y + (Math.round(Math.random()) * 2 - 1)*Math.random()*5
        this.dx = (Math.round(Math.random()) * 2 - 1)*Math.random()*2
        this.dy = (Math.round(Math.random()) * 2 - 1)*Math.random()*2
    }
    draw(){
        if(this.x + this.radius >= canvas.width || this.x-this.radius <= 0){
            this.dx = -this.dx
        }
        if(this.y + this.radius >= canvas.height || this.y-this.radius <= 0){
            this.dy = -this.dy
        }
        this.x += this.dx
        this.y += this.dy
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,0)
        ctx.stroke()
        ctx.fillStyle = "white"
        ctx.fill()
        this.radius -= 0.05
    }
}


class Particle{
    constructor(){
        this.radius = Math.random()*8+2
        this.x = (Math.random()*(canvas.width-(this.radius*2)))+this.radius
        this.y = (Math.random()*(canvas.height-(this.radius*2)))+this.radius
        this.dx = (Math.round(Math.random()) * 2 - 1)*Math.random()*2
        this.dy = (Math.round(Math.random()) * 2 - 1)*Math.random()*2
    }
    draw(){
        if(this.x + this.radius >= canvas.width || this.x-this.radius <= 0){
            this.dx = -this.dx
        }
        if(this.y + this.radius >= canvas.height || this.y-this.radius <= 0){
            this.dy = -this.dy
        }
        this.x += this.dx
        this.y += this.dy
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,0)
        ctx.stroke()
        ctx.fillStyle = "white"
        ctx.fill()
    }
}

for(let i=0;i<particleNum;i++){
    particleArr.push(new Particle(1,0))
}

let hue = 0;

function animate(){

    for(let i=0;i<ParticleMov.length;i++){
        ParticleMov[i].draw()
        if(ParticleMov[i].radius<=0){
            ParticleMov.splice(i,1)
        }
    }


    ctx.fillStyle = "rgba(0,0,0,0.2)"
    ctx.fillRect(0,0,canvas.width,canvas.height)
    for(let i=0;i<particleArr.length;i++){
        hue+=0.005;
        if(hue>360){
            hue-=360
        }


        particleArr[i].draw()
        if(distance(mouse.x,mouse.y,particleArr[i].x,particleArr[i].y)<200){
            ctx.beginPath()
            ctx.moveTo(mouse.x,mouse.y)
            ctx.lineTo(particleArr[i].x,particleArr[i].y)
            const rgbColor = `hsl(${hue}, 100%, 50%)`;
            ctx.strokeStyle = rgbColor;
            ctx.stroke() 
        }
        for(let j=0;j<particleArr.length;j++){
            if(distance(particleArr[i].x,particleArr[i].y,particleArr[j].x,particleArr[j].y)<100){
                ctx.beginPath()
                ctx.moveTo(particleArr[i].x,particleArr[i].y)
                ctx.lineTo(particleArr[j].x,particleArr[j].y)
                ctx.strokeStyle = "white"
                ctx.stroke()
            }
        }
    }
    requestAnimationFrame(animate)
}
animate()


function distance(x1,y1,x2,y2){
return Math.sqrt((((x2-x1)*(x2-x1))+((y2-y1)*(y2-y1))))
}