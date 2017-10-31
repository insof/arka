function Arkaniod() {

    this.lvl = [];
    this.app = new PIXI.Application(800, 600, {backgroundColor: 0xFFFFFF});
    this.menu = new PIXI.Application(100, 600, {backgroundColor: 0xFFFFFF});
    this.cont = new PIXI.Container;
    this.level = [];
    this.platform = new PIXI.Sprite.fromImage('./assets/img/platform.png');
    this.platform.anchor.set(0.5);
    this.platform.width = 150;
    this.defaultPlatformWidth = 150;
    this.platform.height = 30;
    this.platform.position.set(this.app.renderer.width / 2, (this.app.renderer.height - (this.platform.height / 2)));
    this.ball = new PIXI.Sprite.fromImage('./assets/img/ball.png');
    this.ball.anchor.set(0.5);
    this.ball.width = 30;
    this.ball.height = 30;
    this.ball.position.set(this.app.renderer.width / 2, (this.app.renderer.height - this.platform.height - this.ball.height / 3));
    this.ballAway = false;
    this.moveX = this.app.renderer.width / 2;
    this.listener;
    this.ballSpeed = 10;
    this.defaultBallSpeed = 10;
    this.moveAngle;
    this.balls = [this.ball];
    this.isCollision = false;
    this.winCounter;
    this.bonus = [];
    this.superball = 0;
    this.lifeAddText;
    this.additionalBall;
    this.menucont = new PIXI.Container;
    this.selectorCont = new PIXI.Container;

    this.lives = 1;
    this.style = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 36,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: ['#ffffff', '#00ff99'], // gradient
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 500
    });

    this.moveBall = this.moveBall.bind(this);
    this.updateLvl = this.updateLvl.bind(this);
    this.startMoveBall = this.startMoveBall.bind(this);
    this.endOfLevel = this.endOfLevel.bind(this);
    this.returnPlatformWidth = this.returnPlatformWidth.bind(this);
    this.returnBallSpeed = this.returnBallSpeed.bind(this);
    this.returnSuperBall = this.returnSuperBall.bind(this);
    this.removeText = this.removeText.bind(this);
}
;

Arkaniod.prototype.movePlatform = function () {
    if (this.moveX < this.platform.width / 2) {
        this.platform.x = this.platform.width / 2;
    } else if (this.moveX > this.app.renderer.width - (this.platform.width / 2)) {
        this.platform.x = this.app.renderer.width - (this.platform.width / 2);
    } else {
        this.platform.x = this.moveX;
    }
};

Arkaniod.prototype.startMoveBall = function () {
    this.balls[0].x = this.platform.x;
};

Arkaniod.prototype.addResetLvlSelect = function () {
    document.body.appendChild(this.menu.view);
    this.menu.stage.addChild(this.menucont);
    var reset = new PIXI.Sprite.fromImage('./assets/img/reset.png');
    reset.anchor.set(0.5);
    reset.height = 100;
    reset.width = 100;
    reset.scale *= 1.3;
    reset.interactive = true;
    reset.position.set(this.menu.renderer.width / 2, reset.height / 2);
    this.menucont.addChild(reset);
    reset.on('click', this.doReset.bind(this));

    var menu = new PIXI.Sprite.fromImage('./assets/img/menu.png');
    menu.anchor.set(0.5);
    menu.height = 90;
    menu.width = 90;
    menu.interactive = true;
    menu.position.set(this.menu.renderer.width / 2, 100 + menu.height / 2);
    this.menucont.addChild(menu);
    menu.on('click', this.goMenu.bind(this));
};

Arkaniod.prototype.doReset = function () {
    this.endOfLevel();
    this.loadLvl();
    this.lives = 1;
    this.startLvl();
};

Arkaniod.prototype.goMenu = function () {
    this.endOfLevel();
    this.menucont.destroy(true);
    this.cont.destroy(true);
    this.app.stage.addChild(this.selectorCont);
    util.sendRequestLvl();
};

