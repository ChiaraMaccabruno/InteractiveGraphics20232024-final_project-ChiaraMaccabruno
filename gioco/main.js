import * as THREE from 'three';
import { grid, currentTetromino, position, moveTetromino, hasCollision, removeFullLines, rotateTetromino, mergeTetrominoToGrid, setGameOverCallback, handleGameOver, resetTetromino, TETROMINOS } from './game';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ROWS = 20;
const COLS = 15;

const SCORE_SINGLE = 100;
const SCORE_DOUBLE = 200;
const SCORE_TRIPLE = 400;
const SCORE_QUADRUPLE = 800;
const SCORE_CONSECUTIVE = 1200;
const SCORE_DOWN_PRESS = 1; // Points for each down key press


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// Imposta il colore di sfondo della scena
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);

// Abilita le ombre nel renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

camera.position.set(0, 0, 17);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(0, 10, 0);
light.target.position.set(0, 0, 0);
//light.castShadow = true;
scene.add(light);
scene.add( light.target );


let helper = new THREE.DirectionalLightHelper(light, 3);
light.add(helper);


// Configura la shadow map per il light
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 50;
light.shadow.camera.left = -20;
light.shadow.camera.right = 20;
light.shadow.camera.top = 20;
light.shadow.camera.bottom = -20;

/*
// Aggiungi una luce ambientale per illuminare uniformemente la scena
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Intensità della luce ambientale
scene.add(ambientLight);*/

const textureLoader = new THREE.TextureLoader();

// ref for lumens: http://www.power-sure.com/lumens.htm
const bulbLuminousPowers = {
    '800 lm (60W)': 1000
};

// ref for solar irradiances: https://en.wikipedia.org/wiki/Lux
const hemiLuminousIrradiances = {
    '0.0001 lx (Moonless Night)': 0.0008
};

const params = {
    shadows: true,
    exposure: 0.80,
    bulbPower: Object.keys( bulbLuminousPowers )[ 0 ],
    hemiIrradiance: Object.keys( hemiLuminousIrradiances )[ 0 ]
};


let bulbLight, bulbMat, hemiLight;

const bulbTexture = textureLoader.load('./src/textmoon.jpg'); // Sostituisci con il percorso della tua texture

const bulbGeometry = new THREE.SphereGeometry( 1.5 );
bulbLight = new THREE.PointLight( 0xffffff, 10, 250, 1 );

bulbMat = new THREE.MeshBasicMaterial( {
    /*emissive: 0xffffff, // Colore dell'emissione
    emissiveIntensity: 0.8,*/
    color: 0xffffff,
    map: bulbTexture // Applicazione della texture
} );
const bulbMesh = new THREE.Mesh(bulbGeometry, bulbMat);
bulbLight.add(bulbMesh);
bulbLight.position.set( 0, 10, 0 );
bulbLight.castShadow = true;
scene.add( bulbLight );

hemiLight = new THREE.HemisphereLight( 0xddeeff, 0x0f0e0d, 0.2 );
scene.add( hemiLight );

function updateLight() {
    
    light.target.position.set(bulbLight.position);
    light.target.updateMatrixWorld();
    helper.update();

}

updateLight();



// Aggiungi una sfera per rappresentare la posizione della luce
/*
const lightSphereGeometry = new THREE.SphereGeometry(0.2, 16, 16);
const lightSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const lightSphere = new THREE.Mesh(lightSphereGeometry, lightSphereMaterial);
scene.add(lightSphere);*/

// Funzione per creare un asse
/*
const axesHelper = new THREE.AxesHelper(22);
axesHelper.position.set(-5.6, -9.5, -0.5);
scene.add(axesHelper);*/


// Aggiungi lo sfondo del cielo stellato
const skyTexture = textureLoader.load('./path/to/your/sky_texture.jpg'); // Inserisci il percorso della tua texture
const skyGeometry = new THREE.SphereGeometry(500, 32, 32); // Una sfera grande per rappresentare il cielo
const skyMaterial = new THREE.MeshBasicMaterial({
    map: skyTexture,
    side: THREE.BackSide
});
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);

const starVertices = [];

// Funzione per creare stelle scintillanti
function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: false,
        opacity: 0.7,
    });

    for (let i = 0; i < 300000; i++) { // Numero di stelle
        const x = Math.random() * 2000 - 1000;
        const y = Math.random() * 2000 - 1000;
        const z = Math.random() * 2000 - 1000;
        starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    return stars;
}

// Chiamare la funzione per creare stelle
const stars = createStars();

function animateStars() {
    stars.rotation.y += 0.0002; // Velocità di rotazione delle stelle
}

