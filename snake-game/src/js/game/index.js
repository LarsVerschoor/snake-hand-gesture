import Snake from "./snake.js";
import Food from "./food.js";

class Game {
    constructor({canvas, msBetweenFrames, gridSize, snakeLength, predictFunction}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.msBetweenFrames = msBetweenFrames;
        this.gridSize = gridSize
        this.prevFrameDelta = 0;
        this.snake = new Snake(snakeLength);
        this.food = new Food(Math.floor(Math.random() * 21), Math.floor(Math.random() * 21));
        this.predictFunction = predictFunction;
    }

    init() {
        this.canvas.width = 300;
        this.canvas.height = 300;
        this.snake.init();

    }

    start = () => {
        this.init()
        window.requestAnimationFrame(this.frame);
    }

    async update() {
        this.snake.update();

        this.snake.body.forEach((segment) => {
            if (segment.x > 20) segment.x = 0;
            else if (segment.x < 0) segment.x = 20;
            if (segment.y > 20) segment.y = 0;
            else if (segment.y < 0) segment.y = 20;
        })

        if (this.snake.isOnSnake(this.food)) {
            this.food = new Food(Math.floor(Math.random() * 21), Math.floor(Math.random() * 21));
            this.snake.grow();
        }

        const newDirection = await this.predictFunction();
        if (!newDirection) return;

        if (newDirection === 'up') this.setSnakeVelocity({ x: 0, y: -1 });
        else if (newDirection === 'down') this.setSnakeVelocity({ x: 0, y: 1 });
        else if (newDirection === 'left') this.setSnakeVelocity({ x: -1, y: 0 });
        else if (newDirection === 'right') this.setSnakeVelocity({ x: 1, y: 0 });
    }

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const width = this.canvas.width / this.gridSize;

        this.snake.body.forEach((segment, index) => {
            ctx.beginPath();
            ctx.fillStyle = index === 0 ? '#00BB00' : '#00EE00';
            ctx.rect(segment.x * width, segment.y * width, width, width);
            ctx.fill();
            ctx.closePath();
        });

        ctx.beginPath();
        ctx.fillStyle = '#CC0000';
        const { x, y } = this.food;
        ctx.rect(x * width, y * width, width, width);
        ctx.fill();
        ctx.closePath();
    }

    gameOver() {
        console.log('gameover')
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.fillStyle = '#CC0000';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.closePath();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Game Over. Refresh to play again', this.canvas.width / 2, this.canvas.height / 2);
    }

    frame = (delta) => {
        requestAnimationFrame(this.frame);
        if (delta < this.prevFrameDelta + this.msBetweenFrames) return;
        this.prevFrameDelta = delta;

        if (!this.snake.alive) {
            this.gameOver();
            return;
        }
        this.update();
        this.render();
    }

    setSnakeVelocity(newVel) {
        const oldVel = this.snake.velocity;
        console.log('test1')
        if (Math.abs(oldVel.x) === 1 && Math.abs(newVel.x) === 1 || Math.abs(oldVel.y) === 1 && Math.abs(newVel.y) === 1) return;
        console.log('test2')
        this.snake.velocity = newVel;
    }
}

export default Game;