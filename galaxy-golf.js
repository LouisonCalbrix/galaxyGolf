// A golfing game taking place in outer space
// date: October 2020
// author: Louison Calbrix

const fps = 80;


////////////////////////////////////////////////////////////Game parts


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
 *  - move: function
 *  - middle (get/set)
 *  - left (get/set)
 *  - right (get/set)
 *  - top (get/set)
 *  - bottom (get/set)
 */

const Rectangle = function(pos, width, height) {
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
    const collide_x = (this.left > rect2.left && this.left < rect2.right ||
        this.right > rect2.left && this.right < rect2.right) ||
        (rect2.left > this.left && rect2.left < this.right ||
        rect2.right > this.left && rect2.right < this.right);
    const collide_y = (this.top > rect2.top && this.top < rect2.bottom ||
        this.bottom > rect2.top && this.bottom < rect2.bottom) ||
        (rect2.top > this.top && rect2.top < this.bottom ||
        rect2.bottom > this.top && rect2.bottom < this.bottom);
    return collide_x && collide_y;
}

/* Change the rectangle pos, so that it is by [deltaX, deltaY]. move function
 * must be called with the following argument:
 *  -[deltaX, deltaY]: two numbers where the rectangle should be moved
 */
Rectangle.prototype.move = function([deltaX, deltaY]) {
    this.left += deltaX;
    this.top += deltaY;
}


/* GameObject
 * Represent an object in the game. GameObject constructor must be called with the
 * following arguments:
 *  - name: a string allowing the user to identify the game object instance
 *  - pos: an array containing two numbers [x, y] which are coordinates for its
 *  center.
 *  - rects: an array of arrays of the form [pos, width, height] where pos, width
 *  and height must be values that can be used by the Rectangle constructor to
 *  create a new Rectangle instance.
 *  - vel: an array containing two numbers [horizontalVelocity, verticalVelocity]
 *  which are the components of this game object's speed.
 *  Interface of a game object:
 *  - update: function
 *  - hit: function
 */

const GameObject = function(name, [x, y], rects, vel=[0, 0]) {
    this.name = name;
    this.pos = [x, y];
    this.hitbox = rects.map(args => new Rectangle(...args));
    this.vel = vel;
}

/* Return true if two game objects are hitting each other, false otherwise.
 * hit function must be called with the following argument:
 *  -obj2: the second game object instance
 */
GameObject.prototype.hit = function(obj2) {
    for (const rect of this.hitbox)
        for (const rect2 of obj2.hitbox)
            if (rect.collide(rect2))
                return true;
    return false;
}

// Update the position of the game object
GameObject.prototype.update = function() {
    const [x, y] = this.pos;
    const [velX, velY] = this.vel;
    this.pos = [x+velX, y+velY];
    this.hitbox.forEach(rect => rect.move(this.vel));
}

// types of GameObject instances
const BALL_TYPE = 'ball'
const GOAL_TYPE = 'goal'
const BHOLE_TYPE = 'blackhole'


// default size and radius for the golf ball
const ballSize = 20;
const ballRadius = Math.round(ballSize / Math.sqrt(Math.PI));

// factory for golfball
GameObject.golfball = function(pos) {
    const rectPos = pos.map(el => el-ballSize/2);
    return new GameObject(BALL_TYPE, pos, [[rectPos, ballSize, ballSize]]);
}

// default size and radius for the goal
const goalSize = 4;
const goalRadius = Math.round(Math.SQRT2 * goalSize);

// factory for level goal
GameObject.goal = function(pos) {
    const rectPos = pos.map(el => el-goalSize/2);
    return new GameObject(GOAL_TYPE, pos, [[rectPos, goalSize, goalSize]]);
}

// factory for blackhole
GameObject.blackhole = function(pos, size, attraction) {
    const rectPos = pos.map(el => el-size/2);
    const blackhole = new GameObject(BHOLE_TYPE, pos, [[rectPos, size, size]]);
    blackhole.attraction = attraction;
    return blackhole;
}


/* Level
 * Represent a level the user must beat. Level constructor must be called with the
 * following arguments:
 *  - posStart: an array containing two numbers [x, y] which are the coordinates
 *  for where the golf ball spawns
 *  - posGoal: an array containing two numbers [x, y] which are coordinates for
 *  - obstacles: an array of GameObject instances that are obstacles on the course
 *  the goal to reach
 *  Interface of a level object:
 *  - update: function
 *  - pushball: function
 *  - force (get/set)
 */

// temp: fixed width and height of a level
const lvlWidth = 500;
const lvlHeight = 500;

const Level = function(posStart, posGoal, obstacles=[]) {
    this.posStart = posStart;
    this._force = minForce;
    this.ball = GameObject.golfball(posStart);
    this.goal = GameObject.goal(posGoal);
    this.obstacles = obstacles;
    this.collisions = [];
}

// boundaries for the force to apply to the golf ball
const minForce = 40;
const maxForce = 130;

// force (get/set): number representing how strongly the golf ball will be pushed
Object.defineProperty(Level.prototype, 'force', {
    enumerable: true,
    get: function() { return this._force; },
    set: function(val) {
        if (val < minForce)
            this._force = minForce;
        else if (val > maxForce)
            this._force = maxForce;
        else
            this._force = val;
    }
});

/* Game logic here.
 *  -Update the position and speed of GameObject instances
 *  -check if the ball is still within the boundaries of the level
 *  -check if the ball has reached the goal
 */