// Aggiungi oggetti celesti in movimento
const celestialObjects = [];
function createCelestialObject() {
    const geometry = new THREE.SphereGeometry(2, 32, 32); // Dimensione del pianeta o satellite
    const material = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
        emissive: 0x333333,
        emissiveIntensity: 0.5,
    });
    const celestialObject = new THREE.Mesh(geometry, material);
    celestialObject.position.set(Math.random() * 200 - 100, Math.random() * 200 - 100, Math.random() * 200 - 100);
    scene.add(celestialObject);
    celestialObjects.push(celestialObject);
}

// Crea alcuni oggetti celesti
for (let i = 0; i < 5; i++) {
    createCelestialObject();
}

// Funzione per aggiornare la posizione degli oggetti celesti
function updateCelestialObjects() {
    celestialObjects.forEach(obj => {
        obj.position.x += 0.01; // Regola la velocità di movimento
        if (obj.position.x > 100) obj.position.x = -100; // Riposiziona l'oggetto una volta che esce dalla visuale
    });
}


////////////////////////////////////////////////////7

let gameStartTime;
let elapsedTime = 0; // Keep track of elapsed time separately
const timerElement = document.getElementById('timer');
let timerInterval;
let isPaused = false;
let timeSpeedMultiplier = 1;
let minutes;
let seconds;

function startTimer() {
    gameStartTime = new Date() - elapsedTime; // Adjust start time based on elapsed time
    timerInterval = setInterval(() => {
        const currentTime = new Date();
        if (isPaused) {
            elapsedTime += timeSpeedMultiplier * 500; // Incrementa di 10 secondi ogni secondo
        } else {
            elapsedTime = currentTime - gameStartTime;
        }
        const adjustedElapsedTime = elapsedTime;
        minutes = Math.floor(adjustedElapsedTime / 60000);
        seconds = Math.floor((adjustedElapsedTime % 60000) / 1000);
        timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

// Definisci la risoluzione del piano
const resolution = new THREE.Vector2(30, 30);

// Crea la geometria del piano
const planeGeometry = new THREE.PlaneGeometry(
  resolution.x,
  resolution.y
);
planeGeometry.rotateX(-Math.PI * 0.5);

// Carica la texture

const texture = textureLoader.load('./src/tet.png', function (texture) {
  // Una volta caricata la texture, crea il materiale e applicalo al piano
  const planeMaterial = new THREE.MeshStandardMaterial({ map: texture });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.set(0, -9.6, 0); // Imposta la posizione del centro del piano
  plane.castShadow = true;
  plane.receiveShadow = true;
  scene.add(plane);

  // Crea la geometria del bordo
  const edgesGeometry = new THREE.EdgesGeometry(planeGeometry);
  const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x00BFFF }); // Colore rosso per il bordo
  const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
  
  // Aggiusta la posizione del bordo per allinearlo con il piano
  edges.position.set(plane.position.x, plane.position.y, plane.position.z);
  edges.rotation.set(plane.rotation.x, plane.rotation.y, plane.rotation.z);
  
  scene.add(edges);
});

// Gruppo per la griglia e i tetramini
const tetrominoGroup = new THREE.Group();
scene.add(tetrominoGroup);

Object.assign(OrbitControls.prototype, {
    rotateLeft: function (angle) {
        if (angle === undefined) {
            angle = this.getAutoRotationAngle();
        }
        this.thetaDelta -= angle;
    },
    rotateRight: function (angle) {
        if (angle === undefined) {
            angle = this.getAutoRotationAngle();
        }
        this.thetaDelta += angle;
    }
});

let gameInterval;
let isGameRunning = false;

function render() {
    
    requestAnimationFrame(render);
    // Aggiorna le bolle
    //updateBubbles();
    //TWEEN.update()
    renderer.toneMappingExposure = Math.pow( params.exposure, 5.0 ); // to allow for very bright scenes.
    renderer.shadowMap.enabled = params.shadows;
    bulbLight.castShadow = params.shadows;
    
    bulbLight.power = bulbLuminousPowers[ params.bulbPower ];
    bulbMat.emissiveIntensity = bulbLight.power / Math.pow( 0.02, 2.0 ); // convert from intensity to irradiance at bulb surface

    hemiLight.intensity = hemiLuminousIrradiances[ params.hemiIrradiance ];
    
    animateStars();
    updateCelestialObjects(); // Aggiorna gli oggetti Scelesti
    controls.update();
    renderer.render(scene, camera);
}

function clearGridGroup() {
    while (tetrominoGroup.children.length > 0) {
        tetrominoGroup.remove(tetrominoGroup.children[0]);
    }
}

function drawGrid() {
    clearGridGroup();
    scene.add(light);
    drawTetrominoOnGrid();
    drawGridLines();
    drawCurrentTetromino();

    // Update score element in HTML
    const scoreElement = document.getElementById('score');
    scoreElement.textContent = score;

    const levelElement = document.getElementById('level');
    levelElement.textContent = level;

    // Update timer element in HTML
    /*
    const currentTime = new Date();
    const elapsedTime = Math.floor((currentTime - gameStartTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    */
}

function drawGridLines() {
    const lineMaterial = new THREE.LineDashedMaterial({ color: 0xffffff, linewidth: 1,
        scale: 1,
        dashSize: 3,
        gapSize: 1 });
    const lineGeometry = new THREE.BufferGeometry();
    const vertices = [];

    const halfCols = COLS / 2;
    const halfRows = ROWS / 2;
    const depth = 1;

    const offsetX = -0.5;
    const offsetY = 0.5;
    const offsetZ = -0.5;

    for (let y = 0; y <= ROWS; y++) {
        if (y == 0 || y == ROWS){
        vertices.push(-halfCols + offsetX, halfRows - y + offsetY, offsetZ);
        vertices.push(halfCols + offsetX, halfRows - y + offsetY, offsetZ);

        vertices.push(-halfCols + offsetX, halfRows - y + offsetY, depth + offsetZ);
        vertices.push(halfCols + offsetX, halfRows - y + offsetY, depth + offsetZ);
        }
    }

    for (let x = 0; x <= COLS; x++) {
        if (x == 0 || x == COLS){
        vertices.push(-halfCols + x + offsetX, halfRows + offsetY, offsetZ);
        vertices.push(-halfCols + x + offsetX, -halfRows + offsetY, offsetZ);

        vertices.push(-halfCols + x + offsetX, halfRows + offsetY, depth + offsetZ);
        vertices.push(-halfCols + x + offsetX, -halfRows + offsetY, depth + offsetZ);
        }
    
    }

    for (let y = 0; y <= ROWS; y++) {
        for (let x = 0; x <= COLS; x++) {
            if (x == 0 && y == 0 || x == COLS && y == 0 || x == 0 && y == ROWS || x == COLS && y == ROWS){
            vertices.push(-halfCols + x + offsetX, halfRows - y + offsetY, offsetZ);
            vertices.push(-halfCols + x + offsetX, halfRows - y + offsetY, depth + offsetZ);
            }
        }
    }

    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const gridLines = new THREE.LineSegments(lineGeometry, lineMaterial);
    gridLines.castShadow = true;
    gridLines.receiveShadow = true;
    tetrominoGroup.add(gridLines);
}

function drawTetrominoOnGrid() {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (grid[y][x] !== 0) {
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const material = new THREE.MeshStandardMaterial({ color: grid[y][x] });
                const cube = new THREE.Mesh(geometry, material);
                cube.position.set(x - COLS / 2, ROWS / 2 - y, 0);
                cube.castShadow = true;
                cube.receiveShadow = true;
                tetrominoGroup.add(cube);
            }
        }
    }
}

