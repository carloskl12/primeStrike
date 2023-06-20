
const izquierda = (GAME) => {
    const j = GAME.jarron;
    if (!GAME.rotandoJarron) {
        j.dx -= 1;
        if (j.dx < -j.maxV) j.dx = -j.maxV;
        //console.log("Mueve a la izquierda dx:",c.dx);
    } else {
        if (GAME.frame % 10 === GAME.keyModDown % 10) {
            disminuyeAngulo(GAME);
        }
    }

}
const derecha = (GAME) => {
    const j = GAME.jarron;
    if (!GAME.rotandoJarron) {
        j.dx += 1;
        if (j.dx > j.maxV) j.dx = j.maxV;
    } else {
        if (GAME.frame % 10 === GAME.keyModDown % 10) {
            incrementaAngulo(GAME);
        }
    }

    //console.log("Mueve a la derecha dx:",c.dx);

}

const incrementaAngulo = (GAME) => {
    const j = GAME.jarron;
    if (GAME.rotandoJarron) {
        j.angle += 1;
        if (j.angle > 140) j.angle = 140;
    }
}
const disminuyeAngulo = (GAME) => {
    const j = GAME.jarron;
    if (GAME.rotandoJarron) {
        j.angle -= 1;
        if (j.angle < 40) j.angle = 40;
    }
}



const subir = (GAME) => {
    const bc = GAME.blackBall;
    //console.log("subir: bc.y -",bc.y, " max:", GAME.boxYmax);
    if (!bc.visible) {
        if (GAME.jarron.estado === 1) {
            if (GAME.frame % 10 === GAME.keyModDown % 10) { //&& GAME.frame%5 == 0
                //La bala no está activa
                const first = GAME.primos.shift();
                GAME.primos.push(first);
                GAME.jarron.number = GAME.primos[0];
                GAME.blackBall.number = GAME.primos[0];
                //console.log("Ajusta valores a:", GAME.primos[0]);
            }
        } else if (GAME.jarron.estado === 2) {
            //Esta rotando, y devuelve al estado en que no rota
            GAME.rotandoJarron = false;
            GAME.jarron.estado = 1;

        }


    }

}

const bajar = (GAME) => {
    const bc = GAME.blackBall;
    //console.log("subir: bc.y -",bc.y, " max:", GAME.boxYmax);
    if (!bc.visible) {
        if (GAME.jarron.estado === 1) {
            if (GAME.frame % 10 === GAME.keyModDown % 10) {
                //La bala no está activa
                const last = GAME.primos.pop();
                GAME.primos.unshift(last);
                GAME.jarron.number = GAME.primos[0];
                GAME.blackBall.number = GAME.primos[0];
                //console.log("Ajusta valores a:", GAME.primos[0]);
            }
        } else if (GAME.jarron.estado === 2) {
            //Esta rotando, y devuelve al estado en que no rota
            GAME.rotandoJarron = false;
            GAME.jarron.estado = 1;

        }
    }

}

const frenarCanon = (GAME) => {
    const c = GAME.jarron;
    if (c.dx > 0) c.dx -= 1;
    if (c.dx < 0) c.dx += 1;
    console.log("Se frena");
}



const lanzarBola = (GAME) => {
    const bc = GAME.blackBall;
    //console.log("bc.y , boxYmax:",bc.y,GAME.boxYmax, bc.y < GAME.boxYmax)
    if (!bc.visible) {
        if (GAME.rotandoJarron) {
            const v = 7;
            const y = 5 + bc.radius + GAME.jarron.y - GAME.boxYmax;
            const x = -Math.tan((90 - GAME.jarron.angle) * Math.PI / 180) * y;
            //console.log(" jarron angle:", GAME.jarron.angle);
            //console.log(" valor x:", x," y:",y);
            bc.x = GAME.jarron.x;
            bc.x += x;
            bc.y = GAME.jarron.y - y;
            bc.dy = -v * Math.sin(GAME.jarron.angle * Math.PI / 180);
            bc.dx = -v * Math.cos(GAME.jarron.angle * Math.PI / 180);
            bc.mu = 0.01;
            bc.visible = true;
            GAME.jarron.dx = 0; //Frena directamente
            GAME.rotandoJarron = false;
            GAME.jarron.estado = 0;
            GAME.jarron.lanzamientos -= 1;
            //console.log("Se ha lanzado la bola");
        } else {
            GAME.rotandoJarron = true;
            GAME.jarron.estado = 2;
        }

    } else {
        if (bc.dx == 0 && bc.dy == 0) {
            //console.log("Recoge la bola:", bc.y);
            bc.visible = false;
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

        }

    }
}

//Funciones para el manejo de eventos
const keyDownHandler = (GAME, event) => {
    const key = event.code;
    if (GAME.key.hasOwnProperty(key)) {
        GAME.key[key] = true;
        GAME.keyDown = key;
        if (GAME.keyUp === key) GAME.keyUp = null;
        event.preventDefault();
        //console.log("kh - KeyDown:"+key,"\nstate:",GAME.state);
        GAME.keyModDown = GAME.frame % 20;
        GAME.keyModUp = -1;
    }
}

const keyUpHandler = (GAME, event) => {
    const key = event.code;
    if (GAME.key.hasOwnProperty(key)) {
        GAME.key[key] = false;
        GAME.keyUp = key;
        if (GAME.keyDown === key) GAME.keyDown = null;
        event.preventDefault();
        //console.log("kh - KeyUp:"+key,"\nstate:",GAME.state);
        GAME.keyUpFrame = GAME.frame;
        GAME.keyModDown = -1;
        GAME.keyModUp = GAME.frame % 20;
    }
}