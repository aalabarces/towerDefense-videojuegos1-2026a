class EnemigoRapido extends Enemigo {
  constructor(x, y, juego, opciones = {}) {
    super(x, y, juego, {
      ...opciones,
      dataJson: juego.assetEnemigoRapido,
      arquetipo: "rapido",
    });
  }
}
