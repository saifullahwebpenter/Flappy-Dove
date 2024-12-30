const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverDiv = document.getElementById('gameOver');
const restartButton = document.getElementById('restartButton');
const countdownDiv = document.getElementById('countdown');
const gameStartedDiv = document.getElementById('gameStarted');
const startNewGameButton = document.getElementById('startNewGameButton');

// Set canvas width and height dynamically to adjust based on window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bird = {
    x: 100,
    y: canvas.height / 2, // Vertically center the bird on the screen
    width: 30,
    height: 30,
    velocity: 0,
    gravity: 0.5,
    jump: -12
};

let pipes = [];
let pipeWidth = 50;
let gap = 150;
let pipeSpeed = 2;
let score = 0;
let isGameOver = false;
let isGameStarted = false;

// Check if the game has already started during this session
if (sessionStorage.getItem('gameStarted') === 'true') {
    startNewGameButton.style.display = 'none'; // Hide the button if the game is already started
    isGameStarted = true; // Set the game as started
    resetGame(); // Reset game (if necessary) when page reloads
} else {
    startNewGameButton.style.display = 'block'; // Show the button if the game hasn't started
}

function createPipe() {
    ctx.fillStyle = '#4B0082'; // Pipe color (indigo)
    let topHeight = Math.random() * (canvas.height - gap - 100) + 50;
    let bottomHeight = canvas.height - topHeight - gap;
    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomHeight: bottomHeight
    });
}

function drawBird() {
    ctx.font = "30px FontAwesome";
    ctx.fillStyle = "#FFFF00"; // Bird color (yellow)
    ctx.fillText("\uf4ba", bird.x, bird.y + bird.height); // Draw bird with FontAwesome icon
}

function drawPipes() {
    ctx.fillStyle = "#88e74b"; // Pipe color (green)
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight); // Draw top pipe
        ctx.fillRect(pipe.x, canvas.height - pipe.bottomHeight, pipeWidth, pipe.bottomHeight); // Draw bottom pipe
    });
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        endGame(); // End game if bird hits top or bottom
    }
}

function updatePipes() {
    pipes.forEach((pipe, index) => {
        pipe.x -= pipeSpeed; // Move pipes to the left

        if (pipe.x + pipeWidth < 0) {
            pipes.splice(index, 1); // Remove pipe when it goes off screen
            score++; // Increase score
        }

        // Check collision with bird
        if (
            bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            (
                bird.y < pipe.topHeight ||
                bird.y + bird.height > canvas.height - pipe.bottomHeight
            )
        ) {
            endGame(); // End game if collision detected
        }
    });

    // Create a new pipe if the last one is far enough away from the screen
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        createPipe();
    }
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30); // Position score at top-left corner
}

function endGame() {
    isGameOver = true;
    gameOverDiv.style.display = 'block';
}

function resetGame() {
    bird.y = canvas.height / 2; // Reset bird to the center
    bird.velocity = 0;
    pipes = [];
    score = 0;
    isGameOver = false;
    gameOverDiv.style.display = 'none';
    createPipe(); // Create initial pipe
    startCountdown();
}

function startCountdown() {
    let countdown = 3;
    countdownDiv.style.display = 'block';
    countdownDiv.textContent = countdown;

    const countdownInterval = setInterval(() => {
        countdown--;
        countdownDiv.textContent = countdown;

        if (countdown === 0) {
            clearInterval(countdownInterval);
            countdownDiv.style.display = 'none';
            gameStartedDiv.style.display = 'block';

            setTimeout(() => {
                gameStartedDiv.style.display = 'none';
                gameLoop();
            }, 1000);
        }
    }, 1000);
}

function gameLoop() {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas on each frame

    drawBird();
    drawPipes();
    drawScore();

    updateBird();
    updatePipes();

    requestAnimationFrame(gameLoop); // Loop the game
}

// Start game when user clicks "Start New Game"
startNewGameButton.addEventListener('click', () => {
    if (!isGameStarted) {
        isGameStarted = true;
        sessionStorage.setItem('gameStarted', 'true'); // Mark the game as started in sessionStorage
        startNewGameButton.style.display = 'none'; // Hide the start button
        resetGame();
    }
});

// Restart game on "Restart" button click
restartButton.addEventListener('click', resetGame);

// Make the bird jump on mouse click or key press (only if game started and not over)
document.addEventListener('keydown', () => {
    if (isGameStarted && !isGameOver) bird.velocity = bird.jump;
});

document.addEventListener('mousedown', () => {
    if (isGameStarted && !isGameOver) bird.velocity = bird.jump;
});

// Function to store the score with the current date
function saveScore() {
let savedScores = JSON.parse(localStorage.getItem('scores')) || [];
let currentDate = new Date().toLocaleString(); // Get the current date and time

// Add the latest score to the front of the array (latest score first)
savedScores.unshift({ score: score, date: currentDate });

// Save updated scores back to localStorage without any limit
localStorage.setItem('scores', JSON.stringify(savedScores));
}

// Function to display records in the 'records-model' div
function showRecords() {
const records = JSON.parse(localStorage.getItem('scores')) || [];
const recordsList = document.getElementById('recordsList');
recordsList.innerHTML = ""; // Clear the existing list

if (records.length === 0) {
recordsList.innerHTML = "<li>No records available.</li>";
} else {
records.forEach((record) => {
    const recordItem = document.createElement('li');
    recordItem.textContent = `Score: ${record.score}, Date: ${record.date}`;
    recordsList.appendChild(recordItem);
});
}

// Show the records model
document.querySelector('.records-model').style.display = 'flex';
}

// Modify the endGame function to save the score
function endGame() {
isGameOver = true;
saveScore(); // Save the score when the game ends
gameOverDiv.style.display = 'block';
}

// Event listener for the "Records" button
document.getElementById('recordsButton').addEventListener('click', showRecords);

// Function to close the records modal
function closeRecordsModal() {
document.querySelector('.records-model').style.display = 'none';
}

// Optional: Add a button inside the modal to close it
const closeButton = document.createElement('button');
closeButton.textContent = 'Close';
closeButton.style.marginTop = '20px';
closeButton.addEventListener('click', closeRecordsModal);
document.querySelector('.records-model').appendChild(closeButton);

