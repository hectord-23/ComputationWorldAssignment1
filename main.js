/** Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) */
function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Background(game) {
    Entity.call(this, game, 0, 600);
    this.radius = 100;
}

Background.prototype = new Entity(); // merges the two enties into one
Background.prototype.constructor = Background;

Background.prototype.update = function () {
}

Background.prototype.draw = function (ctx) {
    ctx.fillStyle = "GREEN";
    ctx.fillRect(0,500,800,300);
    Entity.prototype.draw.call(this);
}

function Ball(game) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/ball_animation.png"), 0, 0, 45, 45, 0.1, 8, true, false); // running
    this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/ball_animation.png"), 0, 0, 45, 45, 0.1, 8, false, false); // running
    this.jumping = false;
    this.radius = 45;
    this.ground = 600;
    Entity.call(this, game, 100, 600);
}

Ball.prototype = new Entity();
Ball.prototype.constructor = Ball;

Ball.prototype.update = function () { 
    if (this.game.space) this.jumping = true;
    if (this.jumping) {
        if (this.jumpAnimation.isDone()) {
            this.jumpAnimation.elapsedTime = 0;
            this.jumping = false;
        }
        var jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
        var totalHeight = 100; // totalHeight of the jump

        if (jumpDistance > 0.5)
            jumpDistance = 1 - jumpDistance;

        //var height = jumpDistance * 2 * totalHeight;
        var height = totalHeight*(-4 * (jumpDistance * jumpDistance - jumpDistance));
        this.y = this.ground - height;
    }
    // Movement for left and right
    if (this.game.moveRight) {
    	if(this.x < 740) { // MAGIC NUMBERS
    		this.x += 10;
    	}
    } else if (this.game.moveLeft) {
    	if(this.x > 5) {
    		this.x -= 10;
    	}
    }
    Entity.prototype.update.call(this);
}

Ball.prototype.draw = function (ctx) {
    if (this.jumping) {
        this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x + 0, this.y - 45, 1.2); // 1.2 enlarging the balls
    }
    else {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1.2);
    }
    Entity.prototype.draw.call(this);
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/ball_animation.png"); // pre-download of .png images.

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var bg = new Background(gameEngine);
    var myBall = new Ball(gameEngine);

    gameEngine.addEntity(bg);
    gameEngine.addEntity(myBall);
 
    gameEngine.init(ctx);
    gameEngine.start();
});
