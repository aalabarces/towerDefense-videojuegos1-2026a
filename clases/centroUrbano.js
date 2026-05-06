const POSICION_CENTRO_URBANO = { x: 660, y: 2520 };
class CentroUrbano extends Estructura {
  constructor(juego) {
    super(POSICION_CENTRO_URBANO.x, POSICION_CENTRO_URBANO.y, juego);
    this.radio = 120;

    this.tipo = "centroUrbano";
    this.vidaMax = 500;
    this.vida = this.vidaMax;
    this.inicializarSprite(juego.texturas["centroUrbano"]);
  }

  recibirDaño(cuanto) {
    if (this.juego.interrumpirGameloop) return;
    super.recibirDaño(cuanto);
    // this.juego.ui.actualizarBarraVidaCentroUrbano();
    if (this.vida <= 0) {
      this.juego.gameOver();
    }
  }
}

window.CentroUrbano = CentroUrbano;
