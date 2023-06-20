// Dibuja la pantalla para iniciar con un clic
const state01 = (GAME) => {
    const ctx = GAME.context;
    const w = GAME.canvas.width;
    const h = GAME.canvas.height;

    ctx.fillStyle = '#000000cc';
    ctx.fillRect(10, h / 2 - 40, w - 20, 80);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("Click para iniciar", w / 2, h / 2);
    GAME.state = 0;
}

// Pantalla en que se muestra la puntuación total obtenida
// en el nivel que se ha pasado.
const state02 = (GAME) => {
    if (GAME.frame < 60) {
        const ctx = GAME.context;
        const w = GAME.canvas.width;
        const h = GAME.canvas.height;

        ctx.fillStyle = '#00000002';
        ctx.fillRect(0, 0, w, h);
    } else {
        GAME.score.showSummary(GAME,"Lanzamientos restantes: "+GAME.jarron.lanzamientos);
        GAME.state = 3;// pasa a esperar alguna tecla para continuar
    }
}

//Espera por una tecla para continuar
const state03 = (GAME) => {
    if (GAME.keyUp) {
        if (GAME.keyUp == "Space") {
            //console.log("keys en UP:", GAME.key);
            GAME.keyUp = null;
            GAME.state = 10;
            const radius = GAME.blackBall.radius;
            //Incrementa el numero de bolas;
            GAME.numBalls += 1;
            generaBolas(GAME, radius);
        } else {
            //console.log("State003 key:", GAME.keUp);
        }
    }
}

// Pantalla en que se muestra la puntuación total obtenida
// al finalizar el juego
const state04 = (GAME) => {
    if (GAME.frame < 60) {
        const ctx = GAME.context;
        const w = GAME.canvas.width;
        const h = GAME.canvas.height;

        ctx.fillStyle = '#00000002';
        ctx.fillRect(0, 0, w, h);
    } else {
        GAME.score.showSummary(GAME, "Fin del juego");
        GAME.state = 5;// pasa a esperar alguna tecla para continuar
    }
}

//Espera por una tecla para continuar
const state05 = (GAME) => {
    if (GAME.keyUp) {
        if (GAME.keyUp == "Space") {
            //console.log("keys en UP:", GAME.key);
            GAME.keyUp = null;
            GAME.state = 1;
            //const radius = GAME.blackBall.radius;
            //Incrementa el numero de bolas;
            //GAME.numBalls = 1;
            //generaBolas(GAME, radius);
        } else {
            //console.log("State003 key:", GAME.keUp);
        }
    }
}



