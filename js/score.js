class Score {
    constructor() {
        this.totalPoints = 0;
        this.stagePoints = 0;
        this.simpleFactor = 0;
        this.dobleFactor = 0;
        this.tripleFactor = 0;
        this.combo = 0;
        // Peso en puntos de cada combo de factores
        this.pesoF1 = 10;
        this.pesoF2 = 30;
        this.pesoF3 = 50;
    }
    //Agrega puntos por un combo
    agregaCombo() {
        if (this.combo >= 3) this.finalizaCombo();
        this.combo += 1;
    }

    finalizaCombo() {
        switch (this.combo) {
            case 1:
                this.simpleFactor += 1;
                break;
            case 2:
                this.dobleFactor += 1;
                break;
            case 3:
                this.tripleFactor += 1;
                break;
        }
        this.combo = 0;
    }

    showSummary(GAME, mensaje = "") {
        //console.log(this);
        const ctx = GAME.context;
        const w = GAME.canvas.width;
        const h = GAME.canvas.height;

        const x1 = 30;


        const hline = 35;

        ctx.fillStyle = '#003355dd';
        ctx.fillRect(10, 10, w - 20, h - 20);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 27px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let y = 40;
        ctx.fillText("NIVEL " + GAME.balls.length, w / 2, y);

        const medidaTexto = ctx.measureText("Combo normal").width;
        const x2 = x1 + medidaTexto + 5;// donde inician los 2 puntos
        const x3 = x2 + ctx.measureText(": 00x00 = 0000").width + 5;// fin de las cuentas
        //console.log("x1:",x1);
        //console.log("x2:",x2);
        //console.log("x3:",x3);
        y += hline;
        this.escribeCombo(ctx, 'simple', this.pesoF1, this.simpleFactor, x1, y, x2, x3);
        y += hline;
        this.escribeCombo(ctx, 'doble', this.pesoF2, this.dobleFactor, x1, y, x2, x3);
        y += hline;
        this.escribeCombo(ctx, 'triple', this.pesoF3, this.tripleFactor, x1, y, x2, x3);
        y += hline;
        const subtotal = this.calculaSubtotal();
        this.escribeInfo(ctx, "Subtotal", x1, y, "", x2, "= " + subtotal.toString().padStart(4, '0'), x3);
        this.totalPoints += subtotal;
        y += hline;
        ctx.fillStyle = "#ff0";
        this.escribeInfo(ctx, "Puntos totales", x1, y, "", x2, "= " + this.totalPoints.toString().padStart(4, '0'), x3);

        //Dibuja las lineas
        y -= hline / 2;

        ctx.strokeStyle = "#ff0";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1 - 4, y);
        ctx.lineTo(x3 + 4, y);
        ctx.stroke();
        y -= hline;
        ctx.strokeStyle = "#fff";
        ctx.beginPath();
        ctx.moveTo(x1 - 4, y);
        ctx.lineTo(x3 + 4, y);
        ctx.stroke();

        y += 3 * hline;
        ctx.fillStyle = '#ff0';
        ctx.font = 'bold 25px Arial';
        ctx.textAlign = "center";
        ctx.fillText(mensaje, w / 2, y);


    }

    calculaSubtotal() {
        return this.pesoF1 * this.simpleFactor + this.pesoF2 * this.dobleFactor + this.pesoF3 * this.tripleFactor;
    }

    escribeCombo(ctx, tipo, peso, cantidad, x1, y, x2, x3) {
        let t1 = "Combo " + tipo;
        let t2 = ": " + peso.toString().padStart(2, '0') + "x" + cantidad.toString().padStart(2, '0');
        let t3 = "= " + (peso * cantidad).toString().padStart(4, '0');
        //console.log("escribe t2:",t2);
        //console.log("escribe t3:",t3);
        this.escribeInfo(ctx, t1, x1, y, t2, x2, t3, x3);
    }
    // utiliza tres alineaciones
    escribeInfo(ctx, t1, x1, y, t2, x2, t3, x3) {
        ctx.textAlign = "left";
        ctx.fillText(t1, x1, y);
        ctx.fillText(t2, x2, y);
        ctx.textAlign = "right";
        ctx.fillText(t3, x3, y);
        //console.log("t2:",t2);
        //console.log("t3:",t3);
    }
    // Función para generar una calificación de 0 a 100 dada una nota
    // que puede tener un rango infinito, por eso solo se indica la
    // la nota para pasar, que prácticamente es 63% de la nota máxima
    obtieneNotaMoodle(minimoParaPasar, notaMin, notaMax) {
        const rango = notaMax - notaMin;
        return (rango * (1 - Math.exp(-(this.totalPoints / minimoParaPasar))) + notaMin).toFixed(2);
    }
}