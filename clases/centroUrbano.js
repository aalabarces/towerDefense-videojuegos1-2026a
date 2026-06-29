class CentroUrbano extends Estructura {
  constructor(x, y, juego) {
    super(x, y, juego);
    this.radio = 80;

    this.tipo = "centroUrbano";
    this.vidaMax = 1;
    this.vida = this.vidaMax;
    this.inicializarSprite(juego.texturas["centroUrbano"]);
  }

  recibirDaño(cuanto) {
    if (this.juego.interrumpirGameloop) return;
    // super.recibirDaño(cuanto);
    const vidaAnterior = this.vida;
    this.vida -= cuanto * 2;
    const dañoReal = vidaAnterior - this.vida;
    // this.juego.ui.actualizarBarraVidaCentroUrbano();
    if (this.vida <= 0) {
      this.juego.gameOver();
    }

    this.actualizarBarraDeVida();

    if (dañoReal > 0) {
      const ySpriteMinimo = this.posicion.y - (this.sprite ? this.sprite.height : 40);
      this.juego.crearTextoDaño(this.posicion.x, ySpriteMinimo, dañoReal);
    }
  }
}

window.CentroUrbano = CentroUrbano;
