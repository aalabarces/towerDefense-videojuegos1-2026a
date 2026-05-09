class EnemigoDuro extends Enemigo {
  constructor(x, y, juego, opciones = {}) {
    super(x, y, juego, { ...opciones, dataJson: juego.assetEnemigoDuro });
    this.costo = TIPOS_ENEMIGOS.find((tipo) => tipo.clase === "duro").costo;
    this.vidaMax = 3;
    this.vida = this.vidaMax;
  }
}