// Pantalla de juego activo
const state10 = (GAME) => {
    if (GAME.keyDown) {
        switch (GAME.keyDown) {
            case "ArrowUp":
                subir(GAME);
                break;
            case "ArrowDown":
                bajar(GAME);
                break;
            case "ArrowLeft":
                izquierda(GAME);
                break;
            case "ArrowRight":
                derecha(GAME);
                break;
            default:
                break;
        }
        //GAME.keyDown = null;
    }
    if (GAME.keyUp) {

        switch (GAME.keyUp) {
            case "ArrowUp":
                //subir(GAME);
                break;
            case "ArrowDown":
                //bajar(GAME);
                break;
            case "ArrowLeft":
                disminuyeAngulo(GAME);
                break;
            case "ArrowRight":
                incrementaAngulo(GAME);
                break;
            case "Space":
                lanzarBola(GAME);
                break;
            default:
                break;
        };
        //console.log("keys en UP:", GAME.key);
        GAME.keyUp = null;
    }

    // Limpiar el canvas
    GAME.context.clearRect(0, 0, GAME.canvas.width, GAME.canvas.height);
    // Actualiza el cañon
    GAME.jarron.update(GAME);
    GAME.jarron.draw(GAME.context);
    //Dibuja la bola de referencia;


    // Actualizar la posición de las bolas
    GAME.balls.forEach(function (ball) {
        ball.update(GAME);
    });

    const bb = GAME.blackBall;
    if (bb.visible) {
        const diffx = Math.abs(GAME.jarron.x - bb.x);
        const diffy = GAME.jarron.y - bb.y;
        if (diffx < 10 && bb.dy > 0 && diffy < 35) {
            // Recibe la bola
            bb.y = GAME.boxYmax + 20;
            bb.visible = false;
            GAME.jarron.estado = 1;
            GAME.score.finalizaCombo();

            //Verifica si finaliza el juego
            if (GAME.jarron.lanzamientos <= 0) {
                GAME.state = 4;
                GAME.frame = 0;
            } else {
                //Verifica si finaliza el nivel
                let todosTienenUno = GAME.balls.every(ball => ball.number === 1);
                if (todosTienenUno) {
                    GAME.frame = 0;
                    GAME.state = 2;//############## pasa a mostrar puntuación
                }
            }
        } else {
            const v = Math.abs(GAME.jarron.dx)
            if (diffx < v * 2) {
                if (GAME.jarron.dx > 0) GAME.jarron.dx -= 1;
                if (GAME.jarron.dx < 0) GAME.jarron.dx += 1;
                //console.log("Disminuye la velocidad:", GAME.jarron.dx);
            }
            //console.log("bb.dx:", bb.dx,"\nbb.dy:", bb.dy);
            bb.update(GAME);
            //console.log("bb.dx:", bb.dx,"\nbb.dy:", bb.dy);
            //bb.visible = false;
            //GAME.state = 0;
            // Verifica colisión con bolas para disminuir
            GAME.balls.forEach(function (ball) {
                if (ball.visible) {
                    const d = bb.distance(ball);
                    ball.update(GAME);
                    if (d < 2 * ball.radius) {
                        // se verifica cual es la velocidad mayor
                        const vrq = ball.dx * ball.dx + ball.dy * ball.dy;
                        const vcq = bb.dx * bb.dx + bb.dy * bb.dy;
                        try {
                            if (vcq > vrq) {
                                if (ball.verificaColision(bb) && ball.number % bb.number == 0) {
                                    ball.number = ball.number / bb.number;
                                    GAME.score.agregaCombo();
                                    //if (ball.number == 1) ball.visible = false;
                                }

                            }
                            else {
                                if (bb.verificaColision(ball) && ball.number % bb.number == 0) {
                                    ball.number = ball.number / bb.number;
                                    GAME.score.agregaCombo();
                                    //if (ball.number == 1) ball.visible = false;
                                }
                            }
                        } catch (e) {
                            console.log("Error", e.stack);
                            console.log("Error", e.name);
                            console.log("Error", e.message);
                            console.log("Error en las colisiones");
                            //Dibuja las bolas con las velocidades antes de la colisón
                            //ball.visible = false;
                            bb.draw(GAME.context);
                        }

                    }
                }
            });
            bb.draw(GAME.context);

        }

    }
    //Dibuja la linea de colisión inferior
    const ctx = GAME.context;
    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(GAME.boxXmin, GAME.boxYmax);
    ctx.lineTo(GAME.boxXmax, GAME.boxYmax);
    ctx.stroke();
    // Dibujar todas las bolas
    GAME.balls.forEach(function (ball) {
        if (ball.visible) ball.draw(GAME.context);
    });

}


// Función para dibujar el juego en el canvas
const drawGame = (GAME) => {
    switch (GAME.state) {
        case 0:
            //Fase de espera por un click
            break;
        case 1://Muestra el mensaje de click para iniciar nueva partida
            state01(GAME);
            break;
        case 2://Muestra puntuación
            state02(GAME);
            break;
        case 3://espera espacio para pasar a otro nivel
            state03(GAME);
            break;
        case 4://Muestra puntuación al finalizar el juego
            state04(GAME);
            break;
        case 5://espera espacio para reiniciar
            state05(GAME);
            break;
        case 10:
            state10(GAME);
            break;
        default:
            break;
    }
    GAME.frame += 1;
    if (GAME.frame > 10000) GAME.frame = 0;
    // Llamar a la función de renderizado nuevamente
    requestAnimationFrame(drawGame.bind(null, GAME));
}