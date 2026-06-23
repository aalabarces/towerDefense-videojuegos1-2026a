class Torre2 extends Torre {
  constructor(x, y, juego, tipo) {
    super(x, y, juego, tipo);
    this.tipoDeTorre = 2;
    this.cooldown = 100;
    this.tiempoDesdeUltimoDisparo = this.cooldown;
    this.cargarSpritesTorre(juego.assetTorre2, 1);
    this.cambiarAnimacion("s");
    this.ajustarLineaDisparo();
  }
}
