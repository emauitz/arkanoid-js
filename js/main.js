// PROYECTO EN PROCESO - SE AGRADECE A MIDUDEV por su tutorial y a TonyVargas y Juanma_Gutierrez por su codigo de los cuales tome ideas e inspiracion, Saludos!

const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d") //2D rendering

const $sprite = document.querySelector("#sprite")
const $bricks = document.querySelector("#bricks")

canvas.width = 448
canvas.height = 400

// Variables modificables para la velocidad de la bola y la sensibilidad de la paleta
let BALL_SPEED = 3; // Valor por defecto
let PADDLE_SENSITIVITY = 10; // Valor por defecto
let juegoIniciado = false; // Variable para controlar si el juego está iniciado o no
let highScores = []; // Array para almacenar los puntajes record

//Vidas y puntos
let puntos = 0;
let level = 1;
let aumentaPuntuación = 10;
let gameOver = "";
let movimientoPlayer = 4;
let finPartida = 0
let vidas = 3;
let juegoPausado = false;

// Variables de la pelota
const ballRadius = 3
//posicion de la pelota
let x = canvas.width / 2
let y = canvas.height -30
//velocidad de la pelota
let dx = 3
let dy = -3
//Variables de la paleta
const paddleHeight = 10;
const paddleWidth = 50;
let paddleX = (canvas.width - paddleWidth) / 2
let paddleY = canvas.height - paddleHeight -10
let rightPressed = false
let leftPressed = false

// variables de los ladrillos
const bricksRowCount = 6;
const bricksColumnCount = 13;
const brickWidth = 32;
const brickHeight = 16;
const brickPadding = 0;
const brickOffSetTop = 80;
const brickOffSetLeft = 16;
const bricks = [];
const BRICK_STATUS = {
    ACTIVE: 1,
    DESTROYED: 0
}

for (let c = 0; c < bricksColumnCount; c++) {
    bricks[c] = [] // iniciamos con un array vacio
    for (let r = 0; r < bricksRowCount; r++) {
    //calculamos la posicion del ladrillo en la pantalla
        const brickX = c * (brickWidth + brickPadding) + brickOffSetLeft
        const brickY = r * (brickHeight + brickPadding) + brickOffSetTop
        //asignar colores aleatorios a los ladrillos
        const random = Math.floor(Math.random() * 8) //sirve para conseguir numeros aleatorios
        //guardamos la informacion de cada ladrillo
        bricks[c][r] = {
            x: brickX, 
            y: brickY, 
            status: BRICK_STATUS.ACTIVE, 
            color: random 
        }
    }
}

//cambio ultima version
function startGame() {
    showStartMenu(); // Mostrar el menú de inicio al iniciar el juego
    resetGame(); // Restablecer todos los valores del juego
}
//fin cambio ultima version

function resetGame() {
    // Restablecer la posición de la pelota
    x = canvas.width / 2;
    y = canvas.height - 30;
    // Restablecer la velocidad de la pelota
    dx = BALL_SPEED;
    dy = -BALL_SPEED;
    // Restablecer el estado de los ladrillos
    for (let c = 0; c < bricksColumnCount; c++) {
        for (let r = 0; r < bricksRowCount; r++) {
            bricks[c][r].status = BRICK_STATUS.ACTIVE;
        }
    }
    // Restablecer la posición de la paleta
    paddleX = (canvas.width - paddleWidth) / 2;
    paddleY = canvas.height - paddleHeight - 10;

    puntos = 0; // Restablecer los puntos
    vidas = 3; // Restablecer las vidas
}

function drawPuntos() {
    ctx.beginPath();
    ctx.fillStyle = "grey";
    ctx.textAlign = "left";
    ctx.font = "20px Arial";
    ctx.fillText("Puntos: " + puntos, 5, 20);

    // Obtener los puntajes record
    const highScores = getHighScores();
    if (highScores.length > 0) {
        const bestScore = highScores[0]; // El mejor puntaje es el primero en el array ordenado
        ctx.fillText("Mejor Puntaje: " + bestScore, 5, 40); // Mostrar el mejor puntaje
    } else {
        ctx.fillText("Mejor Puntaje: 0", 5, 40); // Mostrar 0 si no hay puntajes record
    }

    ctx.closePath();
}