function drawCurrentTetromino() {
    if (!currentTetromino || !currentTetromino.shape) return;

    const currentGroup = new THREE.Group();

    for (let y = 0; y < currentTetromino.shape.length; y++) {
        for (let x = 0; x < currentTetromino.shape[y].length; x++) {
            if (currentTetromino.shape[y][x] !== 0) {
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const material = new THREE.MeshStandardMaterial({ color: currentTetromino.color });
                const cube = new THREE.Mesh(geometry, material);
                cube.castShadow = true;
                cube.receiveShadow = true;
                cube.position.set(position.x + x - COLS / 2, ROWS / 2 - (position.y + y), 0);
                currentGroup.add(cube);
            }
        }
    }

    tetrominoGroup.add(currentGroup);
    currentTetromino.group = currentGroup;
}

// Esempio di variabile globale per il punteggio
let score = 0;
let level = 1;
let cont = 0;

let bubbles = [];
let bubbleGroup = new THREE.Group();
scene.add(bubbleGroup);

function update() {
    const moved = moveTetromino(0, 1);

    if (!moved) {
        mergeTetrominoToGrid();
        const linesRemoved = removeFullLines();

        switch (linesRemoved) {
            case 1:
                score += SCORE_SINGLE;
                //onLineClear();
                break;
            case 2:
                score += SCORE_DOUBLE;
                //onLineClear();
                break;
            case 3:
                score += SCORE_TRIPLE;
                //onLineClear();
                break;
            case 4:
                score += SCORE_QUADRUPLE;
                //onLineClear();
                break;
        }

        // Additional score for consecutive removals
        if (linesRemoved > 4) {
            score += (linesRemoved) * SCORE_CONSECUTIVE + SCORE_QUADRUPLE;
            //onLineClear();
        }

        cont += linesRemoved;

        if(cont >= 10){
            level += 1;
            cont = 0;
        }
        console.log('Score:', score); // Display or use score as needed

        resetTetromino();
    }

    drawGrid();
    if (score >= 100) {
        spawnBubble();
    }
    //updateBubbles();
    gameInterval = setTimeout(update, 1000 / level);
}

