class EnemigoNormal extends Enemigo {
  constructor(x, y, juego, opciones = {}) {
    super(x, y, juego, {
      ...opciones,
      dataJson: juego.assetEnemigo,
      arquetipo: "base",
    });
  }
}
