import BoardController from './controllers/BoardController.js';
import SnakeController from './controllers/SnakeController.js';

export default class Game {
	constructor() {
		this.init();
		this.preload();
	}
	init() {
		this.canvas = document.querySelector('canvas');
		this.context = this.canvas.getContext('2d');
		this.maxWidth = 640;
		this.maxHeight = 360;
		this.width = 0;
		this.height = 0;
		this.centerX = this.context.canvas.width / 2;
		this.centerY = this.context.canvas.height / 2;
		this.score = 0;
	}
	async preload() {
		await this.preloadImages();
		await this.preloadSounds();
		this.create();
	}
	async preloadImages() {
		this.background = await this.preloadImage(
			'../images/background.png',
			0,
			0,
		);
		this.cell = await this.preloadImage('../images/cell.png');
		this.food = await this.preloadImage('../images/food.png');
		this.snakeBody = await this.preloadImage('../images/body.png');
		this.snakeHead = await this.preloadImage('../images/head.png');
		this.bomb = await this.preloadImage('../images/bomb.png');
	}
	async preloadSounds() {
		this.bombSound = await this.preloadSound('../sounds/bomb.wav');
		this.foodSound = await this.preloadSound('../sounds/food.wav');
		this.gameOverSound = await this.preloadSound('../sounds/game-over.wav');
		this.snakeSound = await this.preloadSound('../sounds/snakecharmer.wav');
		this.snakeSound.loop = true;
		this.snakeSound.volume = 0.1;
	}
	async preloadImage(path, x = -100, y = -100) {
		let image = new Image();
		await new Promise((resolve, reject) => {
			image.src = path;
			image.addEventListener('load', () => {
				window.requestAnimationFrame(() => {
					this.context.drawImage(image, x, y);
				});
				resolve(image);
			});
			image.addEventListener('error', () => {
				reject(new Error("Couldn't load image"));
			});
		});
		return image;
	}
	async preloadSound(path) {
		let sound = new Audio();
		await new Promise((resolve, reject) => {
			sound.src = path;
			sound.loop = false;
			sound.load();
			sound.addEventListener(
				'canplaythrough',
				() => {
					resolve(sound);
				},
				{ once: true },
			);
			sound.addEventListener('error', () => {
				reject(new Error("Couldn't load sound"));
			});
		});
		return sound;
	}
	create() {
		this.boardController = new BoardController();
		this.resizeCanvas();
		this.snakeController = new SnakeController(
			this.context,
			this.boardController,
			this.snakeBody,
			this.snakeHead,
		);
		this.boardController.addObject(this.snakeController, 'food');
		this.boardController.addObject(this.snakeController, 'bomb');
		this.createListeners();
		this.createFont();
	}
	createListeners() {
		let gameisStarted = false;
		window.addEventListener('keydown', (e) => {
			if (!gameisStarted) {
				gameisStarted = true;
				this.start();
			}
			const { key } = e;
			if (key === 'ArrowUp') {
				this.snakeController.deltaX = 0;
				this.snakeController.deltaY = -1;
				this.snakeController.degree = 0;
			} else if (key === 'ArrowDown') {
				this.snakeController.deltaX = 0;
				this.snakeController.deltaY = 1;
				this.snakeController.degree = 180;
			} else if (key === 'ArrowLeft') {
				this.snakeController.deltaX = -1;
				this.snakeController.deltaY = 0;
				this.snakeController.degree = 270;
			} else if (key === 'ArrowRight') {
				this.snakeController.deltaX = 1;
				this.snakeController.deltaY = 0;
				this.snakeController.degree = 90;
			}
			this.snakeController.snake.startMoving();
		});
	}
	createFont() {
		this.context.font = '20px Roboto';
		this.context.fillStyle = '#747474';
	}
	createScore() {
		this.context.fillText(`Score: ${this.score}`, 25, 25);
	}
	drawBackground() {
		this.context.drawImage(
			this.background,
			(this.width - this.background.width) / 2,
			(this.height - this.background.height) / 2,
		);
	}
	resizeCanvas() {
		this.minWidth =
			(this.boardController.board.boadWidth + 1) * (this.cell.width + 1);
		this.minHeight =
			(this.boardController.board.boadHeight + 1) *
			(this.cell.height + 1);
		if (
			window.innerWidth / window.innerHeight >
			this.maxWidth / this.maxHeight
		) {
			this.fitWidth();
		} else {
			this.fitHeight();
		}
		this.context.canvas.width = this.width;
		this.context.canvas.height = this.height;
		this.drawBackground();
		this.boardController &&
			this.boardController.render(
				this.context,
				this.cell,
				this.food,
				this.bomb,
			);
	}
	fitWidth() {
		this.height = Math.round(
			(this.width * window.innerHeight) / window.innerWidth,
		);
		this.height = Math.min(this.height, this.maxHeight);
		this.height = Math.max(this.height, this.minHeight);
		this.width = Math.round(
			(window.innerWidth * this.height) / window.innerHeight,
		);
		this.canvas.style.width = '100%';
	}
	fitHeight() {
		this.width = Math.round(
			(window.innerWidth * this.maxHeight) / window.innerHeight,
		);
		this.width = Math.min(this.width, this.maxWidth);
		this.width = Math.max(this.width, this.minWidth);
		this.height = Math.round(
			(this.width * window.innerHeight) / window.innerWidth,
		);
		this.canvas.style.height = '100%';
	}
	update() {
		this.snakeController.move();
		this.context.clearRect(
			0,
			0,
			this.context.canvas.width,
			this.context.canvas.height,
		);
		this.drawBackground();
		this.boardController.render(
			this.context,
			this.cell,
			this.food,
			this.bomb,
		);
		this.snakeController.render(
			this.context,
			this.boardController,
			this.snakeBody,
			this.snakeHead,
		);
		this.createScore();

		if (this.snakeController.playBomb) {
			this.bombSound.play();
			this.snakeController.playBomb = false;
		}
		if (this.snakeController.playFood) {
			this.score++;
			this.foodSound.play();
			this.snakeController.playFood = false;
		}
		if (this.snakeController.gameOver) {
			this.gameOver();
		}
	}
	start() {
		this.snakeSound.play();
		this.updateInterval = setInterval(() => {
			this.update();
		}, 150);
		this.bombInterval = setInterval(() => {
			this.boardController.addObject(this.snakeController, 'bomb');
		}, 5000);
	}

	gameOver() {
		this.snakeSound.pause();
		this.gameOverSound.play();
		clearInterval(this.updateInterval);
		clearInterval(this.bombInterval);
		alert('Game Over');
		window.location.reload();
	}
}