function spawnBubble() {
    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: false,
        opacity: 0.3,
        roughness: 0.2,
        clearcoat: 0.8,
        clearcoatRoughness: 0.5,
        metalness: 0.7, // Imposta il livello di metallizzazione
        roughness: 0.2, // Imposta la rugosità
    });

    const bubble = new THREE.Mesh(geometry, material);
    bubble.position.set((Math.random() - 0.5) * 60, 15 + Math.random() * 20, (Math.random() - 0.5) * 60);

    // Parametri fisici
    const initialVelocityY = -0.5; // Velocità iniziale verso il basso
    const gravity = new THREE.Vector3(0, -0.01, 0); // Gravità
    const airResistance = 0.98; // Resistenza dell'aria

    bubble.velocity = new THREE.Vector3(0, initialVelocityY, 0);
    bubble.acceleration = gravity;
    bubble.airResistance = airResistance;

    bubble.castShadow = true;
    bubble.receiveShadow = true;
    bubbleGroup.add(bubble);
    bubbles.push(bubble);
}

// Funzione di animazione principale
function animate() {
    requestAnimationFrame(animate);
    let bubblesToRemove = [];
    
    bubbles.forEach(bubble => {
        bubble.position.y -= 0.1; // Velocità di caduta
        for (let i = 0; i < bubblesToRemove.length; i++) {
            bubbleGroup.remove(bubblesToRemove[i]);
            let index = bubbles.indexOf(bubblesToRemove[i]);
            if (index !== -1) {
                bubbles.splice(index, 1);
            }
        }
    });
    
    renderer.render(scene, camera);
}

// Avvia l'animazione
animate();


function handleKeyPress(event) {
    if (!isGameRunning) return;

    switch (event.key) {
        case 'ArrowLeft':
            moveTetromino(-1, 0);
            break;
        case 'ArrowRight':
            moveTetromino(1, 0);
            break;
        case 'ArrowDown':
            moveTetromino(0, 1);
            // Add score for each down key press
            score += SCORE_DOWN_PRESS;
            break;
        case 'ArrowUp':
            rotateTetromino();
            break;
    }
    drawGrid();
}

document.addEventListener('keydown', handleKeyPress);

document.getElementById('start-button').addEventListener('click', () => {
    if (!isGameRunning) {
        isGameRunning = true;
        isPaused = false;
        startTimer();
        update();
    }
});


document.getElementById('stop-button').addEventListener('click', () => {
    isGameRunning = false;
    isPaused = true;
    if (isPaused) {
        timeSpeedMultiplier = 10; // Incrementa la velocità del tempo quando in pausa
    } else {
        timeSpeedMultiplier = 1; // Ripristina la velocità normale quando riprende
    }
    clearTimeout(gameInterval);
});

document.getElementById('reset-button').addEventListener('click', () => {
    console.log("Reset button clicked");
    reset();
});

// Aggiorna la posizione della luce quando gli slider cambiano
document.getElementById('lightX').addEventListener('input', (event) => {
    light.position.x = event.target.value;
    bulbLight.position.x = event.target.value;
    //lightSphere.position.x = event.target.value; // Aggiorna anche la posizione della sfera
  });
  
  document.getElementById('lightY').addEventListener('input', (event) => {
    light.position.y = event.target.value;
    bulbLight.position.y = event.target.value;
    //lightSphere.position.y = event.target.value; // Aggiorna anche la posizione della sfera
  });
  
  document.getElementById('lightZ').addEventListener('input', (event) => {
    light.position.z = event.target.value;
    bulbLight.position.z = event.target.value;
    //lightSphere.position.z = event.target.value; // Aggiorna anche la posizione della sfera
  });


document.addEventListener('DOMContentLoaded', () => {
    // Impostazione del callback per gestire il game over da game.js
    setGameOverCallback(handleGameOverFromGameJS);
    // Altri inizializzazioni come render, controlli, etc.
    // ...

    // Funzione per gestire il reset del gioco da game.js
    function handleGameOverFromGameJS() {
        reset();
    }
});