Arkaniod.prototype.loadLvl = function () {
    document.body.appendChild(this.app.view);

    this.platform.width = this.defaultPlatformWidth;
    this.ballSpeed = this.defaultBallSpeed;
    this.lives = 1;
    this.superball = 0;

    this.addResetLvlSelect();
    this.listener = new PIXI.Sprite.fromImage('./assets/img/background.jpg');
    this.listener.height = 600;
    this.listener.width = 800;
    this.listener.interactive = true;
    this.cont.addChild(this.listener);
    this.app.stage.addChild(this.cont);
    for (var q = 0; q < this.lvl.length; q++) {
        this.level[q] = [];
        for (var i = 0; i < this.lvl[q].length; i++) {
// debugger
            if (this.lvl[q][i] === " ") {
                this.level[q][i] = null;
            } else {
                var tmpBrick = this.createBrick(q, i, this.lvl[q][i]);
                if (!(tmpBrick === undefined)) {
                    this.level[q][i] = tmpBrick;
                }
            }
        }
    }
};

Arkaniod.prototype.startLvl = function () {
    this.ballAway = false;
    this.cont.addChild(this.platform);
    this.balls[0].position.set(this.app.renderer.width / 2, (this.app.renderer.height - this.platform.height - this.balls[0].height / 3));
    this.cont.addChild(this.balls[0]);
    this.app.ticker.add(this.movePlatform.bind(this));
    this.listener.on("mousemove", this.callClick.bind(this));
    this.listener.on('click', this.callStartTicker.bind(this));
    this.app.ticker.add(this.startMoveBall);

};

Arkaniod.prototype.callClick = function (e) {
    this.moveX = e.data.global.x;
};

Arkaniod.prototype.callStartTicker = function () {
    if (!(this.ballAway)) {
        this.ballAway = true;
        this.launchBall();
    }
};

Arkaniod.prototype.launchBall = function () {
    this.app.ticker.remove(this.startMoveBall);
    this.balls[0].moveAngle = Math.random() * (((-Math.PI * 2) / 3) - (-Math.PI / 3)) + (-Math.PI / 3);

    this.app.ticker.add(this.moveBall);
    this.app.ticker.add(this.updateLvl);
};

Arkaniod.prototype.ballAngleCalc = function (axis, plus, ball) {
    var dx = Math.cos(ball.moveAngle) * this.ballSpeed;
    var dy = Math.sin(ball.moveAngle) * this.ballSpeed;
    ball.rotation += 0.03;

    if (axis == "x") dx *= -1;
    else dy *= -1;

    if (plus === undefined) plus = 0;

    ball.moveAngle = Math.atan2(dy, dx + plus);
};

