var requestID;
var canvas = document.getElementById('stage');
var ctx = canvas.getContext('2d');


const xPoints = [0  ,50,100,150,200,250,300,350,400,500,540];
let y = [223,46,108,0,412,312,400,261,450,30 ,361];
let y2 = y.map(value => value * 0.5 + 225);
// const y2 = [336.5, 248, 279, 437, 431, 381, 425, 355.5, 438.5, 240, 405.5]
let timeChartY = y;
let time;
let yPoints = y; 


draw();

function animate() {
  requestID = requestAnimationFrame(animate);
  draw();
  
  timeChartY = calcTimeChart(y, y2);
}

function calcTimeChart(stArr, toArr) {
  let coef = (new Date() - time) / 1000 * 7;

  coef >=1 && cancelAnimationFrame(requestID);;

  return stArr.map((value, index) => value - (value - toArr[index]) * coef)
}


function draw() {
  ctx.clearRect(0,0,540,450);
  ctx.beginPath();
  ctx.moveTo(xPoints[0], timeChartY[0]);
  for (let i = 0; i < xPoints.length; i++) {
    ctx.lineTo(xPoints[i],timeChartY[i]);
  }
  ctx.strokeStyle = 'green';
  ctx.lineJoin = "round";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.closePath();
}


var start = document.querySelector('button');
start.addEventListener('click', () => {
  yPoints = yPoints === y ? y2 : y;
  time = new Date();
  animate(); 
});
