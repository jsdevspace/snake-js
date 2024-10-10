import Board from './../models/board.js';

export default class BoardController {
	constructor() {
		this.init();
	}
	init() {
		this.board = new Board();
	}
	render(context, cell, food, bomb) {
		this.cellWidth = cell.width + 1;
		this.cellheight = cell.height + 1;
		this.offsetX =
			(context.canvas.width - this.cellWidth * this.board.boadWidth) / 2;
		this.offsetY =
			(context.canvas.height - this.cellheight * this.board.boadHeight) /
			2;
		this.board.cells.forEach((cellCoords) => {
			window.requestAnimationFrame(() => {
				context.drawImage(
					cell,
					cellCoords.x * this.cellWidth + this.offsetX,
					cellCoords.y * this.cellheight + this.offsetY,
				);
				if (cellCoords.hasFood) {
					context.drawImage(
						food,
						cellCoords.x * this.cellWidth + this.offsetX,
						cellCoords.y * this.cellheight + this.offsetY,
					);
				}
				if (cellCoords.hasBomb) {
					context.drawImage(
						bomb,
						cellCoords.x * this.cellWidth + this.offsetX,
						cellCoords.y * this.cellheight + this.offsetY,
					);
				}
			});
		});
	}

	getCell(x, y) {
		return this.board.cells.find((c) => c.x === x && c.y === y);
	}
	getRandomCell(min, max) {
		return Math.floor(Math.random() * (max + 1 - min) + min);
	}
	getAvailableCell(snakeController) {
		const availableCells = this.board.cells.filter((cell) => {
			if (cell.hasFood || cell.hasBomb) {
				return;
			}
			return !snakeController.snake.snakeCoords.includes(cell);
		});
		let idx = this.getRandomCell(0, availableCells.length - 1);
		return availableCells[idx];
	}
	addFood(snakeController) {
		let cell = this.getAvailableCell(snakeController);
		cell.hasFood = true;
	}
	addBomb(snakeController) {
		let cell = this.getAvailableCell(snakeController);
		cell.hasBomb = true;
	}
	addObject(snakeController, type) {
		let cell = this.getAvailableCell(snakeController);
		if (type === 'food') {
			cell.hasFood = true;
		}
		if (type === 'bomb') {
			this.removeBombs();
			cell.hasBomb = true;
		}
	}
	removeObject(cell, type) {
		if (type === 'food') {
			cell.hasFood = false;
		}
		if (type === 'bomb') {
			cell.hasBomb = false;
		}
	}
	removeBombs() {
		this.board.cells.forEach((cell) => (cell.hasBomb = false));
	}
}
