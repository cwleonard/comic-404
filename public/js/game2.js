var width = 1200;
var height = 800;

var init = function () {
	
	var WAIT_MODE = 0;
	var PLAY_MODE = 1;
	var TOSS_MODE = 2;
	var READY_MODE = 3;
	var SCORE_MODE = 4;
	
	
	var game = new Phaser.Game(width, height, Phaser.AUTO, 'test', {
		preload: preload,
		create: create,
		update: update,
		render: render
	});
	
	function preload() {

		// "normal" images
		game.load.image('frog', 'images/frog.png');
		game.load.image('goal', 'images/goal.png');
		game.load.image('net', 'images/net.png');
		
		// spritesheet for ball animation
		game.load.spritesheet('ball', 'images/ball_animation.png', 45, 45);

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
		
        var net = game.add.image(-41, 237, 'net');

		frog = group.create(720, 400, 'frog');
		game.physics.enable(frog, Phaser.Physics.ARCADE);
        frog.body.offset.x = 30;
        frog.body.offset.y = 40;
        frog.body.drag.set(350);
        frog.body.setSize(60, 25, 0, 42);
        frog.body.allowGravity = false;
        frog.body.collideWorldBounds = true;
        frog.body.maxVelocity.set(200);
        
		otherFrog = group.create(940, 400, 'frog');
		game.physics.enable(otherFrog, Phaser.Physics.ARCADE);
		otherFrog.body.offset.x = 30;
		otherFrog.body.offset.y = 40;
		otherFrog.body.drag.set(350);
		otherFrog.body.setSize(60, 25, 0, 42);
		otherFrog.body.allowGravity = false;
		otherFrog.body.collideWorldBounds = true;
		otherFrog.body.maxVelocity.set(200);
		otherFrog.chase = true;
        
		goalPost1a = group.create(-40, 400, 'goal');
		game.physics.enable(goalPost1a, Phaser.Physics.ARCADE);
		goalPost1a.body.setSize(112, 22, 0, 98);
		goalPost1a.body.immovable = true;
		
		goalPost1b = group.create(-40, 240, 'goal');
		game.physics.enable(goalPost1b, Phaser.Physics.ARCADE);
		goalPost1b.body.setSize(112, 22, 0, 98);
		goalPost1b.body.immovable = true;
		
		goal1 = group.create(35, 360);
		goal1.name = "goal";
		game.physics.enable(goal1, Phaser.Physics.ARCADE);
		goal1.body.setSize(10, 160, 0, 0);
		goal1.body.immovable = true;
		
		goal2 = group.create(1675, 360);
		goal2.name = "goal";
		game.physics.enable(goal2, Phaser.Physics.ARCADE);
		goal2.body.setSize(10, 160, 0, 0);
		goal2.body.immovable = true;
		
		
        ball = group.create(840, 400, 'ball');
        game.physics.enable(ball, Phaser.Physics.ARCADE);
        ball.body.offset.x = 22;
        ball.body.offset.y = 22;
        ball.body.bounce.set(0.999);
        ball.body.drag.set(40);
        ball.body.allowGravity = false;
        ball.body.setSize(45, 30, 0, 15);
        ball.body.collideWorldBounds = false;

        anim = ball.animations.add("roll");
        
        group.sort();
        
        game.camera.follow(frog);
        
		cursors = game.input.keyboard.createCursorKeys();
		spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		
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
		
		if (mode === WAIT_MODE && spacebar.isDown) {
			mode = PLAY_MODE;
		}
		
		// ------------------------------
		
		
		if (!canMove()) {
			
			frog.body.acceleration.x = 0;
			frog.body.acceleration.y = 0;
			
		} else {
			
			if (cursors.left.isDown) {
				frog.body.acceleration.x -= 100;
			} else if (cursors.right.isDown) {
				frog.body.acceleration.x += 100;
			} else {
				frog.body.acceleration.x = 0;
			}
			
			if (cursors.up.isDown) {
				frog.body.acceleration.y -= 100;
			} else if (cursors.down.isDown) {
				frog.body.acceleration.y += 100;
			} else {
				frog.body.acceleration.y = 0;
			}
			
		}
		

		group.sort('bottom', Phaser.Group.SORT_ASCENDING);
		game.physics.arcade.collide(group, group, function(o1, o2) {
			
			if ((o1 === otherFrog && o2 === ball) || (o2 === otherFrog && o1 === ball)) {
				otherFrog.chase = false;
				otherFrog.kick = false;
				setTimeout(function() {
					otherFrog.chase = true;
				}, 250);
			}
			
			if ((o1.name === "goal" && o2 === ball) || (o2.name === "goal" && o1 === ball)) {
				reset();
			}
			
		});
		
		if (mode === PLAY_MODE && otherFrog.chase) {

			var targetX, targetY;

			if (otherFrog.position.x > ball.position.x - 100) {
				targetX = ball.position.x - 100;
				if (Math.abs(otherFrog.position.y - ball.position.y) < 25) {
					targetY = ball.position.y + 25;
				} else {
					targetY = otherFrog.position.y;
				}
				
			} else if (otherFrog.position.y > ball.position.y || otherFrog.position.y < ball.position.y - 25) {

				targetX = ball.position.x - 100;
				targetY = ball.position.y - 25;

			} else {
				otherFrog.chase = false;
				otherFrog.kick = true;
			}

			game.physics.arcade.moveToXY(otherFrog, targetX, targetY, 100);

		} else if (canMove() && otherFrog.kick) {

			game.physics.arcade.moveToObject(otherFrog, ball, 150);

		}
		

		if (mode === PLAY_MODE
				&& (ball.position.x < 40 || ball.position.y < 50
						|| ball.position.x > 1640 || ball.position.y > 800)) {

			whistle.play();

			otherFrog.kick = false;
			otherFrog.chase = true;

			tossBall(ball.position.x, ball.position.y);

		}

	}
	
	function canMove() {
		
		return (mode === PLAY_MODE || mode === READY_MODE);
		
	}
	
	function render() {
		
		//game.debug.body(frog); // un-comment to see the boxes
	    //game.debug.body(ball);
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

			setTimeout(function() {
				mode = PLAY_MODE;
			}, 500);

		};
		
		setTimeout(function() {
			
			mode = READY_MODE;

			setTimeout(function() {
				
				toss(x, y);
				
			}, 1000);
			
		}, 1000);
		

	}

	function stopSprite(s) {

		s.body.acceleration.x = 0;
		s.body.acceleration.y = 0;

		s.body.velocity.x = 0;
		s.body.velocity.y = 0;
		
	}
	
	function reset() {
		
		mode = WAIT_MODE;
		
		stopSprite(frog);
		stopSprite(otherFrog);
		stopSprite(ball);
		
		frog.position.x = 720;
		frog.position.y = 400;

		otherFrog.position.x = 940;
		otherFrog.position.y = 400;

        ball.position.x = 840;
        ball.position.y = 400;
		
	}

};

window.onload = init;
