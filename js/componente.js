class GameObject {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        // velocidad de desplazamiento
        this.dx = 0;
        this.dy = 0;
        // Si es visible
        this.visible = true;
    }

    draw(context) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);
    }
    update() {
        console.log("actualiza según la lógica del juego");
    }

    newPos() {
        this.x += this.dx;
        this.y += this.dy;
    }

    crashWith(otherobj) {
        const myleft = this.x;
        const myright = this.x + this.width;
        const mytop = this.y;
        const mybottom = this.y + this.height;
        const otherleft = otherobj.x;
        const otherright = otherobj.x + otherobj.width;
        const othertop = otherobj.y;
        const otherbottom = otherobj.y + otherobj.height;

        const crash =
            mybottom >= othertop &&
            mytop <= otherbottom &&
            myright >= otherleft &&
            myleft <= otherright;

        return crash;
    }

    calculateBrightness(color) {
        // Convertir el color en RGB
        const r = parseInt(color.substr(1, 2), 16);
        const g = parseInt(color.substr(3, 2), 16);
        const b = parseInt(color.substr(5, 2), 16);

        // Calcular el brillo utilizando la fórmula de luminancia
        return (r * 299 + g * 587 + b * 114) / 1000;
    }

    distance(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.round(Math.sqrt(dx * dx + dy * dy));
    }

}


const radAGrados = (rad) => {
    return 180 * rad / Math.PI;
}

const cantidadMovimiento = (ball1, ball2) => {
    const x = ball1.dx + ball2.dx;
    const y = ball1.dy + ball2.dy;
    return Math.sqrt(x * x + y * y);
}

const energia = (ball1, ball2) => {
    const v1 = Math.sqrt(ball1.dx * ball1.dx + ball1.dy * ball1.dy);
    const v2 = Math.sqrt(ball2.dx * ball2.dx + ball2.dy * ball2.dy);
    return v1 * v1 + v2 * v2;
}

const energy = (dx1, dy1, dx2, dy2) => {
    const v1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const v2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    return v1 * v1 + v2 * v2;
}


class Ball extends GameObject {
    constructor(x, y, radius, dx, dy, color, number) {
        super(x, y, radius, radius, color);
        this.radius = radius;
        this.dx = dx;
        this.dy = dy;
        this.number = number;
        this.colorFont = "white";
        this.mu = 0;
    }

    draw(context) {
        // Dibujar la bola en el canvas
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        context.fillStyle = this.color;
        context.fill();
        context.closePath();

        // Dibujar el número en el centro del círculo
        context.fillStyle = this.colorFont;
        context.font = 'bold 20px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(this.number, this.x, this.y);

    }

    update(GAME) {
        const colAbajo = this.y + this.radius >= GAME.boxYmax;
        const colArriba = this.y - this.radius <= GAME.boxYmin;

        // Actualizar la posición de la bola y verificar colisiones con los bordes del canvas
        if (colArriba || colAbajo) {
            this.dy = -this.dy;
            if (colArriba) {
                this.y = GAME.boxYmin + this.radius + 1;
            } else {
                this.y = GAME.boxYmax - this.radius - 1;
            }
        }
        const colDerecha = this.x + this.radius >= GAME.boxXmax;
        const colIzquierda = this.x - this.radius <= GAME.boxXmin;
        if (colIzquierda || colDerecha) {
            this.dx = -this.dx;
            if (colIzquierda) {
                this.x = GAME.boxXmin + this.radius + 1;     
            } else {
                this.x = GAME.boxXmax - this.radius - 2;
            }
        }

        this.x += this.dx;
        this.y += this.dy;
        if (this.mu > 0) {
            const ang = Math.atan2(this.dy, this.dx);
            const mag = Math.sqrt(this.dx * this.dx+ this.dy * this.dy);
            //console.log("mag:",mag,"\ndx:",this.dx,"\ndy:",this.dy);
            //console.log("mu:",this.mu,"\nnumber:", this.number);
            if (mag > this.mu) {
                this.dx -= Math.cos(ang) * this.mu;
                this.dy -= Math.sin(ang) * this.mu;
            } else {
                this.dx = 0;
                this.dy = 0;
            }


        }
    }

