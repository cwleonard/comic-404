var width = 800;
var height = 600;

var init = function () {
	
	var game = new Phaser.Game(width, height, Phaser.AUTO, 'test', {
		preload: preload,
		create: create,
		update: update,
		render: render
	});
	
	function preload() {

		game.load.image('tree2', 'images/tree2.png');
		game.load.image('frog', 'images/frog.png');
		game.load.spritesheet('ball', 'images/ball_animation.png', 45, 45);

		game.load.tilemap('map', 'images/ground.json', null, Phaser.Tilemap.TILED_JSON);
	    game.load.image('tiles', 'images/groundTiles.png');

	}
	
	var frog;
	var otherFrog;
	var tree;
	var ball;
	var group;
	var cursors;
	var anim;
	
	var map;
	var layer;
	
	function create() {

		game.stage.backgroundColor = "0x409d5a";
		
		map = game.add.tilemap('map');
		map.addTilesetImage('groundTiles', 'tiles');;
		layer = map.createLayer('groundLayer');
		layer.resizeWorld();
		
		group = game.add.group();

		frog = group.create(200, 200, 'frog');
		game.physics.enable(frog, Phaser.Physics.ARCADE);
        frog.body.drag.set(300);
        frog.body.setSize(60, 25, 0, 42);
        frog.body.allowGravity = false;
        frog.body.collideWorldBounds = true;
        frog.body.maxVelocity.set(200);

        
		otherFrog = group.create(600, 200, 'frog');
		game.physics.enable(otherFrog, Phaser.Physics.ARCADE);
		otherFrog.body.drag.set(300);
		otherFrog.body.setSize(60, 25, 0, 42);
		otherFrog.body.allowGravity = false;
		otherFrog.body.collideWorldBounds = true;
		otherFrog.body.maxVelocity.set(200);
		otherFrog.chase = true;
        
        
		tree = group.create(100, 300, 'tree2');
		game.physics.enable(tree, Phaser.Physics.ARCADE);
		tree.body.setSize(79, 25, 0, 98);
		tree.body.immovable = true;
		
        ball = group.create(300, 300, 'ball');
        game.physics.enable(ball, Phaser.Physics.ARCADE);
        ball.body.bounce.set(1);
        ball.body.drag.set(20);
        ball.body.allowGravity = false;
        ball.body.setSize(45, 35, 0, 8);
        ball.body.collideWorldBounds = true;

        anim = ball.animations.add("roll");
        
        group.sort();
		
        game.camera.follow(frog);
        
		cursors = game.input.keyboard.createCursorKeys();	

	}

	function update() {

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

		group.sort('bottom', Phaser.Group.SORT_ASCENDING);
		game.physics.arcade.collide(group, group, function(o1, o2) {
			if ((o1 === otherFrog && o2 === ball) || (o2 === otherFrog && o1 === ball)) {
				otherFrog.chase = false;
				otherFrog.kick = false;
				setTimeout(function() {
					otherFrog.chase = true;
				}, 250);
			}
		});
		
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
		
		if (otherFrog.chase) {
			
			var targetX, targetY;
			
			if (otherFrog.position.x > ball.position.x - 100) {
				targetX = ball.position.x - 100;
				targetY = otherFrog.position.y;
			} else if (otherFrog.position.y > ball.position.y || otherFrog.position.y < ball.position.y - 25) {
				targetX = ball.position.x - 100;
				targetY = ball.position.y - 25;
			} else {
				otherFrog.chase = false;
				otherFrog.kick = true;
			}
			
			game.physics.arcade.moveToXY(otherFrog, targetX, targetY, 100);				
				
		} else if (otherFrog.kick) {
			game.physics.arcade.moveToObject(otherFrog, ball, 150);
		}

	}
	
	function render() {
		
		//game.debug.body(frog); // un-comment to see the boxes
	    //game.debug.body(ball);
	    //game.debug.body(tree);
		
	}

};

window.onload = init;