function drawVidas() {
    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.textAlign = "right";
    ctx.font = "20px Arial";
    let cadenaVidas = "";
    let v = 0;
    for (v = 1; v <= vidas; v++) {
        cadenaVidas += "❤";
    }
    ctx.fillText(cadenaVidas, canvas.width - 5, 20);
    ctx.closePath();
}

function drawBall() {
    ctx.beginPath() //iniciar el trazado
    ctx.arc(x,y, ballRadius, 0, Math.PI*2)
    ctx.fillStyle = "white"
    ctx.fill()
    ctx.closePath() //terminar el trazado
}

function drawPaddle() {
    ctx.drawImage(
        $sprite, //la imagen
        29, //clipx: coordenadas de recorte
        174, //clipy: coodenadas de recorte
        paddleWidth, //tamaño de recorte
        paddleHeight, // tamaño de recorte
        paddleX, //posicion x del recorte
        paddleY, //posicion y del recorte
        paddleWidth, //ancho del dibujo
        paddleHeight //alto del dibujo
    )
}

function drawBricks() {
    for (let c = 0; c < bricksColumnCount; c++) {
        for (let r = 0; r < bricksRowCount; r++) {
            const currentBrick = bricks [c][r]
            if (currentBrick.status === BRICK_STATUS.DESTROYED)
            continue;

            const clipx = currentBrick.color * 32

            ctx.drawImage(
                $bricks,
                clipx,
                0,
                31,
                14,
                currentBrick.x,
                currentBrick.y,
                brickWidth,
                brickHeight
            )
        }  
    }      
}

// Función para obtener los puntajes record desde localStorage
function getHighScores() {
    const scores = localStorage.getItem('arkanoidHighScores');
    return scores ? JSON.parse(scores) : [];
}

// Función para guardar un nuevo puntaje record
function saveHighScore(score) {
    highScores.push(score); // Agregar el nuevo puntaje al array
    highScores.sort((a, b) => b - a); // Ordenar de mayor a menor
    highScores = highScores.slice(0, 5); // Limitar a los 5 mejores puntajes
    localStorage.setItem('arkanoidHighScores', JSON.stringify(highScores)); // Guardar en localStorage
    console.log(localStorage.getItem('arkanoidHighScores'))
}

