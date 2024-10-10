export default class Snake {
	constructor() {
		this.init();
	}
	init() {
		this.isMoving = false;
		this.snakeCoords = [];
		this.snakeStartCoords = [
			{ x: 3, y: 12 },
			{ x: 3, y: 13 },
		];
	}
	startMoving() {
		this.isMoving = true;
	}
}