Arkaniod.prototype.moveBall = function () {

    this.isCollision = false;


    for (var step = 0; step < this.ballSpeed; step++) {

        for (var i = 0; i < this.balls.length; i++) {

            if (this.balls[i].x < this.balls[i].width / 2) {
                this.balls[i].x = this.balls[i].width / 2;
                this.ballAngleCalc("x", 0, this.balls[i]);
                this.isCollision = true;
            } else if (this.balls[i].x > this.app.renderer.width - (this.balls[i].width / 2)) {
                this.balls[i].x = this.app.renderer.width - (this.balls[i].width / 2);
                this.ballAngleCalc("x", 0, this.balls[i]);
                this.isCollision = true;
            } else if (this.balls[i].y < this.balls[i].height / 2) {
                this.balls[i].y = this.balls[i].height / 2;
                this.ballAngleCalc("y", 0, this.balls[i]);
                this.isCollision = true;
            } else if (this.balls[i].y > this.app.renderer.height - this.platform.height - this.balls[i].height / 3) {
                if ((this.balls[i].x > this.platform.x - this.platform.width / 2) && (this.balls[i].x < this.platform.x + this.platform.width / 2)) {
                    this.balls[i].y = this.app.renderer.height - this.platform.height - this.balls[i].height / 3;
                    if (this.balls[i].x < this.platform.x) {
                        var plus = (this.platform.x - this.balls[i].x) * -0.03;
                        this.ballAngleCalc("y", plus, this.balls[i]);
                    } else if (this.balls[i].x >= this.platform.x) {
                        var plus = (this.platform.x - this.balls[i].x) * -0.03;
                        this.ballAngleCalc("y", plus, this.balls[i]);
                    }
                    this.isCollision = true;
                } else {
                    this.balls[i].x += Math.cos(this.balls[i].moveAngle);
                    this.balls[i].y += Math.sin(this.balls[i].moveAngle);
                    if (this.balls[i].y > this.app.renderer.height + this.balls[i].height) {
                        // debugger;
                        if (this.balls.length < 2) {
                            this.lives--;
                            if (!this.lives) {
                                console.log("You Lose!");
                                this.endOfLevel();
                                var loseWindow = new PIXI.Sprite.fromImage('./assets/img/pony.png');
                                loseWindow.width = 800;
                                loseWindow.height = 600;
                                this.app.stage.addChild(loseWindow);
                                var loseText = new PIXI.Text('Your total score is: ' + scoreCounter, this.style);
                                loseText.x = 300;
                                loseText.y = 300;
                                this.app.stage.addChild(loseText);
                                scoreCounter = 0;
                                return;
                            } else {
                                this.removeTickers();
                                if (this.bonus.length) {
                                    for (var i = 0; i < this.bonus.length; i++) {
                                        this.cont.removeChild(this.bonus[i]);
                                        this.bonus.splice(i, 1);
                                    }
                                }
                                this.startLvl();
                                return;
                            }
                        } else {
                            this.cont.removeChild(this.balls[i]);
                            this.balls.splice(i, 1);
                        }
                    }
                }
            }
            else {
                this.balls[i].x += Math.cos(this.balls[i].moveAngle);
                this.balls[i].y += Math.sin(this.balls[i].moveAngle);
                this.balls[i].rotation += 0.03;
                this.checkCollision(this.balls[i]);
                this.checkBonus();
            }

        }
    }
}
;

Arkaniod.prototype.checkBonus = function () {
    if (this.bonus.length === 0) {
        return;
    }

    for (var i = 0; i < this.bonus.length; i++) {
        this.bonus[i].y += 0.3;
        if (this.bonus[i].y > this.app.renderer.height - (this.platform.height / 2)) {
            if (this.bonus[i].x > this.platform.x - (this.platform.width / 2) && this.bonus[i].x < this.platform.x + (this.platform.width / 2)) {
                this.applyBonus(this.bonus[i]);
                this.cont.removeChild(this.bonus[i]);
                this.bonus.splice(i, 1);
            } else {
                this.cont.removeChild(this.bonus[i]);
                this.bonus.splice(i, 1);
            }

        }
    }
};

Arkaniod.prototype.applyBonus = function (bon) {
    // console.log(bon.bonus);
    if (bon.bonus === "bite") {
        this.platform.width *= 1.8;
        console.log('Platform width x 1.8 - ON');
        setTimeout(this.returnPlatformWidth, 10000);
    }
    if (bon.bonus === "speed") {
        this.ballSpeed *= 1.5;
        console.log('Speed x 1.5 - ON');
        setTimeout(this.returnBallSpeed, 10000);
    }
    if (bon.bonus === "superball") {
        this.superball = 1;
        this.ballSpeed *= 0.5;
        for (var i = 0; i < this.balls.length; i++) {
            this.balls[i].texture = PIXI.Texture.fromImage('./assets/img/superball.png');
            this.balls[i].width = 100;
            this.balls[i].height = 100;
        }
        console.log('SuperBALL - ON');
        setTimeout(this.returnSuperBall, 10000);
    }
    if (bon.bonus === "live") {
        this.lives += 1;
        console.log('1 life added');
        this.lifeAddText = new PIXI.Text('1 life added', this.style);
        this.lifeAddText.x = 300;
        this.lifeAddText.y = 300;
        this.cont.addChild(this.lifeAddText);
        console.log(this.lives);
        setTimeout(this.removeText, 2000);
    }
    if (bon.bonus === "ball") {
        this.additionalBall = new PIXI.Sprite.fromImage('./assets/img/ball.png');
        this.additionalBall.anchor.set(0.5);
        this.additionalBall.position.set(this.balls[0].x, this.balls[0].y);
        this.additionalBall.height = 30;
        this.additionalBall.width = 30;
        this.additionalBall.moveAngle = this.balls[0].moveAngle + Math.PI / 3;
        this.cont.addChild(this.additionalBall);
        this.balls.push(this.additionalBall);
        console.log('Additional ball - ON');
        setTimeout(this.removeAdditionalBall.bind(this), 10000);
    }
};

