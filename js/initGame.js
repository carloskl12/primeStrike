const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
const generateRandomColor = (sumValue) => {
    // Generar componentes RGB aleatorios
    let a = Math.floor(Math.random() * 256);

    let b = Math.floor(Math.random() * (sumValue - a + 1));
    b = Math.min(255, b);
    let c = (sumValue - a - b);
    c = Math.min(255, c);

    const colores = [a, b, c];
    shuffleArray(colores)

    // Devolver el color en formato RGB
    return `rgb(${colores[0]}, ${colores[1]}, ${colores[2]})`;
}

const generaBolas = (GAME, radius) => {
    if(GAME.numBalls < GAME.balls.length){
        const extra = GAME.balls.length - GAME.numBalls;
        for(let i =0; i < extra;i++){
            GAME.balls.pop();
        }
    }
    // Crear las bolas y agregarlas al array
    for (let i = 0; i < GAME.numBalls; i++) {

        let x = Math.round((Math.random() * (GAME.boxXmax - 2 * (radius + 1))) + radius);
        let y = Math.round((Math.random() * (GAME.boxYmax - 2 * (radius + 1))) + radius);
        if (x + radius < GAME.boxXmin) x = GAME.boxXmin + radius;
        if (y + radius < GAME.boxYmin) y = GAME.boxYmin + radius;

        let dx = Math.round((Math.random() - 0.5) * 5); // Velocidad horizontal aleatoria
        let dy = Math.round((Math.random() - 0.5) * 5); // Velocidad vertical aleatoria
        if (dx === 0) dx = 1;
        if (dy === 0) dy = 1;



        const color = generateRandomColor(300);
        const numero = Math.floor(Math.random() * 48) + 3;//numero de 2 50
        if (i >= GAME.balls.length) {
            const ball = new Ball(x, y, radius, dx, dy, color, numero);
            ball.mu = 0.01;
            GAME.balls.push(ball);
        } else {
            const ball = GAME.balls[i];
            ball.x = x;
            ball.y = y;
            ball.dx = dx;
            ball.dy = dy;
            ball.color = color;
            ball.number = numero;
        }

    }
}

const resetGame = (GAME) => {
    const radius = GAME.blackBall.radius;
    //GAME.state = 1;
    GAME.score = new Score();
    GAME.numBalls = 1;
    GAME.primos = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    GAME.blackBall.number = 2;
    GAME.jarron.number = 2;
    GAME.blackBall.visible = false;

    GAME.jarron.x = 240;
    GAME.jarron.y = 260;
    GAME.jarron.estado = 1;
    GAME.jarron.maxLanzamientos = 16;
    GAME.jarron.lanzamientos = 16;    
    GAME.jarron.angle = 90;
    GAME.rotandoJarron = false;
    GAME.frame = 0;

    generaBolas(GAME, radius);

}

const iniciaJuego = (GAME) => {
    if (GAME.state === 0) {
        resetGame(GAME);
        GAME.state = 10;
        //GAME.canvas.removeEventListener('click', iniciaJuego);
        console.log("Juego iniciado...");
    }
}

const reiniciarJuego = (GAME) => {
    GAME.state = 1;//Dibuja  click y reinicia
}

// Función para inicializar el juego
function initGame() {
    // Verifica si se inicializó la API para SCORM
    if(scormInitialized){
        console.log("La API de scorm está disponible");
    }else{
        console.log("La API de scorm no está disponible");
    }
    const colorBCanon = "#000";
    const radius = 20;
    const GAME = {
        state: 1,
        score: new Score(),
        primos: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47],
        balls: [],
        numBalls: 1,
        canvas: document.getElementById("game-canvas"),
        context: null,
        boxXmin: 0, //Caja donde se mueven los números
        boxXmax: 480,
        boxYmin: 0,
        boxYmax: 250,
        jarron: new Jarron(240, 260, radius * 2.4, 30, 0, 15),
        blackBall: new Ball(240, 260, radius, 0, 3, colorBCanon, 2),
        key: {
            'ArrowUp': false, 'ArrowDown': false, 'ArrowLeft': false,
            'ArrowRight': false, 'Space': false, 'KeyA': false, 'KeyS': false
        },
        keyDown: null,
        keyUp: null,
        //Los resultados del modulo se guardan en dichas variables
        // para que el hecho de restar la velocidad de detección
        // de las teclas sea mas natural, y no se sienta retardo
        // en la primera vez que se detecta
        keyModDown: -1,
        keyModUp: -1,
        rotandoJarron:false,
        frame: 0,
    }
    GAME.blackBall.visible = false;
    GAME.blackBall.mu = 0.01;
    GAME.context = GAME.canvas.getContext("2d");
    if (GAME.context == null) {
        console.log("No se pudo obtener el contexto");
    }

    generaBolas(GAME, radius);
    //Asigna la lectura de controles de teclado
    // Escucha los eventos de teclado
    document.addEventListener("keydown", function (event) {
        keyDownHandler(GAME, event)
    });

    GAME.canvas.addEventListener("click", iniciaJuego.bind(null, GAME));

    // Escucha cuando se libera una tecla para liberar el movimiento
    document.addEventListener("keyup", function (event) {
        keyUpHandler(GAME, event)
    });

    //Botón de reinicio
    // Agregar controlador de eventos al botón
    const botonReinicia = document.getElementById("reinicia");
    botonReinicia.addEventListener("click", reiniciarJuego.bind(null,GAME));

    const botonRegistraNota = document.getElementById("registraNota");
    botonRegistraNota.addEventListener("click", registraNota.bind(null,GAME));
    // Llamar a la función de renderizado del juego
    drawGame(GAME);
}

