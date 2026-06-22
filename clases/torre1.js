class Torre1 extends Torre {
  constructor(x, y, juego, tipo) {
    super(x, y, juego, tipo);
    this.tipoDeTorre = 1;
    this.cooldown = 800;
    this.tiempoDesdeUltimoDisparo = this.cooldown;
    this.cargarSpritesTorre(juego.assetTorre1);
    this.cambiarAnimacion("s");
    this.ajustarLineaDisparo();
  }
}