// Función para dibujar los puntajes record en el canvas
function drawHighScores() {
    const highScoresList = document.getElementById('highScores');
    highScoresList.innerHTML = ''; // Limpiar la lista actual

    const scores = getHighScores();
    scores.forEach((score, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${score}`;
        highScoresList.appendChild(listItem);
    });
}

function collisionDetection() {
    for (let c = 0; c < bricksColumnCount; c++) {
        for (let r = 0; r < bricksRowCount; r++) {
            const currentBrick = bricks[c][r]
            if (currentBrick.status === BRICK_STATUS.DESTROYED) continue;

            const isBallSameXAsBrick =
                x > currentBrick.x &&
                x < currentBrick.x + brickWidth

            const isBallSameYAsBrick =
                y > currentBrick.y &&
                y < currentBrick.y + brickHeight

            if (isBallSameXAsBrick && isBallSameYAsBrick) {
                dy = -dy
                currentBrick.status = BRICK_STATUS.DESTROYED
                // Actualiza el puntaje en la interfaz
                puntos++
                document.getElementById('puntos').innerText = `puntos: ${puntos}`;
                if (puntos === bricksRowCount * bricksColumnCount)  { // Muestra un mensaje de victoria
                    if (confirm("¡Ganaste! ¿Quieres volver a intentarlo?")) {
                        resetGame();
                    } else {
                        document.location.reload();
                    }
                }

            }
        }
    }
}

//cambio ultima version prompt endgame
function showEndGamePrompt() {
    let playAgain = confirm("Game Over. ¿Quieres volver a intentarlo?");

    if (playAgain) {
        resetGame();
        juegoIniciado = true; // Marcar el juego como iniciado
    } else {
        window.location.href = "index.html"; // Redirigir al menú principal si no se desea jugar de nuevo
    }
}
//fin cambio ultima version

function ballMovement() {
    //colisiones laterales
    if (
        x + dx > canvas.width - ballRadius || //pared derecha
        x + dx < ballRadius //pared izquierda
    ) {
        dx = -dx
    }
    //rebotar en la parte de arriba
    if (y + dy < ballRadius) {
        dy = -dy
    }
    //Si la pelota toca la pala 
    const isBallSameXAsPaddle =
        x > paddleX &&
        x < paddleX + paddleWidth

    const isBallTouchingPaddle =
        y + dy > paddleY
    if ( isBallSameXAsPaddle && isBallTouchingPaddle) {
        dy = -dy // cambia de dir de la pelota
    }
    else if (  //la pelota toca el suelo
        y + dy > canvas.height - ballRadius) {
        vidas--; //pierde una vida
        if (vidas === 0) {
            showEndGamePrompt(); // muestra prompt al perder todas las vidas
        } else {
            // restablecer la pelota y la paleta
            x = canvas.width / 2;
            y = canvas.height - 30;
            dx = 3;
            dy = -3;
            paddleX = (canvas.width - paddleWidth) / 2;
        }
    }
    x += dx
    y += dy
}

function paddleMovement() {
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += PADDLE_SENSITIVITY
    } else if (leftPressed && paddleX > 0)
        paddleX -= PADDLE_SENSITIVITY
}

//limpia el lienzo
function cleanCanvas () {
    ctx.clearRect(0,0, canvas.width, canvas.height)
}

// CAMBIO ULTIMA VERSION MENU DE INICIO
// Función para mostrar el menú de inicio y configurar opciones
function showStartMenu() {
    let ballSpeedInput = prompt("Ingrese la velocidad de la bola (1 - 10):", BALL_SPEED);
    BALL_SPEED = parseInt(ballSpeedInput) || BALL_SPEED;
    BALL_SPEED = Math.max(1, Math.min(10, BALL_SPEED));

    let paddleSensitivityInput = prompt("Ingrese la sensibilidad de la paleta (1 - 10):", PADDLE_SENSITIVITY);
    PADDLE_SENSITIVITY = parseInt(paddleSensitivityInput) || PADDLE_SENSITIVITY;
    PADDLE_SENSITIVITY = Math.max(1, Math.min(10, PADDLE_SENSITIVITY));

    let controlMethodInput = prompt("Elija el método de control (teclado/mouse):", "teclado");
    controlMethodInput = controlMethodInput ? controlMethodInput.toLowerCase() : "teclado";
    useMouseControl = controlMethodInput === "mouse";

    juegoIniciado = true; // Marcar el juego como iniciado después de configurar las opciones

    resetGame(); // Restablecer el juego después de configurar las opciones
}
// ACA TERMINA CAMBIO ULTIMA VERSION DE MENU DE INICIO

function initEvent() {
    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);

    function keyDownHandler(event) {
        const { key } = event;
        if (key === "Right" || key === "ArrowRight") {
            rightPressed = true;
        } else if (key === "Left" || key === "ArrowLeft") {
            leftPressed = true;
        } else if (key === " ") { // Barra espaciadora
            juegoPausado = !juegoPausado; // Cambiar el estado de pausa
        }
    }

    function keyUpHandler(event) {
        const { key } = event;
        if (key === "Right" || key === "ArrowRight") {
            rightPressed = false;
        } else if (key === "Left" || key === "ArrowLeft") {
            leftPressed = false;
        }
    }
}

// funcion de programacion de refresco
function draw() {
    cleanCanvas(); // Limpiar el lienzo

    if (juegoIniciado && !juegoPausado) {
        // Dibujar elementos y lógica de juego solo si está iniciado
        drawBall();
        drawPaddle();
        drawBricks();
        collisionDetection();
        ballMovement();
        paddleMovement();
    }

    // Dibujar vidas, puntos y puntajes récord almacenados
    drawVidas();
    drawPuntos();
    drawHighScores();

    window.requestAnimationFrame(draw); // solicita el siguiente cuadro de animacion
}

showStartMenu(); // Configurar opciones iniciales
initEvent(); // Iniciar eventos del teclado
draw(); // Iniciar el bucle de dibujo
