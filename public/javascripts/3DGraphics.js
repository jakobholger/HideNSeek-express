//import * as THREE from "three";

const canvas = document.querySelector("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Your Three.js code goes here
// Example: Create a scene, camera, and renderer

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a cube and add it to the scene
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
scene.add(light);

// Set the camera position
camera.position.set(0, 2, 5);

// Render the scene
var animate = function () {
  requestAnimationFrame(animate);
  playerMovements()

  // Rotate the cube
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
};


let isMovingForward = false
let isMovingBackward = false
let isMovingRight = false
let isMovingLeft = false

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


function playerMovements(){
  if(isMovingForward==true){
    camera.position.z-=0.05
  }
  if(isMovingBackward==true){
    camera.position.z+=0.05
  }
  if(isMovingRight==true){
    camera.position.x+=0.05
  }
  if(isMovingLeft==true){
    camera.position.x-=0.05
  }
}
animate();