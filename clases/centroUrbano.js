const POSICION_CENTRO_URBANO = {
  x: 660 * ESCALA_FONDO,
  y: 2520 * ESCALA_FONDO,
};
class CentroUrbano extends Estructura {
  constructor(juego) {
    super(POSICION_CENTRO_URBANO.x, POSICION_CENTRO_URBANO.y, juego);
    this.radio = 80;

    this.tipo = "centroUrbano";
    this.vidaMax = 1;
    this.vida = this.vidaMax;
    this.inicializarSprite(juego.texturas["centroUrbano"]);
  }

  recibirDaño(cuanto) {
    if (this.juego.interrumpirGameloop) return;
    // super.recibirDaño(cuanto);
    this.vida -= cuanto * 2;
    // this.juego.ui.actualizarBarraVidaCentroUrbano();
    if (this.vida <= 0) {
      this.juego.gameOver();
    }

    this.actualizarBarraDeVida();
  }
}

window.CentroUrbano = CentroUrbano;
