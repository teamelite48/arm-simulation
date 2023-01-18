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
	handleCollisions();
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
	effector.xPos += effector.xVel * speed;
	effector.yPos += effector.yVel * speed;
}

function handleCollisions() {

	// if (effector.xPos < 0) {
	// 	effector.xPos = 0;
	// }

	if (effector.yPos < 0) {
		effector.yPos = 0;
	}

	const yPosUpperBound = Math.sqrt(Math.pow(radius, 2) - Math.pow(effector.xPos, 2));
	const xPosUpperBound = Math.sqrt(Math.pow(radius, 2) - Math.pow(effector.yPos, 2));

	if (effector.yPos > yPosUpperBound) {
		effector.yPos = yPosUpperBound;
	}
	if (effector.xPos > xPosUpperBound) {
		effector.xPos = xPosUpperBound;
	}
}

function draw() {
	ctx.clearRect(-(canvasWidth / 2), -(canvasHeight / 2), canvasWidth, canvasHeight);
	drawEffector();
}

function drawEffector() {

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


	ctx.beginPath();
	ctx.moveTo(effector.xPos, effector.yPos);
	ctx.lineTo(effector.xPos + 5, effector.yPos, 1);
	ctx.strokeStyle = 'red';
	ctx.stroke();


	const arm1EndPoint = drawArmLength1();
	drawArmLength2(arm1EndPoint);
}

function findEndPoint(x0, y0, radians, length) {

  var x = x0 + length * Math.cos(radians);
  var y = y0 + length * Math.sin(radians);

  return {x: x, y: y};
}

function drawArmLength1() {
	const [theta1, theta2] = inverseKinematics();


	const endPoint = findEndPoint(0, 0, theta1, armLength1);

	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(endPoint.x, endPoint.y);
	ctx.strokeStyle = 'blue';
	ctx.stroke();

	return endPoint
}

function drawArmLength2(startPoint) {
	const [theta1, theta2] = inverseKinematics();

	console.log(radiansToDegrees(theta1), radiansToDegrees(theta2));

	const endPoint = findEndPoint(startPoint.x, startPoint.y, -theta2 + theta1, armLength1);

	ctx.beginPath();
	ctx.moveTo(startPoint.x, startPoint.y);
	ctx.lineTo(endPoint.x, endPoint.y);
	ctx.strokeStyle = 'green';
	ctx.stroke();
}

function degreesToRadians(degrees) {
	return (degrees * Math.PI) / 180;
}

function inverseKinematics() {

	const x = effector.xPos;
	const y = effector.yPos;

	const a1 = armLength1;
	const a2 = armLength2;

	if (x >= 0) {
		const q2 = Math.acos((x**2 + y**2 - a1**2 - a2**2) / (2 * a1 * a2));
		const q1 = Math.atan2(y, x) + Math.atan2(a2 * Math.sin(q2), a1 + (a2 * Math.cos(q2)));
		return [ q1, q2 ];
	}
	else {
		const q2 = -Math.acos((x**2 + y**2 - a1**2 - a2**2) / (2 * a1 * a2));
		const q1 = Math.atan2(y, x) + Math.atan2(a2 * Math.sin(q2), a1 + (a2 * Math.cos(q2)));
		return [ q1, q2 ];
	}
}

function xPosRelativeToCenterPoint() {
	return effector.xPos - canvasWidth / 2;
}

function yPosRelativeToCenterPoint() {
	return canvasHeight / 2 - effector.yPos;
}

function logDebugInfo() {
}

function radiansToDegrees(x) {
	return x * 180 / Math.PI;
}