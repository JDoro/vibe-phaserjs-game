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
        this.gameOver = false;
        this.obstacleSpeed = 150;
        this.spawnTimer = 0;
        this.spawnDelay = 1500; // milliseconds

        // Draw road background
        this.createRoad();

        // Create player vehicle
        this.player = this.add.rectangle(400, 500, 60, 80, 0x00ff00);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        // Create obstacles group
        this.obstacles = this.physics.add.group();

        // Set up collisions
        this.physics.add.overlap(this.player, this.obstacles, this.hitObstacle, null, this);

        // Set up input
        this.input.on('pointermove', (pointer) => {
            this.player.x = Phaser.Math.Clamp(pointer.x, 30, 770);
        });

        // Keyboard input for arrow keys
        this.cursors = this.input.keyboard.createCursorKeys();

        // UI Text
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '24px',
            fill: '#fff'
        });
    }

    createRoad() {
        // Road background
        const road = this.add.rectangle(400, 300, 500, 600, 0x444444);
        road.setDepth(-2);

        // Road lane markings
        const laneMarkings = this.add.graphics();
        laneMarkings.fillStyle(0xffff00, 1);
        laneMarkings.setDepth(-1);

        // Draw dashed center line
        for (let i = 0; i < 600; i += 40) {
            laneMarkings.fillRect(398, i, 4, 20);
        }

        // Draw side lines
        laneMarkings.fillRect(148, 0, 4, 600);
        laneMarkings.fillRect(648, 0, 4, 600);
    }

    spawnObstacle() {
        // Random lane selection (3 lanes)
        const lanes = [250, 400, 550];
        const lane = Phaser.Math.RND.pick(lanes);
        
        const obstacle = this.add.rectangle(lane, -50, 60, 60, 0xff0000);
        this.physics.add.existing(obstacle);
        this.obstacles.add(obstacle);
        obstacle.body.setVelocityY(this.obstacleSpeed);
    }

    hitObstacle(player, obstacle) {
        if (this.gameOver) return;
        this.endGame();
    }

    endGame() {
        this.gameOver = true;
        
        // Stop all obstacles
        this.obstacles.children.entries.forEach(obstacle => {
            obstacle.body.setVelocity(0, 0);
        });
        
        const gameOverText = this.add.text(400, 300, 'GAME OVER', {
            fontSize: '64px',
            fill: '#ff0000'
        });
        gameOverText.setOrigin(0.5);

        const finalScoreText = this.add.text(400, 360, 'Final Score: ' + this.score, {
            fontSize: '32px',
            fill: '#fff'
        });
        finalScoreText.setOrigin(0.5);

        const restartText = this.add.text(400, 420, 'Click to Restart', {
            fontSize: '24px',
            fill: '#fff'
        });
        restartText.setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.restart();
        });
    }

    update(time, delta) {
        if (this.gameOver) return;

        // Keyboard controls
        if (this.cursors.left.isDown) {
            this.player.x = Math.max(30, this.player.x - 5);
        } else if (this.cursors.right.isDown) {
            this.player.x = Math.min(770, this.player.x + 5);
        }

        // Spawn obstacles
        this.spawnTimer += delta;
        if (this.spawnTimer > this.spawnDelay) {
            this.spawnObstacle();
            this.spawnTimer = 0;
            
            // Gradually increase difficulty
            if (this.spawnDelay > 500) {
                this.spawnDelay -= 10;
            }
            if (this.obstacleSpeed < 300) {
                this.obstacleSpeed += 2;
            }
        }

        // Remove obstacles that went off screen and increment score
        this.obstacles.children.entries.forEach(obstacle => {
            if (obstacle.y > this.gameHeight + 50) {
                this.score += 10;
                this.scoreText.setText('Score: ' + this.score);
                obstacle.destroy();
            }
        });
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

// Expose game to window for debugging
if (typeof window !== 'undefined') {
    window.game = game;
}
