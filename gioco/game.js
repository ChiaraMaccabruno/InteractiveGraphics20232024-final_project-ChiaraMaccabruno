const ROWS = 20;
const COLS = 15;

// Initialize the grid with all cells set to 0
let grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// Define tetromino shapes, colors, and center points
const TETROMINOS = {
    I: { shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], color: 0x00ffff, center: [1, 2] },
    J: { shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]], color: 0x0000ff, center: [1, 1] },
    L: { shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]], color: 0xffa500, center: [1, 1] },
    O: { shape: [[1, 1], [1, 1]], color: 0xffff00, center: [0.5, 0.5] },
    S: { shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: 0x00ff00, center: [1, 1] },
    T: { shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: 0x800080, center: [1, 1] },
    Z: { shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: 0xff0000, center: [1, 1] },
    SPECIAL: { shape: [[1]], color: 0xffffff }, // Esempio di forma del tetramino special
};

// Function to get a random tetromino
function getRandomTetromino() {
    const tetrominos = 'IJLOSTZ';
    const randTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)];
    return createTetromino(randTetromino);
}

// Function to create a tetromino object
function createTetromino(type) {
    return { ...TETROMINOS[type], type };
}

// Initialize the current tetromino
let currentTetromino = getRandomTetromino();
let position = { x: Math.floor(COLS / 2) - Math.floor(currentTetromino.shape[0].length / 2), y: 0  };

// Function to move the tetromino
function moveTetromino(dx, dy) {
    const newPos = { x: position.x + dx, y: position.y + dy };
    if (!hasCollision(newPos)) {
        position = newPos;// Update the position if no collision
        return true;
    } else {
        console.log('Collision detected, not moving');
        return false;
    }
}

// Function to check for collisions
function hasCollision(newPos = position, shape = currentTetromino.shape) {
    if (!currentTetromino || !shape) return true;

    for (let y = 0; y < shape.length; y++) {// Loop through tetromino shape rows
        for (let x = 0; x < shape[y].length; x++) {// Loop through tetromino shape columns
            if (shape[y][x] !== 0) {// Check if the cell is part of the tetromino
                if (newPos.y + y >= ROWS) {
                    console.log('Collision with bottom of the grid');
                    return true;
                }
                if (newPos.x + x >= COLS) {
                    console.log('Collision with right edge of the grid');
                    return true;
                }
                if (newPos.x + x < 0) {
                    console.log('Collision with left edge of the grid');
                    return true;
                }
                if (newPos.y + y < 0) { // Check for collision with top of the grid (game over)
                    console.log('Game Over');
                    handleGameOver(); // Call handleGameOver function
                    return true;
                }
                // Check for collision with existing block
                if (grid[newPos.y + y] && grid[newPos.y + y][newPos.x + x] !== 0) {
                    console.log('Collision with existing block');
                    return true;
                }
            }
        }
    }
    return false;
}

// Function to remove full lines
function removeFullLines() {
    let linesRemoved = 0;

    for (let y = ROWS - 1; y >= 0; y--) {// Loop through grid rows from bottom to top
        if (grid[y].every(cell => cell !== 0)) {// Check if the row is full
            // Remove the full row
            grid.splice(y, 1);
            linesRemoved++;
            // Add a new empty row at the top
            grid.unshift(Array(COLS).fill(0));
            // Increment y to check the same position again
            y++;
        }
    }

    return linesRemoved; // Return the number of lines removed
}

// Function to rotate the tetromino
function rotateTetromino() {
    // Save the original position and the original shape
    const originalPosition = { ...position };
    const originalShape = currentTetromino.shape;

    // Rotate the shape
    const rotatedShape = rotateMatrix(originalShape);

    // Calculate the geometric center of the shape
    const centerX = Math.floor(originalShape[0].length / 2);
    const centerY = Math.floor(originalShape.length / 2);

    // Calculate the difference between the original position and the new position
    const deltaY = centerY - Math.floor(rotatedShape.length / 2);
    const deltaX = centerX - Math.floor(rotatedShape[0].length / 2);

    // Applica la nuova posizione considerando la differenza
    position.y += deltaY;
    position.x += deltaX;

    // Check for collision with rotated shape
    if (!hasCollision(originalPosition, rotatedShape)) {
        currentTetromino.shape = rotatedShape;
    } else {
        // Restore original position if collision is not valid
        position = { ...originalPosition };
        console.log('Rotation is invalid');

        // Check if collision is with the left or right edge
        if (isEdgeCollision(originalPosition, rotatedShape)) {
            console.log('Game Over due to edge collision during rotation');
            resetGrid();
        }
    }
}

// Function to check for edge collision
function isEdgeCollision(pos, shape) {
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x] !== 0) {
                if (pos.x + x < 0 || pos.x + x >= COLS) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Function to rotate a matrix
function rotateMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotatedMatrix = [];

    for (let col = 0; col < cols; col++) {
        const newRow = [];
        for (let row = rows - 1; row >= 0; row--) {
            newRow.push(matrix[row][col]);
        }
        rotatedMatrix.push(newRow);
    }
    return rotatedMatrix;
}

// Function to merge the tetromino to the grid
function mergeTetrominoToGrid() {
    for (let y = 0; y < currentTetromino.shape.length; y++) {
        for (let x = 0; x < currentTetromino.shape[y].length; x++) {
            if (currentTetromino.shape[y][x] !== 0) {
                const newY = position.y + y;
                const newX = position.x + x;
                if (newY >= 0 && newY < ROWS && newX >= 0 && newX < COLS) {
                    grid[newY][newX] = currentTetromino.color;
                }
                // Check if merging with the top of the grid
                if (newY < 0) {
                    console.log('Game Over: Collision with the top of the grid');
                    alert('Game Over');
                    resetTetromino();
                    return;
                }
            }
        }
    }
    console.log('Merged current tetromino into the grid', grid);
}

// Function to reset the tetromino
function resetTetromino() {
    currentTetromino = getRandomTetromino();
    position = { x: Math.floor(COLS / 2) - Math.floor(currentTetromino.shape[0].length / 2), y: 0 };
    console.log('Resetting tetromino to:', currentTetromino, 'at position:', position);
    if (hasCollision()) {
        console.log('Game Over');
        resetGrid();
    }
}

// Function to reset the grid
function resetGrid() {
    console.log('Resetting grid...');
    grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    position = { x: 3, y: 0 };
    handleGameOver();
}

let gameOverCallback = null;
let isGameOver = false;

// Function to set game over callback
function setGameOverCallback(callback) {
    gameOverCallback = callback;
}

// Function to handle game over
function handleGameOver() {
    isGameOver = true;
    const gameOverPopup = document.getElementById('game-over-popup');
    if (gameOverPopup) {
        gameOverPopup.style.display = 'block';
    } else {
        console.error('Element with id "game-over-popup" not found in the DOM');
        return;
    }

    // Get the play again button element
    const playAgainButton = document.getElementById('play-again-button');
    if (playAgainButton) {
        playAgainButton.addEventListener('click', () => {
            gameOverPopup.style.display = 'none';
            if (gameOverCallback) {
                gameOverCallback();// Call the callback
            }
            isGameOver = false;
        });
    } else {
        console.error('Element with id "play-again-button" not found in the DOM');
        return;
    }
}

export {
    grid,
    currentTetromino,
    position,
    moveTetromino,
    hasCollision,
    removeFullLines,
    rotateTetromino,
    mergeTetrominoToGrid,
    setGameOverCallback,
    handleGameOver,
    resetTetromino,
    TETROMINOS
}; 
