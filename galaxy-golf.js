// A golfing game taking place in outer space
// date: October 2020
// author: Louison Calbrix

const defaultSize = 10;
const defaultRadius = Math.round(defaultSize / Math.sqrt(Math.PI));
const minForce = 40;
const maxForce = 130;
const fps = 80;
const lvlWidth = 500;
const lvlHeight = 500;

let Rectangle = function(pos, width, height) {
    this.pos = pos;
    this.width = width;
    this.height = height;
}

Object.defineProperty(Rectangle.prototype, 'middle', {
    get: function() { return [this.pos[0] - this.width / 2, this.pos[1] - this.height / 2]; },
    set: function(val) {
        this.pos[0] = val[0] - this.width / 2; 
        this.pos[1] = val[1] - this.height / 2;
    }
});

Object.defineProperty(Rectangle.prototype, 'left', {
    get: function() { return this.pos[0]; },
    set: function(val) { this.pos[0] = val; }
});

Object.defineProperty(Rectangle.prototype, 'right', {
    get: function() { return this.pos[0] + this.width; },
    set: function(val) { this.pos[0] = val - this.width; }
});

Object.defineProperty(Rectangle.prototype, 'top', {
    get: function() { return this.pos[1]; },
    set: function(val) { this.pos[1] = val; }
});

Object.defineProperty(Rectangle.prototype, 'bottom', {
    get: function() { return this.pos[1] + this.height; },
    set: function(val) { this.pos[1] = val - this.height; }
});

Rectangle.prototype.collide = function(rect2) {
    return (this.left > rect2.left && this.left < rect2.right ||
        this.right > rect2.left && this.right < rect2.right) &&
        (this.top > rect2.top && this.top < rect2.bottom ||
        this.bottom > rect2.top && this.bottom < rect2.bottom);
}

let Circle = function([x, y], size) {
    this.pos = [x, y];
    this.size = size;
    this.hitbox = new Rectangle([x - size/2, y - size/2], size, size);
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
    this.hitbox.middle = this.pos;
}

let Level = function(posStart, posGoal) {
    this.posStart = posStart;
    this.force = minForce;
    this.ball = new GolfBall(posStart);
    this.goal = new Goal(posGoal);
}

Level.prototype.setForce = function(force) {
    if (force < minForce)
        this.force = minForce;
    else if (force > maxForce)
        this.force = maxForce;
    else
        this.force = force;
}

Level.prototype.update = function() {
    this.ball.update();
    if (this.ball.pos[0] < -2*this.ball.size || this.ball.pos[0] > lvlWidth + 2*this.ball.size ||
        this.ball.pos[1] < -2*this.ball.size || this.ball.pos[1] > lvlHeight + 2*this.ball.size)
        this.ball = new GolfBall(this.posStart);
    if (this.ball.hitbox.collide(this.goal.hitbox)) {
        this.ball.vel = [0, 0];
        console.log('winner!!!');
    }
}

Level.prototype.pushBall = function([mouseX, mouseY]) {
    if (this.ball.vel.every(x => x === 0)) {
        let dirVector = [mouseX - this.ball.pos[0], mouseY - this.ball.pos[1]];
        let moveVectorNorm = Math.sqrt(dirVector.map(x => x**2).reduce((acc, val) => acc + val));
        this.ball.vel = dirVector.map(x => x * (this.force / moveVectorNorm) / (fps / 2));
    }
}


///////////////////////////////////////////////////////////Graphics


const gameCan = document.querySelector('canvas#game-canvas');
gameCan.width = lvlWidth;
gameCan.height = lvlHeight;
const ctx = gameCan.getContext('2d');

let drawLevel = function(level) {
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, lvlWidth, lvlHeight);
    // draw ball
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(level.ball.pos[0], level.ball.pos[1], defaultRadius, 0, 2*Math.PI);
    ctx.fill()
    // draw force
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#FF0';
    ctx.beginPath();
    ctx.arc(level.ball.pos[0], level.ball.pos[1], level.force, 0, 2*Math.PI);
    ctx.stroke()
    // draw goal
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#F00';
    ctx.beginPath();
    ctx.arc(level.goal.pos[0], level.goal.pos[1], defaultRadius, 0, 2*Math.PI);
    ctx.fill();
    ctx.stroke();
}

///////////////////////////////////////////////////////////Controls


let userClick = function(evt, level) {
    let canRect = evt.target.getBoundingClientRect();
    let [mouseX, mouseY] = [evt.clientX - canRect.left, evt.clientY - canRect.top];
    level.pushBall([mouseX, mouseY]);
}

let userScroll = function(evt, level) {
    evt.preventDefault();
    level.setForce(level.force - evt.deltaY);
}

gameCan.addEventListener('click', evt => userClick(evt, lvl));
gameCan.addEventListener('wheel', evt => userScroll(evt, lvl));

// Test

var lvl = new Level([20, 20], [250, 400]);
setInterval(() => { lvl.update(); drawLevel(lvl); }, Math.round(1000/fps));
drawLevel(lvl);
