const canvas = document.getElementById("canvas");

const canvasHeight = 512;
const canvasWidth = 512;

canvas.height = canvasHeight;
canvas.width = canvasWidth;

const ctx = canvas.getContext("2d");
ctx.translate(canvasWidth / 2, canvasHeight / 2);
ctx.scale(1, -1);

let animationFrame = null;

const effector = {
	xPos: 100,
	yPos: 100,
	xVel: 0,
	yVel: 0
}

const speed = 2;
const armLength1 = 112;
const armLength2 = 112;
const radius = armLength1 + armLength2;

let theta1 = 0;
let theta2 = 0;
let theta3 = 0;

init();

function init() {

	initControls();

	if (animationFrame != null) {
		cancelAnimationFrame(animationFrame)
		animationFrame = null;
	}

	animationFrame = requestAnimationFrame(run);
}

function run() {

	updatePosition();
	calculateThetas();
	draw();

	logDebugInfo()

	animationFrame = requestAnimationFrame(run);
}

function initControls() {
	document.addEventListener('keydown', (event) => {

		if (event.key === "ArrowUp") {
			effector.yVel = 1;
		}
		else if (event.key === "ArrowDown") {
			effector.yVel = -1;
		}

		if (event.key === "ArrowLeft") {
			effector.xVel = -1;
		}
		else if (event.key === "ArrowRight") {
			effector.xVel = 1;
		}

		if (event.code === "Space") {
			effector.xPos = effector.xPos * -1;
		}
	});

	document.addEventListener('keyup', (event) => {
		if (event.key === "ArrowUp" || event.key === "ArrowDown") {
			effector.yVel = 0;
		}
		else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
			effector.xVel = 0;
		}
	})
}

function updatePosition() {

	const desiredXPos = effector.xPos + effector.xVel * speed;
	const desiredYPos = effector.yPos +effector.yVel * speed;

	if (isMovementAllowed(desiredXPos, desiredYPos)) {
		effector.xPos = desiredXPos;
		effector.yPos = desiredYPos
	}
}

function isMovementAllowed(x, y) {

	if (y < 0) {
		return false;
	}

	const yPosUpperBound = Math.sqrt(Math.pow(radius, 2) - Math.pow(x, 2));

	if (y > yPosUpperBound) {
		return false;
	}

	const xPosUpperBound = Math.sqrt(Math.pow(radius, 2) - Math.pow(y, 2));

	if (x > xPosUpperBound) {
		return false;
	}

	return true
}

function draw() {
	ctx.clearRect(-(canvasWidth / 2), -(canvasHeight / 2), canvasWidth, canvasHeight);
	drawSpace()
	drawArm();
}

function drawSpace() {
	ctx.lineWidth = 1;
	ctx.strokeStyle = "black";

	ctx.beginPath();
	ctx.moveTo(-(canvasWidth / 2), 0);
	ctx.lineTo(canvasWidth, 0);
	ctx.stroke();


	ctx.beginPath();
	ctx.moveTo(0, -(canvasHeight / 2));
	ctx.lineTo(0, canvasHeight / 2);
	ctx.stroke();

	ctx.lineWidth = 1;

	ctx.beginPath()
	ctx.arc(0, 0, radius, 0, degreesToRadians(360), true);
	ctx.stroke();

	ctx.lineWidth = 5;

}

function drawArm() {
	drawEffector()
	const arm1EndPoint = drawArmLength1();
	drawArmLength2(arm1EndPoint);
}

function drawEffector() {

	const endPoint = findEndPoint(effector.xPos, effector.yPos, theta1 + theta2 + theta3, 32)

	ctx.beginPath();
	ctx.moveTo(effector.xPos, effector.yPos);
	ctx.lineTo(endPoint.x, endPoint.y);
	ctx.strokeStyle = 'red';
	ctx.stroke();
}

function findEndPoint(x0, y0, radians, length) {

  var x = x0 + length * Math.cos(radians);
  var y = y0 + length * Math.sin(radians);

  return {x: x, y: y};
}

function drawArmLength1() {

	const endPoint = findEndPoint(0, 0, theta1, armLength1);

	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(endPoint.x, endPoint.y);
	ctx.strokeStyle = 'blue';
	ctx.stroke();

	return endPoint
}

function drawArmLength2(startPoint) {

	const endPoint = findEndPoint(startPoint.x, startPoint.y, theta1 + theta2, armLength1);

	ctx.beginPath();
	ctx.moveTo(startPoint.x, startPoint.y);
	ctx.lineTo(endPoint.x, endPoint.y);
	ctx.strokeStyle = 'green';
	ctx.stroke();
}

function degreesToRadians(degrees) {
	return (degrees * Math.PI) / 180;
}

function calculateThetas() {

	const x = effector.xPos;
	const y = effector.yPos;

	const a = armLength1;
	const b = armLength2;

	const r = Math.sqrt(x**2 + y**2);

	const theta = lawOfCosines(y, r, x);
	const alpha = lawOfCosines(b, a, r);
	theta1 = theta + alpha;

	const beta = lawOfCosines(r, a, b);
	theta2 = -Math.PI + beta;

	theta3 = -theta2 - theta1 + degreesToRadians(0);
}

function xPosRelativeToCenterPoint() {
	return effector.xPos - canvasWidth / 2;
}

function yPosRelativeToCenterPoint() {
	return canvasHeight / 2 - effector.yPos;
}

function logDebugInfo() {
	console.log(radiansToDegrees(theta1), radiansToDegrees(theta2), radiansToDegrees(theta3));
}

function radiansToDegrees(x) {
	return x * 180 / Math.PI;
}

function lawOfCosines(a, b, c) {
	return Math.acos((b**2 + c**2 - a**2) / (2 * b * c))
}