Arkaniod.prototype.removeAdditionalBall = function () {
    this.cont.removeChild(this.additionalBall);
    this.balls.splice(1, 10);
};

Arkaniod.prototype.removeText = function () {
    this.cont.removeChild(this.lifeAddText);
};

Arkaniod.prototype.returnSuperBall = function () {
    this.superball = 0;
    this.ballSpeed /= 0.5;
    for (var i = 0; i < this.balls.length; i++) {
        this.balls[i].texture = PIXI.Texture.fromImage('./assets/img/ball.png');
        this.balls[i].width = 30;
        this.balls[i].height = 30;
    }
    console.log('SuperBALL - OFF');
};

Arkaniod.prototype.returnBallSpeed = function () {

    if (this.ballSpeed == this.defaultBallSpeed) {
        return
    } else {
        this.ballSpeed /= 1.5;
        console.log('Speed x 1.5 - OFF');
    }
};

Arkaniod.prototype.returnPlatformWidth = function () {
    if (this.platform.width == this.defaultPlatformWidth) {
        return;
    } else {
        this.platform.width /= 1.8;
        console.log('Platform width x 1.8 - OFF');
    }
};

Arkaniod.prototype.endOfLevel = function () {
    this.removeTickers();
    this.app.stage.removeChild(this.cont);
};

Arkaniod.prototype.removeTickers = function () {
    this.app.ticker.remove(this.moveBall);
    this.app.ticker.remove(this.updateLvl);
};

