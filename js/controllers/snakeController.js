import Game from '../game.js';
import Snake from '../models/snake.js';

export default class SnakeController {
	constructor(context, boardController, snakeBody, snakeHead) {
		this.init(boardController);
		this.render(context, boardController, snakeBody, snakeHead);
	}
	init(boardController) {
		this.deltaX = 0;
		this.deltaY = -1;
		this.snake = new Snake();
		this.degree = 180;

		for (let coord of this.snake.snakeStartCoords) {
			let cell = boardController.getCell(coord.x, coord.y);
			this.snake.snakeCoords.push(cell);
		}
	}
	render(context, boardController, snakeBody, snakeHead) {
		this.boardController = boardController;
		const halfHeadSize = snakeHead.width / 2;
		this.snake.snakeCoords.forEach((cell, i) => {
			window.requestAnimationFrame(() => {
				if (i === 0) {
					context.save();
					context.translate(
						cell.x * boardController.cellWidth +
							boardController.offsetX,
						cell.y * boardController.cellheight +
							boardController.offsetY,
					);
					context.translate(halfHeadSize, halfHeadSize);
					context.rotate((this.degree * Math.PI) / 180);
					context.drawImage(snakeHead, -halfHeadSize, -halfHeadSize);
					context.restore();
				} else {
					context.drawImage(
						snakeBody,
						cell.x * boardController.cellWidth +
							boardController.offsetX,
						cell.y * boardController.cellheight +
							boardController.offsetY,
					);
				}
			});
		});
	}
	move() {
		if (!this.snake.isMoving) {
			return;
		}
		let cell = this.getNextCell();
		if (!cell || this.snake.snakeCoords.includes(cell)) {
			this.gameOver = true;
			return;
		}

		if (cell) {
			this.snake.snakeCoords.unshift(cell);
			if (cell.hasFood) {
				this.playFood = true;
				this.boardController.removeObject(cell, 'food');
				this.boardController.addFood(this);
				return;
			}
			if (cell.hasBomb) {
				this.playBomb = true;
				this.gameOver = true;
			}
			this.snake.snakeCoords.pop();
		}
	}
	getNextCell() {
		let head = this.snake.snakeCoords[0];
		return this.boardController.getCell(
			head.x + this.deltaX,
			head.y + this.deltaY,
		);
	}
}
