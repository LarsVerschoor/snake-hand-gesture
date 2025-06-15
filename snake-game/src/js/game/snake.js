class Snake {
    constructor(length) {
        this.body = [];
        this.length = length;
        this.velocity = { x: 0, y: 0 };
        this.alive = true;
    }

    init() {
        this.velocity = { x: 0, y: -1 };

        for(let i = 0; i < this.length; i++) {
            this.body.push({x: 10, y: 10 + i});
        }
    }

    isOnSnake({ x, y }) {
        return this.body.some((segment) => segment.x === x && segment.y === y);
    }

    grow() {
        this.body.push({...this.body[this.body.length - 1]});
    }

    move() {
        for(let i = this.body.length - 1; i >= 0; i--) {
            if (i === 0) {
                // the head
                this.body[i].x += this.velocity.x;
                this.body[i].y += this.velocity.y;
                return;
            }
            this.body[i] = {...this.body[i-1]}
        }
    }

    checkDeath() {
        const head = this.body[0];
        this.body.forEach(({ x, y }, index) => {
            if (index === 0) return;
            if (x === head.x && y === head.y) this.alive = false;
        });
    }

    update() {
        this.move()
        this.checkDeath()
    }
}

export default Snake;