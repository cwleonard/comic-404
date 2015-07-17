var width = window.innerWidth;
var height = window.innerHeight;

var init = function () {
	
	var game = new Phaser.Game(width, height, Phaser.AUTO, 'test', null, false, true);
	
	var BasicGame = function (game) { };

	BasicGame.Boot = function (game) { };

	BasicGame.Boot.prototype =
	{
		    preload: function () {
		    	
		        //game.load.image('tree1', 'images/tree1.png');
		        game.load.image('tree2', 'images/tree2.png');
		        game.load.image('ball', 'images/ball.png');

		        game.load.image('tile', 'images/ground_tile.png');
		        
		        
		        game.load.image('frog','images/frog.png');
		     
		        game.time.advancedTiming = false;

		        // Add the Isometric plug-in to Phaser
		        game.plugins.add(new Phaser.Plugin.Isometric(game));

		        // Set the world size
		        game.world.setBounds(0, 0, 2048, 1024);

		        // Start the physical system
		        game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);

		        // set the middle of the world in the middle of the screen
		        game.iso.anchor.setTo(0.5, 0);
		        
		    },

		    create: function () {
		    	
		    	// set the Background color of our game
		    	game.stage.backgroundColor = "0x409d5a";
		    	
		    	// create groups for different sprites
		    	floorGroup = game.add.group();
		        obstacleGroup = game.add.group();
		      
		        // set the gravity in our game
		        //game.physics.isoArcade.gravity.setTo(0, 0, -500);
	    
		        // create the floor tiles
		        var floorTile;
		        for (var xt = 1024; xt > 0; xt -= 35) {
		            for (var yt = 1024; yt > 0; yt -= 35) {
		            	floorTile = game.add.isoSprite(xt, yt, 0, 'tile', 0, floorGroup);
		            	floorTile.anchor.set(0.5);
		            }
		        }
		        
//		        tree1 = game.add.isoSprite(xt, yt, 0, 'tree1', 0, obstacleGroup);
//		        tree1.anchor.set(0.5, 0.5);
//		        tree1.body.setSize(55, 55, 288);

		        var tree1 = game.add.isoSprite(500, 500, 0, 'tree2', 0, obstacleGroup);
		        tree1.anchor.set(0.5);
		        game.physics.isoArcade.enable(tree1);
		        tree1.body.collideWorldBounds = true;
		        tree1.body.immovable = true;
		        
		        var ball = game.add.isoSprite(600, 600, 0, 'ball', 0, obstacleGroup);
		        ball.anchor.set(0.5);
		        game.physics.isoArcade.enable(ball);
		        ball.body.collideWorldBounds = true;
		        ball.body.bounce.set(0.8, 0.8, 0);
		        ball.body.drag.set(50, 50, 0);
		        
        
		        // Set up our controls.
		        this.cursors = game.input.keyboard.createCursorKeys();

		        this.game.input.keyboard.addKeyCapture([
		            Phaser.Keyboard.LEFT,
		            Phaser.Keyboard.RIGHT,
		            Phaser.Keyboard.UP,
		            Phaser.Keyboard.DOWN,
		            Phaser.Keyboard.SPACEBAR
		        ]);

		        
		        // Creste the player
		        player = game.add.isoSprite(350, 280, 0, 'frog', 0, obstacleGroup);
		        player.anchor.set(0.5);
		        
		        // enable physics on the player
		        game.physics.isoArcade.enable(player);
		        player.body.collideWorldBounds = true;

		        game.camera.follow(player);
		    		    	
		    	
		    },
		    
		    update: function () {
		    	
		    	
		    	// Move the player
		        var speed = 100;
		       
		        if (this.cursors.up.isDown) {
		            player.body.velocity.y = -speed*2;
		            player.body.velocity.x = -speed*2;
		        }
		        else if (this.cursors.down.isDown) {
		            player.body.velocity.y = speed*2;
		            player.body.velocity.x = speed*2;
		        }
		        else {
		            player.body.velocity.y = 0;
		            player.body.velocity.x = 0;
		        }

		        if (this.cursors.left.isDown) {
		            player.body.velocity.x = -speed;
		            player.body.velocity.y = speed;
		        }
		        else if (this.cursors.right.isDown) {
		            player.body.velocity.x = speed;
		            player.body.velocity.y = -speed;
		        }
		        
		        game.physics.isoArcade.collide(obstacleGroup);
		        game.iso.topologicalSort(obstacleGroup);
		    	
		    },
		    
		    render: function () {
			      
//		    	obstacleGroup.forEach(function (tile) {
//		            game.debug.body(tile, 'rgba(189, 221, 235, 0.6)', false);
//		        });
		    	
		    }
			
	};
	
	game.state.add('Boot', BasicGame.Boot);
	game.state.start('Boot');
	
	// generate random number
	function rndNum(num) {
		
		return Math.round(Math.random() * num);
		
	}
	
	
};

window.onload = init;