    verificaColision(ball) {
        let d = this.distance(ball);
        if (d <= this.radius + ball.radius) {


            //console.log("\n\n*Hay colision d:", d);
            //console.log("x1,y1:", ball.x, ball.y);
            //console.log("x2,y2:", this.x, this.y);
            //console.log("ball1.dx:", ball.dx, "\nball1.dy:", ball.dy);
            //console.log("ball2.dx:", this.dx, "\nball2.dy", this.dy);
            //Por concervación del movimiento
            //Calcula el movimiento inicial
            const mov0 = cantidadMovimiento(ball, this);
            const e0 = energia(ball, this);

            // Transforma el sistema coordenado y la referencia
            // para calcular la colision elástica
            // de una bola en movimiento y otra en reposo
            // el movimiento se hace horizontalmente

            //La bola en reposo es this, y la en movimento es ball
            const dx = ball.dx - this.dx;
            const dy = ball.dy - this.dy;
            // Se calcula la magnitud de la velocidad y el ángulo
            // para rotar el sistema de coordenadas
            const u1 = Math.sqrt(dx * dx + dy * dy);
            const phi = Math.atan2(dy, dx);
            //console.log("phi:", radAGrados(phi));
            //console.log("u1_dx:", dx, "\nu1_dy:", dy);

            // se calcula el parámetro de impacto b
            // se calcula el ángulo entre el vector de velociad
            // ajustado de la bola uno y el vector de 
            // recorrido entre los centros de las bolas
            let rx = this.x - ball.x;
            let ry = this.y - ball.y;
            // Calcular el ángulo entre los dos vectores
            let anguloRad = Math.atan2(ry, rx) - Math.atan2(dy, dx);

            let b = d * Math.sin(anguloRad);
            if (b === 0) {
                //perfectamente alineados
                ball.dx = this.dx;
                ball.dy = this.dy;
                this.dx += dx;
                this.dy += dy;
                return;
            }
            //Corrección de coordenadas para evitar colisión continua
            const angCorr = Math.PI + Math.atan2(ry, rx);
            const correc = 2 * this.radius - d + 1;
            ball.x += correc * Math.cos(angCorr);
            ball.y += correc * Math.sin(angCorr);
            d = ball.distance(this);
            let negativo = b < 0;
            //Recalcula b porque cambio d
            b = Math.abs(d * Math.sin(anguloRad));

            //console.log("anguloRad:", radAGrados(anguloRad));
            //console.log("b:", b);
            //console.log("d (corregido):", d);
            //if (negativo) console.log("b es  negativo.");
            //else console.log("b es positivo");

            //console.log("Luego de corregirlo x1,y1:", ball.x, ball.y);
            //console.log("angCorr:", radAGrados(angCorr));

            //rx = this.x - ball.x;
            //ry = this.y - ball.y;
            //console.log("angCorr2:",radAGrados(Math.PI+Math.atan2(ry,rx)) );


            // Las componentes
            const dx1 = u1 * b * b / (d * d);
            let dy1 = u1 * b * Math.sqrt(d * d - b * b) / (d * d);
            //Si b es negativo, dy1 es negativo
            if (!negativo) dy1 *= -1;// se vuelve negativo
            const dx2 = u1 * (d * d - b * b) / (d * d);
            const dy2 = -dy1;//Opuesto a dy1 por concervación de movimiento


            //Angulos
            const theta1 = Math.atan2(dy1, dx2);
            const theta2 = Math.atan2(dy2, dx2);


            //console.log("theta1:", radAGrados(theta1));
            //console.log("theta2:", radAGrados(theta2));

            //console.log({dx1:dx1,dy1:dy1,dx2:dx2,dy2:dy2})
            //console.log("dx1:", dx1, "\ndy1:", dy1);
            //console.log("dx2:", dx2, "\ndy2:", dy2);

            // se deshace la rotación y traslacion
            ball.dx = (dx1 * Math.cos(phi) - dy1 * Math.sin(phi)) + this.dx;
            ball.dy = (dx1 * Math.sin(phi) + dy1 * Math.cos(phi)) + this.dy;

            this.dx += dx2 * Math.cos(phi) - dy2 * Math.sin(phi);
            this.dy += dx2 * Math.sin(phi) + dy2 * Math.cos(phi);

            //console.log("E inicial ref u1^2:", u1 * u1);
            //console.log("E final ref u1^2:", energy(dx1, dy1, dx2, dy2));

            //Movimiento final
            const movf = cantidadMovimiento(ball, this);
            const ef = energia(ball, this);
            //console.log("Mov inicial:", mov0);
            //console.log("Mov final:", movf);
            //console.log("Energía inicial:", e0);
            //console.log("Energía final:", ef);




            //console.log("ball1.dx:", ball.dx, "\nball1.dy:", ball.dy);
            //console.log("ball2.dx:", this.dx, "\nball2.dy", this.dy);
            if (Math.abs(e0 - ef) > 0.1) {
                //console.log("Error en la concervación de energías");
                GAME.stop = true;
            }

            const k = 0;
            this.x += k * this.dx;
            this.y += k * this.dy;
            ball.x += k * ball.dx;
            ball.y += k * ball.dy;
            return true;

        }
        return false;
    }
}

