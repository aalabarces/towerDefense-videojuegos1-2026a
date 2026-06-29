class EnemigoDuro extends Enemigo {
  constructor(x, y, juego, opciones = {}) {
    super(x, y, juego, {
      ...opciones,
      dataJson: juego.assetEnemigoDuro,
      arquetipo: "duro",
    });
  }
}
