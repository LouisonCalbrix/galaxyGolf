// A golfing game taking place in outer space
// date: October 2020
// author: Louison Calbrix

const fps = 80;
const lvlWidth = 500;
const lvlHeight = 500;

/* Rectangle
 * Represent the geometric shape of a rectangle. Top and bottom sides are 
 * parallel to the x-axis. Rectangle constructor must be called with the 
 * following arguments:
 *  - pos: an array containing two numbers [x, y] which are coordinates for its 
 *  upper-left corner. 
 *  - width: a single number representing its width
 *  - height: a single number representing its height
 *  Interface of a rectangle object:
 *  - collide: function
 *  - middle (get/set)
 *  - left (get/set)
 *  - right (get/set)
 *  - top (get/set)
 *  - bottom (get/set)
 */

let Rectangle = function(pos, width, height) {
    this.pos = pos;
    this.width = width;
    this.height = height;
}

// middle (get/set): coordinates for the middle of the rectangle
Object.defineProperty(Rectangle.prototype, 'middle', {
    get: function() { return [this.pos[0] - this.width / 2, this.pos[1] - this.height / 2]; },
    set: function(val) {
        this.pos[0] = val[0] - this.width / 2; 
        this.pos[1] = val[1] - this.height / 2;
    }
});

// left (get/set): x coordinate for the left side of the rectangle
Object.defineProperty(Rectangle.prototype, 'left', {
    get: function() { return this.pos[0]; },
    set: function(val) { this.pos[0] = val; }
});

// right (get/set): x coordinate for the right side of the rectangle
Object.defineProperty(Rectangle.prototype, 'right', {
    get: function() { return this.pos[0] + this.width; },
    set: function(val) { this.pos[0] = val - this.width; }
});

// top (get/set): y coordinate for the top side of the rectangle
Object.defineProperty(Rectangle.prototype, 'top', {
    get: function() { return this.pos[1]; },
    set: function(val) { this.pos[1] = val; }
});

// bottom (get/set): y coordinate for the bottom side of the rectangle
Object.defineProperty(Rectangle.prototype, 'bottom', {
    get: function() { return this.pos[1] + this.height; },
    set: function(val) { this.pos[1] = val - this.height; }
});


/* Return true if two rectangles are intersecting, false otherwise. collide
 * function must be called with the following argument:
 *  -rect2: the second rectangle object
 */
Rectangle.prototype.collide = function(rect2) {
    return (this.left > rect2.left && this.left < rect2.right ||
        this.right > rect2.left && this.right < rect2.right) &&
        (this.top > rect2.top && this.top < rect2.bottom ||
        this.bottom > rect2.top && this.bottom < rect2.bottom);
}

/* Circle
 *
 */

// default size and radius for the golf ball
const ballSize = 10;
const ballRadius = Math.round(ballSize / Math.sqrt(Math.PI));
// default size and radius for the goal
const goalSize = 5;
const goalRadius = Math.round(goalSize / Math.sqrt(Math.PI));

let Circle = function([x, y], radius, hitSize) {
    this.pos = [x, y];
    this.size = hitSize;
    this.hitbox = new Rectangle([x - hitSize/2, y - hitSize/2], hitSize, hitSize);
}

/* Golfball
 *
 */
let Golfball = function(pos) {
    Circle.call(this, pos, ballRadius, ballSize);
    this.vel = [0, 0];
}

Golfball.prototype.update = function() {
    this.pos = this.pos.map((axis, index) => axis + this.vel[index]);
    this.hitbox.middle = this.pos;
}

/* Level
 *
 */

const minForce = 40;
const maxForce = 130;

let Level = function(posStart, posGoal) {
    this.posStart = posStart;
    this.force = minForce;
    this.ball = new Golfball(posStart);
    this.goal = new Circle(posGoal, goalRadius, goalSize);
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
        this.ball = new Golfball(this.posStart);
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
    ctx.arc(level.ball.pos[0], level.ball.pos[1], ballRadius, 0, 2*Math.PI);
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
    ctx.arc(level.goal.pos[0], level.goal.pos[1], ballRadius, 0, 2*Math.PI);
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