Arkaniod.prototype.checkCollision = function (ball) {

    if (!this.isCollision) {

        var collisionList = [];
        for (var q = 0; q < this.level.length; q++) {
            for (var i = 0; i < this.level[q].length; i++) {
                if (!(this.level[q][i] === null)) {
                    var collision = this.calcIntersection(ball.x, ball.y, ball.width / 2, this.level[q][i].x, this.level[q][i].y, this.level[q][i].width, this.level[q][i].height);

                    if (collision) {
                        collisionList.push({brick: this.level[q][i], collision: collision, x: i, y: q});
                    }
                }
            }
        }

        var collisionAxis = {x: 0, y: 0};
        if (collisionList.length) {
            for (var i = 0; i < collisionList.length; i++) {

                var br = collisionList[i];
                if (collisionList[i].brick.hit > 0) {
                    collisionList[i].brick.hit--;
                }
                if (!collisionList[i].brick.hit) {
                    this.cont.removeChild(collisionList[i].brick);
                    scoreCounter += collisionList[i].brick.val;
                    console.log(scoreCounter);

                    if (collisionList[i].brick.bonus) {
                        if (collisionList[i].brick.bonus === "bite") {
                            var bon = new PIXI.Sprite.fromImage('./assets/img/bonus.png');
                            bon.bonus = "bite";
                            bon.height = 50;
                            bon.width = 50;
                            bon.anchor.set(0.5);
                            bon.position.set(collisionList[i].brick.x + (collisionList[i].brick.width / 2), collisionList[i].brick.y + (collisionList[i].brick.height / 2));
                            this.cont.addChild(bon);
                            this.bonus.push(bon);
                        }
                        if (collisionList[i].brick.bonus === "speed") {
                            var bon = new PIXI.Sprite.fromImage('./assets/img/bonus.png');
                            bon.bonus = "speed";
                            bon.height = 50;
                            bon.width = 50;
                            bon.anchor.set(0.5);
                            bon.position.set(collisionList[i].brick.x + (collisionList[i].brick.width / 2), collisionList[i].brick.y + (collisionList[i].brick.height / 2));
                            this.cont.addChild(bon);
                            this.bonus.push(bon);
                        }
                        if (collisionList[i].brick.bonus === "superball") {
                            var bon = new PIXI.Sprite.fromImage('./assets/img/bonus.png');
                            bon.bonus = "superball";
                            bon.height = 50;
                            bon.width = 50;
                            bon.anchor.set(0.5);
                            bon.position.set(collisionList[i].brick.x + (collisionList[i].brick.width / 2), collisionList[i].brick.y + (collisionList[i].brick.height / 2));
                            this.cont.addChild(bon);
                            this.bonus.push(bon);
                        }
                        if (collisionList[i].brick.bonus === "live") {
                            var bon = new PIXI.Sprite.fromImage('./assets/img/bonus.png');
                            bon.bonus = "live";
                            bon.height = 50;
                            bon.width = 50;
                            bon.anchor.set(0.5);
                            bon.position.set(collisionList[i].brick.x + (collisionList[i].brick.width / 2), collisionList[i].brick.y + (collisionList[i].brick.height / 2));
                            this.cont.addChild(bon);
                            this.bonus.push(bon);
                        }
                        if (collisionList[i].brick.bonus === "ball") {
                            var bon = new PIXI.Sprite.fromImage('./assets/img/bonus.png');
                            bon.bonus = "ball";
                            bon.height = 50;
                            bon.width = 50;
                            bon.anchor.set(0.5);
                            bon.position.set(collisionList[i].brick.x + (collisionList[i].brick.width / 2), collisionList[i].brick.y + (collisionList[i].brick.height / 2));
                            this.cont.addChild(bon);
                            this.bonus.push(bon);
                        }
                        ;
                    }
                    this.level[br.y][br.x] = null;

                    for (var q = 0; q < br.collision.length; q++) {
                        if (br.collision[q] == "top" || br.collision[q] == "bottom") collisionAxis.y++;
                        else collisionAxis.x++;
                    }
                }
                if (!this.superball) {
                    if (collisionAxis.x > collisionAxis.y) {
                        this.ballAngleCalc("x", 0, ball);
                    } else {
                        this.ballAngleCalc("y", 0, ball);
                    }
                }
                this.isCollision = true;
            }
        }
        if (this.isCollision) return;
    }
}
;

Arkaniod.prototype.calcIntersection = function (cx, cy, cr, rx, ry, rw, rh) {

    //далеко слева
    if (cx + cr < rx) return false;
    //далеко справа
    if (cx > rx + rw) return false;
    //далеко вверху
    if (cy + cr < ry) return false;
    //далеко внизу
    if (cy - cr > ry + rh) return false;

    //пересечение есть - определяем грань
    var edges = [];
    if (this.isCircleIntersectLine(cx, cy, cr, rx, ry, rx + rw, ry)) edges.push("top");
    if (this.isCircleIntersectLine(cx, cy, cr, rx, ry, rx, ry + rh)) edges.push("left");
    if (this.isCircleIntersectLine(cx, cy, cr, rx + rw, ry, rx + rw, ry + rh)) edges.push("right");
    if (this.isCircleIntersectLine(cx, cy, cr, rx, ry + rh, rx + rw, ry + rh)) edges.push("bottom");

    return (edges);
};

Arkaniod.prototype.isCircleIntersectLine = function (cx, cy, cr, p1x, p1y, p2x, p2y) {
    var x01 = p1x - cx;
    var y01 = p1y - cy;
    var x02 = p2x - cx;
    var y02 = p2y - cy;

    var dx = x02 - x01;
    var dy = y02 - y01;

    var a = dx * dx + dy * dy;
    var b = (x01 * dx + y01 * dy) * 2;
    var c = x01 * x01 + y01 * y01 - cr * cr;

    if (-b < 0) return (c < 0);
    if (-b < (a * 2)) return (4 * a * c - b * b < 0);
    return (a + b + c < 0);
}