function reset(){
    saveHighScore(score, level, minutes, seconds, highScores);
    isGameRunning = false;
    isPaused = false;
    score = 0;
    level = 1;
    clearTimeout(gameInterval);
    stopTimer();
    elapsedTime = 0;
    resetGrid();
    resetTetromino();
    gameStartTime = new Date(); // Reset game start time
    timerElement.textContent = '0:00'; // Reset the timer display
    drawGrid();
    bubbles.forEach(bubble => bubbleGroup.remove(bubble));
    bubbles = [];
    // Nascondi il popup di game over se è visibile
    const gameOverPopup = document.getElementById('game-over-popup');
    if (gameOverPopup) {
        gameOverPopup.style.display = 'none';
    }

}

function resetGrid() {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            grid[y][x] = 0;
        }
    }
}

let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
const MAX_HIGH_SCORES = 5;

// Chiamala inizialmente per visualizzare eventuali punteggi salvati
displayHighScores(highScores);

function saveHighScore(score, level, minutes, seconds, highScores) {
    const newScore = {
        score: score,
        level: level,
        minutes: minutes,
        seconds: seconds,
        date: new Date().toLocaleDateString()
    };
    highScores.push(newScore);
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(MAX_HIGH_SCORES);
    localStorage.setItem('highScores', JSON.stringify(highScores));
    displayHighScores(highScores);
}

function displayHighScores(highScores) {
    const highScoresList = document.getElementById('high-scores-list');
    highScoresList.innerHTML = highScores
        .map(score => `<li> Score: ${score.score}, Level: ${score.level}, Time: ${score.minutes}:${score.seconds} s</li>`)
        .join('');
}

// Funzione per mostrare il messaggio temporaneo
function showTemporaryMessagePos(message) {
    const messageElement = document.getElementById('temporary-message');
    messageElement.textContent = message;
    messageElement.style.color = 'green';
    messageElement.style.display = 'block';
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 1000);
}

function showTemporaryMessageNeg(message) {
    const messageElement = document.getElementById('temporary-message');
    messageElement.textContent = message;
    messageElement.style.color = 'red';
    messageElement.style.display = 'block';
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 1000);
}

function clearGridAndAwardPoints() {
    resetGrid(); // Ripulisce la griglia
    score += 1000; // Aggiunge 1000 punti al punteggio
    drawGrid(); // Ridisegna la griglia per riflettere le modifiche
    showTemporaryMessagePos(`+1000 (Grid Cleared)`);
}

function replaceCurrentTetrominoWithSpecial() {
    // Definisci il tetramino speciale
    const specialTetromino = {
        shape: [
            [1]
        ],
        color: 0xff00ff, // Colore speciale
        group: null
    };

    // Sostituisci il tetramino corrente
    Object.assign(currentTetromino, specialTetromino);
    drawGrid(); // Ridisegna la griglia per riflettere le modifiche
    showTemporaryMessagePos(`Monomino Activated!`);
}

function onBubbleClick(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(bubbleGroup.children);

    if (intersects.length > 0) {
        const intersectedBubble = intersects[0].object;
        bubbleGroup.remove(intersectedBubble);
        bubbles = bubbles.filter(b => b !== intersectedBubble);

        const randomValue = Math.random();
        if (randomValue < 0.4) {
            // Premio punti
            const points = Math.floor(Math.random() * 100) + 50;
            score += points;
            showTemporaryMessagePos(`+${points}`);
            console.log(`You won ${points} points!`);
        } else if(randomValue < 0.8) {
            // Penalità punti
            const points = 2 * (Math.floor(Math.random() * 100) + 50);
            score -= points;
            showTemporaryMessageNeg(`-${points}`);
            console.log(`You lost ${points} points!`);
        } else if (randomValue < 0.9 && randomValue > 0.7) {
            // Sostituisci il tetramino corrente con uno speciale
            replaceCurrentTetrominoWithSpecial();
        } else {
            // Pulisci la griglia e aggiungi 1000 punti
            clearGridAndAwardPoints();
        }

        // Aggiorna il punteggio visualizzato
        const scoreElement = document.getElementById('score');
        scoreElement.textContent = score;
    }
}

document.addEventListener('mousedown', onBubbleClick);

document.addEventListener('webglcontextlost', function(event) {
    event.preventDefault();
    // Clean up resources here
    console.log('WebGL context lost');
}, false);

document.addEventListener('webglcontextrestored', function(event) {
    // Context has been restored, reinitialize WebGL
    console.log('WebGL context restored');
    initializeWebGL(); // Example function to reinitialize WebGL
}, false);



drawGrid();
render();