// A golfing game taking place in outer space
// date: October 2020
// author: Louison Calbrix

const defaultSize = 10;
const defaultRadius = Math.round(defaultSize / Math.sqrt(Math.PI));

let Rectangle = function(pos, width, height) {
    this.pos = pos;
    this.width = width;
    this.height = height;
}

Rectangle.prototype.setMiddle = function(pos) {
    this.pos = pos.map((value, index) => value -= [this.width, this.height][index] / 2);
}

let Circle = function([x, y], size) {
    this.pos = [x, y];
    this.size = size;
    let hitbox = new Rectangle([x - size/2, y - size/2], size, size);
}

let Goal = function(pos) {
    Circle.call(this, pos, defaultSize);
}

let GolfBall = function(pos) {
    Circle.call(this, pos, defaultSize);
    this.vel = [0, 0];
}

GolfBall.prototype.update = function() {
    this.pos = this.pos.map((axis, index) => axis + this.vel[index]);
    this.hitbox.setMiddle(this.pos);
}

let Level = function(posStart, posGoal) {
    this.ball = new GolfBall(posStart);
    this.goal = new Goal(posGoal);
    // attributes: goal, ball
    // goal = {x: xGoal, y: yGoal}
    // methods: update
}

Level.prototype.update = function() {
    this.ball.update();
}


///////////////////////////////////////////////////////////Graphics


const gameCan = document.querySelector('canvas#game-canvas');
const ctx = gameCan.getContext('2d');
ctx.lineWidth = 3;

let drawLevel = function(level) {
    ctx.fillStyle = '#000';
    // draw ball
    ctx.beginPath();
    ctx.arc(level.ball.pos[0], level.ball.pos[1], defaultRadius, 0, 2*Math.PI);
    ctx.fill()
    // draw goal
    ctx.strokeStyle = '#F00';
    ctx.beginPath();
    ctx.arc(level.goal.pos[0], level.goal.pos[1], defaultRadius, 0, 2*Math.PI);
    ctx.fill();
    ctx.stroke();
}

// Test

let lvl = new Level([20, 20], [250, 400]);
drawLevel(lvl);