Arkaniod.prototype.createBrick = function (y, x, type) {

    var validTypes = ["q", " ", "z", "a", "s", "d", "l", "f"];
    if (validTypes.indexOf(type) < 0)
        return;
    if (type === "q") {
        var brick = new PIXI.Sprite.fromImage('./assets/img/brick.png');
        brick.position.set((x * 80), (y * 20));
        brick.width = 80;
        brick.height = 20;
        brick.val = this.getRandomInt(1, 10);
        brick.bonus = 0;
        brick.hit = 1;
        this.cont.addChild(brick);
        return brick;
    } else if (type === "z") {
        var brick = new PIXI.Sprite.fromImage('./assets/img/brick_metal.png');
        brick.position.set((x * 80), (y * 20));
        brick.width = 80;
        brick.height = 20;
        brick.val = this.getRandomInt(20, 30);
        brick.bonus = 0;
        brick.hit = 3;
        this.cont.addChild(brick);
        return brick;
    } else if (type === "a") {
        var brick = new PIXI.Sprite.fromImage('./assets/img/brick_bonus.png');
        brick.position.set((x * 80), (y * 20));
        brick.width = 80;
        brick.height = 20;
        brick.val = this.getRandomInt(20, 30);
        brick.bonus = "bite";
        brick.hit = 1;
        this.cont.addChild(brick);
        return brick;
    } else if (type === "s") {
        var brick = new PIXI.Sprite.fromImage('./assets/img/brick_bonus.png');
        brick.position.set((x * 80), (y * 20));
        brick.width = 80;
        brick.height = 20;
        brick.val = this.getRandomInt(20, 30);
        brick.bonus = "speed";
        brick.hit = 1;
        this.cont.addChild(brick);
        return brick;
    } else if (type === "d") {
        var brick = new PIXI.Sprite.fromImage('./assets/img/brick_bonus2.png');
        brick.position.set((x * 80), (y * 20));
        brick.width = 80;
        brick.height = 20;
        brick.val = this.getRandomInt(20, 30);
        brick.bonus = "superball";
        brick.hit = 1;
        this.cont.addChild(brick);
        return brick;
    } else if (type === "l") {
        var brick = new PIXI.Sprite.fromImage('./assets/img/brick_bonus.png');
        brick.position.set((x * 80), (y * 20));
        brick.width = 80;
        brick.height = 20;
        brick.val = this.getRandomInt(20, 30);
        brick.bonus = "live";
        brick.hit = 1;
        this.cont.addChild(brick);
        return brick;
    } else if (type === "f") {
        var brick = new PIXI.Sprite.fromImage('./assets/img/brick_bonus2.png');
        brick.position.set((x * 80), (y * 20));
        brick.width = 80;
        brick.height = 20;
        brick.val = this.getRandomInt(20, 30);
        brick.bonus = "ball";
        brick.hit = 1;
        this.cont.addChild(brick);
        return brick;
    } else {
        return null;
    }
};

Arkaniod.prototype.updateLvl = function () {
    this.winCounter = 0;
    for (var q = 0; q < this.level.length; q++) {
        for (var i = 0; i < this.level[q].length; i++) {
            if (!(this.level[q][i] === null)) {
                this.winCounter++;
            }
        }
    }

    if (!this.winCounter) {
        this.win();
    }
};

Arkaniod.prototype.win = function () {
    console.log("You WIN!");
    this.endOfLevel();
    var winWindow = new PIXI.Sprite.fromImage('./assets/img/win.jpeg');
    winWindow.width = 800;
    winWindow.height = 600;
    this.app.stage.addChild(winWindow);
    var winText = new PIXI.Text('Congratulations! Your total score is: ' + scoreCounter, this.style);
    winText.x = 100;
    winText.y = 470;
    this.app.stage.addChild(winText);

};

Arkaniod.prototype.getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
};