import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        // No assets to preload - we'll use graphics
    }

    create() {
        // Game configuration
        this.gameWidth = 800;
        this.gameHeight = 600;
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.gameWon = false;

        // Create paddle
        this.paddle = this.add.rectangle(400, 550, 100, 20, 0x00ff00);
        this.physics.add.existing(this.paddle);
        this.paddle.body.setImmovable(true);
        this.paddle.body.setCollideWorldBounds(true);

        // Create ball
        this.ball = this.add.circle(400, 500, 10, 0xffffff);
        this.physics.add.existing(this.ball);
        this.ball.body.setCollideWorldBounds(true);
        this.ball.body.setBounce(1, 1);
        this.ball.body.setVelocity(200, -200);

        // Create blocks
        this.blocks = this.physics.add.group();
        this.createBlocks();

        // Set up collisions
        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);
        this.physics.add.collider(this.ball, this.blocks, this.hitBlock, null, this);

        // Set up input
        this.input.on('pointermove', (pointer) => {
            this.paddle.x = Phaser.Math.Clamp(pointer.x, 50, 750);
        });

        // UI Text
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '24px',
            fill: '#fff'
        });

        this.livesText = this.add.text(16, 48, 'Lives: 3', {
            fontSize: '24px',
            fill: '#fff'
        });

        // Set world bounds
        this.physics.world.setBoundsCollision(true, true, true, false);

        // Check for ball falling
        this.physics.world.on('worldbounds', (body) => {
            if (body.gameObject === this.ball && body.blocked.down) {
                this.loseLife();
            }
        });

        this.ball.body.onWorldBounds = true;
    }

    createBlocks() {
        const rows = 5;
        const cols = 10;
        const blockWidth = 70;
        const blockHeight = 20;
        const padding = 10;
        const offsetX = 35;
        const offsetY = 80;
        
        const colors = [0xff0000, 0xff7700, 0xffff00, 0x00ff00, 0x0000ff];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = offsetX + col * (blockWidth + padding);
                const y = offsetY + row * (blockHeight + padding);
                const block = this.add.rectangle(x, y, blockWidth, blockHeight, colors[row]);
                this.physics.add.existing(block);
                block.body.setImmovable(true);
                this.blocks.add(block);
            }
        }
    }

    hitPaddle(ball, paddle) {
        let diff = 0;

        if (ball.x < paddle.x) {
            // Ball is on the left side of the paddle
            diff = paddle.x - ball.x;
            ball.body.setVelocityX(-10 * diff);
        } else if (ball.x > paddle.x) {
            // Ball is on the right side of the paddle
            diff = ball.x - paddle.x;
            ball.body.setVelocityX(10 * diff);
        } else {
            // Ball is in the middle of the paddle
            ball.body.setVelocityX(2 + Math.random() * 8);
        }
    }

    hitBlock(ball, block) {
        block.destroy();
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        // Ensure ball maintains velocity after collision
        const currentSpeed = Math.sqrt(
            ball.body.velocity.x * ball.body.velocity.x +
            ball.body.velocity.y * ball.body.velocity.y
        );
        if (currentSpeed < 200) {
            const angle = Math.atan2(ball.body.velocity.y, ball.body.velocity.x);
            ball.body.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);
        }

        // Check if all blocks are destroyed
        if (this.blocks.countActive() === 0) {
            this.winGame();
        }
    }

    loseLife() {
        if (this.gameOver || this.gameWon) return;

        this.lives--;
        this.livesText.setText('Lives: ' + this.lives);

        if (this.lives === 0) {
            this.endGame();
        } else {
            // Reset ball position
            this.ball.setPosition(400, 500);
            this.ball.body.setVelocity(200, -200);
        }
    }

    winGame() {
        this.gameWon = true;
        this.ball.body.setVelocity(0, 0);
        
        const winText = this.add.text(400, 300, 'YOU WIN!', {
            fontSize: '64px',
            fill: '#00ff00'
        });
        winText.setOrigin(0.5);

        const restartText = this.add.text(400, 370, 'Click to Restart', {
            fontSize: '24px',
            fill: '#fff'
        });
        restartText.setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.restart();
        });
    }

    endGame() {
        this.gameOver = true;
        this.ball.body.setVelocity(0, 0);
        
        const gameOverText = this.add.text(400, 300, 'GAME OVER', {
            fontSize: '64px',
            fill: '#ff0000'
        });
        gameOverText.setOrigin(0.5);

        const restartText = this.add.text(400, 370, 'Click to Restart', {
            fontSize: '24px',
            fill: '#fff'
        });
        restartText.setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.restart();
        });
    }

    update() {
        // Ball speed limiting
        if (this.ball.body) {
            const speed = Math.sqrt(
                this.ball.body.velocity.x * this.ball.body.velocity.x +
                this.ball.body.velocity.y * this.ball.body.velocity.y
            );
            
            if (speed > 400) {
                const normalized = this.ball.body.velocity.clone().normalize().scale(400);
                this.ball.body.setVelocity(normalized.x, normalized.y);
            } else if (speed < 200) {
                const normalized = this.ball.body.velocity.clone().normalize().scale(200);
                this.ball.body.setVelocity(normalized.x, normalized.y);
            }
        }
    }
}

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [GameScene],
    backgroundColor: '#222222'
};

// Create the game
const game = new Phaser.Game(config);