Level.prototype.update = function() {
    this.ball.update();
    if (this.ball.pos[0] < -2*ballSize || this.ball.pos[0] > lvlWidth + 2*ballSize ||
        this.ball.pos[1] < -2*ballSize || this.ball.pos[1] > lvlHeight + 2*ballSize)
        this.ball = GameObject.golfball(this.posStart);
    this.findCollisions();
    this.handleCollisions();
    if (this.ball.hit(this.goal)) {
        this.ball.vel = [0, 0];
        console.log('winner!!!');
    }
}

// Find gameobjects colliding each other and add them to the collision array
Level.prototype.findCollisions = function() {
    this.collisions = [];
    for (const obj of this.obstacles) {
        if (this.ball.hit(obj))
            this.collisions.push(obj);
    }
}

/* Go through the collision array and update gameobjects involved in a collision
 * depending on the type of collision
 */
Level.prototype.handleCollisions = function() {
    for (const obj of this.collisions) {
        if (obj.name === BHOLE_TYPE) {
            const dirVector = [obj.pos[0]-this.ball.pos[0], obj.pos[1]-this.ball.pos[1]];
            const vectorNorm = Math.sqrt(dirVector[0] ** 2 + dirVector[1] ** 2);
            if (vectorNorm < obj.hitbox[0].width/2) {
                this.ball.vel[0] += (dirVector[0] / vectorNorm) * obj.attraction;
                this.ball.vel[1] += (dirVector[1] / vectorNorm) * obj.attraction;
            }
        }
    }
}

/* Change the golf ball velocity to make it move towards the position given, at
 * a speed depending on the force set. pushBall function must be called with the
 * following argument:
 *  -pos: an array containing two numbers [x, y] which are coordinates for the
 *  direction towards which the golf ball must be pushed
 */
Level.prototype.pushBall = function(pos) {
    if (this.ball.vel.every(x => x === 0)) {
        const [posX, posY] = pos;
        let dirVector = [posX - this.ball.pos[0], posY - this.ball.pos[1]];
        let moveVectorNorm = Math.sqrt(dirVector.map(x => x**2).reduce((acc, val) => acc + val));
        this.ball.vel = dirVector.map(x => x * (this._force / moveVectorNorm) / (fps / 2));
    }
}


////////////////////////////////////////////////////////////Graphics


// DOM element that will be used to display the game
const gameCan = document.querySelector('canvas#game-canvas');
gameCan.width = lvlWidth;
gameCan.height = lvlHeight;
const ctx = gameCan.getContext('2d');

// Use ctx to draw the hitbox of a GameObject instance (meant for debugging)
const drawHitbox = function(ctx, gameobject) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#F0F';
    for (const rect of gameobject.hitbox) {
        ctx.strokeRect(rect.left - 0.5, rect.top - 0.5, rect.width, rect.height);
    }
}

// Use ctx to draw the golfball
const drawBall = function(ctx, level) {
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(level.ball.pos[0], level.ball.pos[1], ballRadius, 0, 2*Math.PI); 
    ctx.fill();
}

const drawForce = function(ctx, level) {
    ctx.strokeStyle = '#FF0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(level.ball.pos[0], level.ball.pos[1], level.force, 0, 2*Math.PI);
    ctx.stroke();
}

// Use ctx to draw the goal
const drawGoal = function(ctx, level) {
    ctx.fillStyle = '#000';
    ctx.strokeStyle = '#A22';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(level.goal.pos[0], level.goal.pos[1], goalRadius, 0, 2*Math.PI);
    ctx.fill();
    ctx.stroke();
}

// Use ctx to draw obstacles in the course
const drawObstacles = function(ctx, level) {
    for (const obj of level.obstacles) {
        if (obj.name === BHOLE_TYPE) {
            ctx.fillStyle = '#22A';
            ctx.beginPath();
            ctx.arc(obj.pos[0], obj.pos[1], goalRadius, 0, 2*Math.PI);
            ctx.fill();
            ctx.strokeStyle = '#44B';
            ctx.beginPath();
            ctx.arc(obj.pos[0], obj.pos[1], obj.hitbox[0].width/2, 0, 2*Math.PI);
            ctx.stroke();
        }
    }
}

// Use ctx to draw the background
const drawBackground = function(ctx) {
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

// Use ctx to draw the given level
const drawLevel = function(level) {
    drawBackground(ctx);
    // draw golfball
    drawBall(ctx, level);
    drawHitbox(ctx, level.ball);
    // draw force
    drawForce(ctx, level);
    // draw goal
    drawGoal(ctx, level);
    drawHitbox(ctx, level.goal);
    drawObstacles(ctx, level);
    for (const obj of level.obstacles)
        drawHitbox(ctx, obj);
}


// test
var bhole = GameObject.blackhole([140, 250], 170, 0.1);
var lvl = new Level([20, 20], [250, 400], [bhole]);

////////////////////////////////////////////////////////////Controls


const userClick = function(evt, level) {
    let canRect = evt.target.getBoundingClientRect();
    let [mouseX, mouseY] = [evt.clientX - canRect.left, evt.clientY - canRect.top];
    level.pushBall([mouseX, mouseY]);
}

const userScroll = function(evt, level) {
    evt.preventDefault();
    level.force -= evt.deltaY;
}

gameCan.addEventListener('click', evt => userClick(evt, lvl));
gameCan.addEventListener('wheel', evt => userScroll(evt, lvl));

// Test

// TODO: instantiate level with a blackhole and test if it works properly.

setInterval(() => { lvl.update(); drawLevel(lvl); }, Math.round(1000/fps));
