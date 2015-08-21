
var init = function () {
	
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
	
	var game = new Phaser.Game(width, height, Phaser.AUTO, 'gameArea', {
		preload: preload,
		create: create,
		update: update,
		render: render
	});

	function preload() {

		// "normal" images
		game.load.image('goal', './images/goal.png');
		game.load.image('net', './images/net.png');
		game.load.image('goal2', './images/goal2.png');
		game.load.image('net2', './images/net2.png');
		
		// spritesheet for ball animation
		game.load.spritesheet('ball', 'images/ball_animation.png', 45, 45);

		// spritesheets for frog animation
		game.load.spritesheet('frog', 'images/frog_ani.png', 79, 60);
		game.load.spritesheet('frog2', 'images/frog_ani2.png', 79, 60);

		// tilemap and tiles
		game.load.tilemap('map', 'images/ground.json', null, Phaser.Tilemap.TILED_JSON);
	    game.load.image('tiles', 'images/field-tiles.png');
	    
	    // sounds
	    game.load.audio('whistle', 'audio/whistle.mp3');

	}
	
	var mode = WAIT_MODE;
	
	var frog, otherFrog;
	var tree;
	var ball;
	var group;
	var anim;
	var goalPost1a, goalPost1b;
	var goal1, goal2;
	var whistle;
	
	var map;
	var layer;
	
	var cursors;
	var spacebar;
	
	function create() {

		game.stage.backgroundColor = "0x409d5a";
		
		map = game.add.tilemap('map');
		map.addTilesetImage('field-tiles', 'tiles');;
		layer = map.createLayer('groundLayer');
		layer.resizeWorld();
		
		group = game.add.group();
		
        var net  = game.add.image(-41, 237, 'net');
        var net2 = game.add.image(1649, 237, 'net2');

		frog = group.create(940, 400, 'frog');
		game.physics.enable(frog, Phaser.Physics.ARCADE);
        frog.body.offset.x = 30;
        frog.body.offset.y = 20;
        frog.body.drag.set(350);
        frog.body.setSize(60, 25, 9, 35);
        frog.body.allowGravity = false;
        frog.body.collideWorldBounds = true;
        frog.body.maxVelocity.set(200);
        
        frog.animations.add("left", [0, 1, 2], 10, true);
        frog.animations.add("right", [3, 4, 5], 10, true);
        frog.animations.add("front", [6, 7, 8], 10, true);
        frog.animations.add("back", [9, 10, 11], 10, true);
        frog.animations.currentAnim = frog.animations.getAnimation("left");
        
		otherFrog = group.create(720, 400, 'frog2');
		game.physics.enable(otherFrog, Phaser.Physics.ARCADE);
		otherFrog.body.offset.x = 30;
		otherFrog.body.offset.y = 20;
		otherFrog.body.drag.set(350);
		otherFrog.body.setSize(60, 25, 9, 35);
		otherFrog.body.allowGravity = false;
		otherFrog.body.collideWorldBounds = true;
		otherFrog.body.maxVelocity.set(180);
		otherFrog.chase = true;
		
		otherFrog.animations.add("left", [0, 1, 2], 8, true);
		otherFrog.animations.add("right", [3, 4, 5], 8, true);
		otherFrog.animations.add("front", [6, 7, 8], 8, true);
        otherFrog.animations.add("back", [9, 10, 11], 8, true);
        otherFrog.animations.currentAnim = otherFrog.animations.getAnimation("right");

        
		goalPost1a = group.create(-40, 400, 'goal');
		game.physics.enable(goalPost1a, Phaser.Physics.ARCADE);
		goalPost1a.body.setSize(112, 22, 0, 98);
		goalPost1a.body.immovable = true;

		goalPost2a = group.create(1649, 400, 'goal2');
		game.physics.enable(goalPost2a, Phaser.Physics.ARCADE);
		goalPost2a.body.setSize(112, 22, 0, 98);
		goalPost2a.body.immovable = true;

		goalPost1b = group.create(-40, 240, 'goal');
		game.physics.enable(goalPost1b, Phaser.Physics.ARCADE);
		goalPost1b.body.setSize(112, 22, 0, 98);
		goalPost1b.body.immovable = true;

		goalPost2b = group.create(1649, 240, 'goal2');
		game.physics.enable(goalPost2b, Phaser.Physics.ARCADE);
		goalPost2b.body.setSize(112, 22, 0, 98);
		goalPost2b.body.immovable = true;

		goal1 = group.create(35, 360);
		goal1.name = "goal";
		game.physics.enable(goal1, Phaser.Physics.ARCADE);
		goal1.body.setSize(10, 160, 0, 0);
		goal1.body.immovable = true;
		goal1.incScore = function() {
			if (mode !== SCORE_MODE) {
				myScore++;
				mode = SCORE_MODE;
			}
		};
		
		goal2 = group.create(1675, 360);
		goal2.name = "goal";
		game.physics.enable(goal2, Phaser.Physics.ARCADE);
		goal2.body.setSize(10, 160, 0, 0);
		goal2.body.immovable = true;
		goal2.incScore = function() {
			if (mode !== SCORE_MODE) {
				opScore++;
				mode = SCORE_MODE;
			}
		};
		
        ball = group.create(840, 400, 'ball');
        game.physics.enable(ball, Phaser.Physics.ARCADE);
        ball.body.offset.x = 22;
        ball.body.offset.y = 22;
        ball.body.bounce.set(0.899);
        ball.body.drag.set(50);
        ball.body.allowGravity = false;
        ball.body.setSize(45, 30, 0, 15);
        ball.body.collideWorldBounds = false;

        anim = ball.animations.add("roll");
        
        group.sort();
        
        game.camera.follow(frog);
        
		cursors = game.input.keyboard.createCursorKeys();
		spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		
		createText();
		
		whistle = game.sound.add("whistle");
		
	}

	function update() {

		if (ball.body.velocity.x == 0 && ball.body.velocity.y == 0) {
			anim.stop();
		} else {
			var speed = Math.min(1, Math.max(Math.abs(ball.body.velocity.x),
					Math.abs(ball.body.velocity.y)) / 200) * 9;
			if (anim.isPlaying) {
				anim.speed = speed;
			} else {
				anim.play(speed, true);
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

		group.sort('bottom', Phaser.Group.SORT_ASCENDING);
		game.physics.arcade.collide(group, group, function(o1, o2) {
			
			if ((o1.name === "goal" && o2 === ball)) {
				o1.incScore();
				goal();
			}
			
		});
		
		if (mode === PLAY_MODE) {
			var coords = setTarget(otherFrog, ball);
			game.physics.arcade.moveToXY(otherFrog, coords.x, coords.y, 100);
		}

		if (mode === PLAY_MODE
				&& (ball.position.x < 40 || ball.position.y < 30
						|| ball.position.x > 1640 || ball.position.y > 800)) {

			whistle.play();

			tossBall(ball.position.x, ball.position.y);

		}

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
	    //game.debug.body(goal1);
	    //game.debug.body(goal2);
		
	}
	
	function tossBall(x, y) {

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

			game.time.events.add(500, function() {
				mode = PLAY_MODE;
			}, this);

		};
		
		game.time.events.add(1000, function() {
			
			mode = READY_MODE;
			
			game.time.events.add(1000, function() {
				toss(x, y);
			}, this);
			
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
		
		if (f.body.velocity.x == 0 && f.body.velocity.y == 0) {
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
		
		frog.position.x = 940;
		frog.position.y = 400;

		frog.animations.stop(null, true);
        frog.animations.currentAnim = frog.animations.getAnimation("left");
		
		otherFrog.position.x = 720;
		otherFrog.position.y = 400;

		otherFrog.animations.stop(null, true);
        otherFrog.animations.currentAnim = otherFrog.animations.getAnimation("right");

        ball.position.x = 840;
        ball.position.y = 400;
		
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

    google: {
      families: ['Sniglet']
    }

};

window.onload = function() {
	WebFont.load(wfconfig);
};

