
var init = function () {
	
	var HOME_START_X = 940;
	var HOME_START_Y = 400;
	
	var OPP_START_X = 720;
	var OPP_START_Y = 400;
	
	var BALL_START_X = 840;
	var BALL_START_Y = 400;
	
	var WAIT_MODE = 0;
	var PLAY_MODE = 1;
	var TOSS_MODE = 2;
	var READY_MODE = 3;
	var SCORE_MODE = 4;
	
	var myScore = 0;
	var opScore = 0;
	
	var bigText;
	var smallText;
	var scoreText1;
	var scoreText2;
	
	var mode = WAIT_MODE;
	
	var frog, otherFrog;
	var ball;
	var group;
	var whistle;
	
	var cursors;
	var spacebar;
	
	var game = new Phaser.Game(width, height, Phaser.CANVAS, "gameArea", {
		preload: preload,
		create: create,
		update: update,
		render: render
	});

	function preload() {

		game.load.pack("main", "assets/pack.json");
		
	}
	
	function create() {

		game.stage.backgroundColor = "0x409d5a";
		
		var map = game.add.tilemap("map");
		map.addTilesetImage("field-tiles", "tiles");
		var layer = map.createLayer("groundLayer");
		layer.resizeWorld();
		
		group = game.add.group();
		
        game.add.image(-41, 237, "net");
        game.add.image(1649, 237, "net2");

        frog = createFrog(group, HOME_START_X, HOME_START_Y, "frog", 200, "left");
        otherFrog = createFrog(group, OPP_START_X, OPP_START_Y, "frog2", 180, "right");
        
        createGoal(group, "goal", -40, 35, function() {
			if (mode !== SCORE_MODE) {
				myScore++;
				mode = SCORE_MODE;
			}
		});
        createGoal(group, "goal2", 1649, 1675, function() {
			if (mode !== SCORE_MODE) {
				opScore++;
				mode = SCORE_MODE;
			}
		});
        
        ball = createBall(BALL_START_X, BALL_START_Y, "ball");
        
        group.sort();
        
        game.camera.follow(frog);
        
		cursors = game.input.keyboard.createCursorKeys();
		spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		
		createText();
		
		whistle = game.sound.add("whistle");
		
	}

	function update() {

		if (ball.body.velocity.x === 0 && ball.body.velocity.y === 0) {
			ball.animations.stop();
		} else {
			var speed = Math.min(1, Math.max(Math.abs(ball.body.velocity.x),
					Math.abs(ball.body.velocity.y)) / 200) * 9;
			if (ball.animations.getAnimation("roll").isPlaying) {
				ball.animations.getAnimation("roll").speed = speed;
			} else {
				ball.animations.play("roll", speed, true);
			}
		}

		// -------------------------------

		if (mode === WAIT_MODE && (spacebar.isDown || game.input.activePointer.isDown)) {
			bigText.visible = false;
			smallText.visible = false;
			mode = PLAY_MODE;
		}

		// ------------------------------

		if (!canMove()) {
			
			frog.body.acceleration.x = 0;
			frog.body.acceleration.y = 0;
			
		} else {
			
			if (cursors.left.isDown) {
				frog.body.acceleration.x -= 80;
			} else if (cursors.right.isDown) {
				frog.body.acceleration.x += 80;
			} else {
				frog.body.acceleration.x = 0;
			}
			
			if (cursors.up.isDown) {
				frog.body.acceleration.y -= 80;
			} else if (cursors.down.isDown) {
				frog.body.acceleration.y += 80;
			} else {
				frog.body.acceleration.y = 0;
			}
			
			if (game.input.activePointer.isDown) {
				
				game.physics.arcade.moveToPointer(frog, 180);
				
			}
			
		}
		
		setAnimation(frog);
		setAnimation(otherFrog);

		group.sort("bottom", Phaser.Group.SORT_ASCENDING);
		
        if (mode === PLAY_MODE && !ball.inPlay()) {
            tossBall(ball.position.x, ball.position.y);
        } else if (mode === READY_MODE && ball.inPlay()) {
            mode = PLAY_MODE;
        }
		
		game.physics.arcade.collide(group, group, function(o1, o2) {
			
			if ((o1.name === "goal" && o2 === ball)) {
				o1.incScore();
				goal();
			}

			if (mode === READY_MODE) {
                if ((o1.name === "frog" && o2 === ball) || (o2.name === "frog" && o1 === ball) ) {
                    // hit ball before it came back into play! retry!
                    console.log("foul!");
                    mode = PLAY_MODE;
                }
            }

		});
		
		if (mode === PLAY_MODE) {
			var coords = setTarget(otherFrog, ball);
			game.physics.arcade.moveToXY(otherFrog, coords.x, coords.y, 100);
		}


	}
	
	/**
	 * Creates a frog.
	 * 
	 * @param grp group to which this frog should be added
	 * @param x x-coordinate for this frog
	 * @param y y-coordinate for this frog
	 * @param ss sprite sheet
	 * @param mv max velocity
	 * @param ani initial animation ('left', 'right', 'front', or 'back)
	 * @returns the created frog
	 */
	function createFrog(grp, x, y, ss, mv, ani) {
		
		var f = grp.create(x, y, ss);
		game.physics.enable(f, Phaser.Physics.ARCADE);
		f.name = "frog";
		f.body.offset.x = 30;
        f.body.offset.y = 20;
        f.body.drag.set(350);
        f.body.setSize(60, 25, 9, 35);
        f.body.allowGravity = false;
        f.body.collideWorldBounds = true;
        f.body.maxVelocity.set(mv);
        
        f.animations.add("left", [0, 1, 2], 10, true);
        f.animations.add("right", [3, 4, 5], 10, true);
        f.animations.add("front", [6, 7, 8], 10, true);
        f.animations.add("back", [9, 10, 11], 10, true);
        f.animations.currentAnim = f.animations.getAnimation(ani);
		
        return f;
        
	}
	
	/**
	 * Creates a ball.
	 * 
	 * @param x x-coordinate
	 * @param y y-coordinate
	 * @param s sprite image
	 * @returns the created ball
	 */
	function createBall(x, y, s) {
		
        var ball = group.create(x, y, s);
        game.physics.enable(ball, Phaser.Physics.ARCADE);
        ball.body.offset.x = 22;
        ball.body.offset.y = 22;
        ball.body.bounce.set(0.899);
        ball.body.drag.set(50);
        ball.body.allowGravity = false;
        ball.body.setSize(45, 30, 0, 15);
        ball.body.collideWorldBounds = false;

        ball.animations.add("roll");
        
        ball.inPlay = function() {
            return (this.position.x > 40 && this.position.y > 30
					&& this.position.x < 1640 && this.position.y < 800);
        };
        
        return ball;

	}
	
	/**
	 * Creates a goal.
	 * 
	 * @param grp
	 * @param s
	 * @param x
	 * @param x2
	 * @param func
	 */
	function createGoal(grp, s, x, x2, func) {
		
		var gp1 = createGoalPost(grp, x, 400, s);
		var gp2 = createGoalPost(grp, x, 240, s);
		
		var g = grp.create(x2, 360);
		g.name = "goal";
		game.physics.enable(g, Phaser.Physics.ARCADE);
		g.body.setSize(10, 160, 0, 0);
		g.body.immovable = true;
		g.incScore = func;

	}
	
	/**
	 * Creates a goal post.
	 * 
	 * @param grp
	 * @param x
	 * @param y
	 * @param s
	 * @returns goalpost object
	 */
	function createGoalPost(grp, x, y, s) {

		var gp = grp.create(x, y, s);
		game.physics.enable(gp, Phaser.Physics.ARCADE);
		gp.body.setSize(112, 22, 0, 98);
		gp.body.immovable = true;
		return gp;
		
	}
	
	function canMove() {
		
		return (mode === PLAY_MODE || mode === READY_MODE);
		
	}
	
	function setTarget(o, b) {
		
		var zone = 0;
		
		if (o.position.x < (b.position.x - 90) && o.position.y < (b.position.y - 35)) {
			zone = 1;
		} else if (o.position.x >= (b.position.x - 90) && o.position.x <= (b.position.x + 30) && o.position.y < (b.position.y - 60)) {
			zone = 2;
		} else if (o.position.x > (b.position.x + 30) && o.position.y < (b.position.y - 60)) {
			zone = 3;
		} else if (o.position.x > (b.position.x + 30) && o.position.y <= (b.position.y - 30) && o.position.y > (b.position.y - 60)) {
			zone = 4;
		} else if (o.position.x > (b.position.x + 30) && o.position.y > (b.position.y - 30) && o.position.y <= (b.position.y)) {
			zone = 5;
		} else if (o.position.x > (b.position.x + 30) && o.position.y > (b.position.y)) {
			zone = 6;
		} else if (o.position.x >= (b.position.x - 90) && o.position.x <= (b.position.x + 30) && o.position.y > (b.position.y)) {
			zone = 7;
		} else if (o.position.x < (b.position.x - 90) && o.position.y > (b.position.y - 25)) {
			zone = 8;
		} else if (o.position.x < (b.position.x - 90) && o.position.y >= (b.position.y - 35) && o.position.y <= (b.position.y - 25)) {
			zone = 9;
		}
		
		var ret = {
				x: o.position.x,
				y: o.position.y
		};
		
		//console.log("zone = " + zone);
		
		if (zone === 1) {
			ret.x = b.position.x - 180;
			ret.y = b.position.y - 10;
		} else if (zone === 2) {
			ret.x = b.position.x - 180;
			ret.y = b.position.y - 180;
		} else if (zone === 3) {
			ret.x = b.position.x - 180;
			ret.y = b.position.y - 180;
		} else if (zone === 4) {
			ret.x = b.position.x + 90;
			ret.y = b.position.y - 120;
		} else if (zone === 5) {
			ret.x = b.position.x + 90;
			ret.y = b.position.y + 60;
		} else if (zone === 6) {
			ret.x = b.position.x - 180;
			ret.y = b.position.y + 120;
		} else if (zone === 7) {
			ret.x = b.position.x - 180;
			ret.y = b.position.y + 120;
		} else if (zone === 8) {
			ret.x = b.position.x - 180;
			ret.y = b.position.y - 50;
		} else if (zone === 9) {
			ret.x = b.position.x + 90;
			ret.y = b.position.y - 15;
		}
		
		return ret;
		
	}
	
	function render() {
		
		// un-comment to see the boxes
		
		//game.debug.body(frog);
	    //game.debug.body(ball);
	    //game.debug.body(otherFrog);
		
	}
	
	function tossBall(x, y) {

	    game.time.events.removeAll();
	    
		whistle.play();

		mode = TOSS_MODE;
		
		var toss = function(x, y) {

			ball.body.velocity.x = 0;
			ball.body.velocity.y = 0;
			
			ball.position.x = x;
			
			if (x < 100) {
				
				ball.position.x = -20;
				ball.body.velocity.x = 200;
				
			} else if (x > 1640) {
				
				ball.position.x = game.world.width;
				ball.body.velocity.x = -200;
				
			}
			
			if (y > game.height / 2) {
				ball.position.y = game.world.height;
				ball.body.velocity.y = -200;
			} else {
				ball.position.y = -20;
				ball.body.velocity.y = 200;
			}

		};
		
		game.time.events.add(1000, function() {
			
			mode = READY_MODE;
			
			// the ball could have come back in play in between
			// these two events, if the frog stands in the corner
			// and bounces it back out twice in a row. checking
			// here to see if the ball is not in play prevents
			// an endless loop of toss-ins.
			if (!ball.inPlay()) {
			    game.time.events.add(1000, function() {
			        toss(x, y);
			    }, this);
			}
			
		}, this);
		
	}

	function stopSprite(s) {

		s.body.acceleration.x = 0;
		s.body.acceleration.y = 0;

		s.body.velocity.x = 0;
		s.body.velocity.y = 0;
		
	}
	
	function goal() {
		
		stopSprite(ball);
		
		scoreText1.text = "Home: " + myScore;
		scoreText2.text = "Away: " + opScore;

		bigText.text = "GOAL!";
		bigText.visible = true;
		
		game.time.events.add(2000, reset);
		
	}
	
	function setAnimation(f) {
		
//		if (f.body.acceleration.x == 0 && f.body.acceleration.y == 0) {
//			f.animations.stop(null, true);
//		}
		
		if (f.body.velocity.x === 0 && f.body.velocity.y === 0) {
			f.animations.stop(null, true);
		} else {
			
			if (Math.abs(f.body.velocity.x) >= Math.abs(f.body.velocity.y)) {
				
				if (f.body.velocity.x > 0) {
					f.animations.play("right");
				} else if (f.body.velocity.x < 0) {
					f.animations.play("left");
				}
				
			} else {

				if (f.body.velocity.y > 0) {
					f.animations.play("front");
				} else if (f.body.velocity.y < 0) {
					f.animations.play("back");
				}

			}
			
		}
		
	}
	
	function reset() {
		
		mode = WAIT_MODE;
		
		bigText.visible = false;
		smallText.visible = true;
		
		stopSprite(frog);
		stopSprite(otherFrog);
		stopSprite(ball);
		
		frog.position.x = HOME_START_X;
		frog.position.y = HOME_START_Y;

		frog.animations.stop(null, true);
        frog.animations.currentAnim = frog.animations.getAnimation("left");
		
		otherFrog.position.x = OPP_START_X;
		otherFrog.position.y = OPP_START_Y;

		otherFrog.animations.stop(null, true);
        otherFrog.animations.currentAnim = otherFrog.animations.getAnimation("right");

        ball.position.x = BALL_START_X;
        ball.position.y = BALL_START_Y;
		
	}

	function createText() {

		scoreText1 = game.add.text(20, 10, "Home: " + myScore);
		scoreText1.fixedToCamera = true;

		scoreText2 = game.add.text((width - 140), 10, " Away: " + opScore);
		scoreText2.fixedToCamera = true;

	    bigText = game.add.text((width/2), 200, "Frog Soccer!");
	    bigText.fixedToCamera = true;
	    bigText.anchor.setTo(0.5);
	    bigText.font = 'Sniglet';
	    bigText.fontSize = 80;
	    bigText.fill = "#0000FF";

	    bigText.align = 'center';
	    bigText.stroke = '#000000';
	    bigText.strokeThickness = 2;

	    smallText = game.add.text((width/2), 300, "Press <Space> To Start!");
	    smallText.fixedToCamera = true;
	    smallText.anchor.setTo(0.5);
	    smallText.font = 'Sniglet';
	    smallText.fontSize = 30;
	    smallText.fill = "#000000";
	    
	}
	
};

var wfconfig = {

    active: function() { 
    	console.log("font loaded");
    	init();
    },
    
    inactive: function() {
        console.log("fonts could not be loaded!");
        init();
    },

    google: {
      families: ['Sniglet']
    }

};

window.onload = function() {
	WebFont.load(wfconfig);
};

