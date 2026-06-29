class Torre2 extends Torre {
  constructor(x, y, juego, tipo) {
    super(x, y, juego, tipo, juego.config.getTorre(2));
    this.tipoDeTorre = 2;
    this.cargarSpritesTorre(juego.assetTorre2, 1);
    this.cambiarAnimacion("s");
    this.offsetSalidaBala = { x: 0, y: -200 };
    this.offsetsMuzzle = {
      n: { x: 0, y: -222 },
      ne: { x: 58, y: -212 },
      e: { x: 78, y: -182 },
      se: { x: 55, y: -142 },
      s: { x: 0, y: -122 },
      so: { x: -55, y: -142 },
      o: { x: -78, y: -182 },
      no: { x: -62, y: -215 },
    };
    this.ajustarLineaDisparo();
  }
}
