class Torre1 extends Torre {
  constructor(x, y, juego, tipo) {
    super(x, y, juego, tipo);
    this.tipoDeTorre = 1;
    this.cooldown = 300;
    this.tiempoDesdeUltimoDisparo = this.cooldown;
    this.cargarSpritesTorre(juego.assetTorre1);
    this.cambiarAnimacion("s");
    this.offsetSalidaBala = { x: 0, y: -200 };
    // this.escalaMuzzle = 0.85;
    this.offsetsMuzzle = {
      n: { x: 0, y: -252 },
      ne: { x: 50, y: -245 },
      e: { x: 68, y: -218 },
      se: { x: 48, y: -182 },
      s: { x: 0, y: -162 },
      so: { x: -48, y: -182 },
      o: { x: -68, y: -218 },
      no: { x: -55, y: -248 },
    };
    this.ajustarLineaDisparo();
  }
}
