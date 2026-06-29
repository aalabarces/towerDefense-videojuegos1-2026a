class EnemigoFuerte extends Enemigo {
  constructor(x, y, juego, opciones = {}) {
    super(x, y, juego, {
      ...opciones,
      dataJson: juego.assetEnemigoFuerte,
      arquetipo: "fuerte",
    });
  }
}
