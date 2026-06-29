class CentroUrbano extends Estructura {
  constructor(x, y, juego) {
    super(x, y, juego);

    const stats = juego.config.getCentroUrbano();
    this.radio = stats.radioColision;
    this.tipo = "centroUrbano";
    this.vidaMax = stats.integridadMaxima;
    this.vida = this.vidaMax;
    this.multiplicadorDañoExplosion = stats.multiplicadorDañoExplosion;
    this.mostrarVida = true;

    this.inicializarSprite(juego.texturas["centroUrbano"]);
  }

  recibirDaño(cuanto) {
    if (this.juego.interrumpirGameloop) return;

    const vidaAnterior = this.vida;
    this.vida -= cuanto * this.multiplicadorDañoExplosion;
    const dañoReal = vidaAnterior - this.vida;

    if (this.vida <= 0) {
      this.juego.gameOver();
    }

    this.actualizarBarraDeVida();

    if (dañoReal > 0) {
      const ySpriteMinimo =
        this.posicion.y - (this.sprite ? this.sprite.height : 40);
      this.juego.crearTextoDaño(this.posicion.x, ySpriteMinimo, dañoReal);
    }
  }

  recibirDañoLeak(dañoLeak) {
    if (this.juego.interrumpirGameloop) return;

    const vidaAnterior = this.vida;
    this.vida -= dañoLeak;
    const dañoReal = vidaAnterior - this.vida;

    if (this.vida <= 0) {
      this.juego.gameOver();
    }

    this.actualizarBarraDeVida();

    if (dañoReal > 0) {
      const ySpriteMinimo =
        this.posicion.y - (this.sprite ? this.sprite.height : 40);
      this.juego.crearTextoDaño(this.posicion.x, ySpriteMinimo, dañoReal);
    }
  }
}

window.CentroUrbano = CentroUrbano;