class Jarron extends GameObject {
    constructor(x, y, width, height, minV, maxV) {
        super(x, y, width, height);
        this.dx = minV; //velocidad minima
        this.dy = 0;
        this.minV = minV;
        this.maxV = maxV; //velocidad máxima
        this.number = 2;
        this.mu = 0.70;
        this.angle= 90;//Angulo del jarron
        this.estado = 0;
        // Configura la cantidad máxima de lanzamientos
        this.maxLanzamientos = 5;
        this.lanzamientos = 5;
    }

    draw(context) {
        
        
        const h1 = Math.round(this.height * 0.3);
        const h2 = Math.round(this.height - h1);
        // lo que le resta al ancho de lado y lado
        const dw = Math.round(this.width * 0.12);
        const w2 = this.width - 2 * dw;

        // Traslada el origen para que el centro de la boca coincida
        // con su ubicación
        context.translate(this.x , this.y);
        context.rotate((this.angle-90)*Math.PI/180);


        if(this.estado === 2) {
            context.strokeStyle = "#aaa";
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(0,0);
            context.lineTo(0,-50);
            context.stroke();

            context.beginPath();
            context.moveTo(-5,-50);
            context.lineTo(0,-58);
            context.lineTo(5,-50);
            context.closePath();
            context.fillStyle = "#aaa";
            context.fill();
        }


        context.fillStyle = "#8aa1bd";
        context.fillRect(-this.width/2, 0, this.width, h1);

        context.fillStyle = "#6c7a8b";
        context.fillRect(-this.width/2+dw, h1, w2, h2);


        if(this.estado === 2) {
            context.fillStyle = "#ff0";
        }else if(this.estado === 1){
            context.fillStyle = "#8f1";
        }else{
            context.fillStyle = "#6c7a8b";
        }
        context.fillRect(-this.width/2+2*dw, h1+4, w2-2*dw, 5);

        context.translate(0, 1.7*this.height);//traslada el origen

        
        // Dibujar la base contenedora de la bola de referencia
        context.beginPath();
        context.arc( 0, 0, this.height, 0, 2 * Math.PI);
        context.fillStyle = "#6c7a8b";
        context.fill();
        context.closePath();

        
        // Dibujar la bola en el canvas
        const radius = this.width*0.4;
        context.beginPath();
        context.arc(0, 0, radius, 0, 2 * Math.PI);
        context.fillStyle = "#a9d0ff";
        context.fill();
        context.closePath();

        // Dibujar el número en el centro del círculo
        context.fillStyle = "#65788d";
        context.font = 'bold 20px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(this.number, 0, 0);
        

        // Dibuja el anillo de progreso
        // Dibujar el anillo gris
        context.lineWidth = 5;
        context.strokeStyle = "#555";
        context.beginPath();
        context.arc(0, 0, radius+2, 0, Math.PI*2);        
        context.stroke();

        const progressDegrees = 120*this.lanzamientos/this.maxLanzamientos;
        const startAngle = -Math.PI / 2; // Iniciar en la parte superior
        const endAngle = startAngle +  this.lanzamientos *2* (Math.PI / (this.maxLanzamientos));
        context.strokeStyle = `hsl(${progressDegrees}, 100%, 50%)`;
        context.beginPath();
        context.arc(0, 0, radius+2, startAngle, endAngle);        
        context.stroke();

        context.resetTransform();

    }
    update(GAME) {
        // Actualizar la posición y verificar colisiones con los bordes del canvas
        if (this.x + this.width >= GAME.boxXmax) {
            if (this.dx > 0)
                this.dx = -this.dx;
        } else if (this.x- this.width <= GAME.boxXmin) {
            if (this.dx < 0)
                this.dx = -this.dx;
        }


        this.x += this.dx;
        if (this.mu > 0) {
            if (this.dx != 0) {
                
                if (Math.abs(this.dx) > this.mu ) {
                    this.dx*=this.mu;
                } else this.dx = 0;

            }
        }
    }

}