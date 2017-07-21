(function () {
	'use strict';

	// Dimensions
	var WIDTH = 700;
	var HEIGHT = 600;
	var pi = Math.PI;

	// Key codes
	var KEY_UP = 38;
	var KEY_DOWN = 40;

	// Game variables
	var canvas, context, keystate;
	var player = {
		x: null,
		y: null,
		width: 20,
		height: 100,

		update: function () {
			if (keystate[KEY_UP]) {
				this.y -= 7;
			}
			if (keystate[KEY_DOWN]) {
				this.y += 7;
			}

			this.y = Math.max(Math.min(this.y, HEIGHT - this.height), 0);
		},

		draw: function () {
			context.fillRect(this.x, this.y, this.width, this.height);
		}
	};

	var ai = {
		x: null,
		y: null,
		width: 20,
		height: 100,

		update: function () {
			var yDestination = ball.y - (this.height - ball.side) * 0.5;
			this.y += (yDestination - this.y) * 0.1;
			this.y = Math.max(Math.min(this.y, HEIGHT - this.height), 0);
		},

		draw: function () {
			context.fillRect(this.x, this.y, this.width, this.height);
		}
	};

	var ball = {
		x: null,
		y: null,
		velocity: null,
		side: 20,
		speed: 7,

		serve: function (side) {
			var random = Math.random();
			this.x = side === 1 ? player.x + player.width : ai.x - this.side;
			this.y = (HEIGHT - this.side) * random;

			var angle = 0.1 * pi * (1 - 2 * random);
			this.velocity = {
				x: side * this.speed * Math.cos(angle),
				y: this.speed * Math.sin(angle)
			}
		},

		update: function () {
			this.x += this.velocity.x;
			this.y += this.velocity.y;

			if (this.y < 0 || this.y + this.side > HEIGHT) {
				var offset = this.velocity.y < 0 ? 0 - this.y : HEIGHT - (this.y + this.side);
				this.y += 2 * offset;
				this.velocity.y *= -1;
			}

			var intersect = function (x1, y1, width1, height1, x2, y2, width2, height2) {
				return x1 < x2 + width2 && y1 < y2 + height2 && x2 < x1 + width1 && y2 < y1 + height1;
			};

			var paddle = this.velocity.x < 0 ? player : ai;
			if (intersect(paddle.x, paddle.y, paddle.width, paddle.height, this.x, this.y, this.side, this.side)) {
				this.x = paddle === player ? player.x + player.width : ai.x - this.side;
				var paddleContact = (this.y + this.side - paddle.y) / (paddle.height + this.side);
				var angle = 0.25 * pi * (2 * paddleContact - 1);
				var smash = Math.abs(angle) > 0.2 * pi ? 1.5 : 1;
				this.velocity.x = smash * (paddle === player ? 1 : -1) * this.speed * Math.cos(angle);
				this.velocity.y = smash * this.speed * Math.sin(angle);
			}

			if (this.x + this.side < 0 || this.x > WIDTH) {
				this.serve(paddle === player ? 1 : -1);
			}
		},

		draw: function () {
			// context.fillRect(this.x, this.y, this.side, this.side);
			context.beginPath();
			context.arc(this.x, this.y, 10, 0, 2 * pi);
			context.fillStyle = "white";
			context.fill();
			context.closePath();
		}
	};

	function main() {
		var container = document.getElementsByClassName("container");
		container[0].style.display = "none";
		canvas = document.createElement("canvas");
		canvas.width = WIDTH;
		canvas.height = HEIGHT;

		context = canvas.getContext("2d");

		document.body.appendChild(canvas);

		keystate = {};
		document.addEventListener("keydown", function (event) {
			keystate[event.keyCode] = true;
		});
		document.addEventListener("keyup", function (event) {
			delete keystate[event.keyCode];
		});

		init();

		var loop = function () {
			update();
			draw();

			window.requestAnimationFrame(loop, canvas);
		};

		window.requestAnimationFrame(loop, canvas);
	}

	function init() {
		player.x = player.width;
		player.y = (HEIGHT - player.height) / 2;

		ai.x = WIDTH - (player.width + ai.width);
		ai.y = (HEIGHT - ai.height) / 2;

		ball.serve(1);
	}

	function update() {
		ball.update();
		player.update();
		ai.update();
	}

	function draw() {
		context.fillRect(0, 0, WIDTH, HEIGHT);

		context.save();
		context.fillStyle = "#fff";

		ball.draw();
		player.draw();
		ai.draw();

		var width = 4;
		var x = (WIDTH - width) * 0.5;
		var y = 0;
		var step = HEIGHT / 20;

		while (y < HEIGHT) {
			context.fillRect(x, y + step * 0.25, width, step * 0.5);
			y += step;
		}
		context.restore();
	}

	window.onload = function () {
		document.getElementById("startButton").onclick = main;
		// main();
	}
})();