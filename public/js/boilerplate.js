var width = window.innerWidth;
var height = window.innerHeight;

var init = function () {
	
	var game = new Phaser.Game(width, height, Phaser.AUTO, 'test', null, false, true);
	
	var BasicGame = function (game) { };

	BasicGame.Boot = function (game) { };

	BasicGame.Boot.prototype =
 	{
		preload : function() {

			// load game resouces here
			game.load.image('id1', 'path/to/image1.png');
			game.load.image('id2', 'path/to/image2.png');

			// add and configure plugins...

			// set world size, turn off physics, etc.

		},

		create : function() {

			// setup game elements here.
			// create sprites, controls, camera, etc.

		},

		update : function() {

			// handle movement stuff...

			// check for collisions, etc.

		},

		render : function() {

			// special render handling

		}

	};
	
	game.state.add('Boot', BasicGame.Boot);
	game.state.start('Boot');
	
};

window.onload = init;



