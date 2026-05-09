class EnemigoNormal extends Enemigo {
  constructor(x, y, juego, opciones = {}) {
    super(x, y, juego, { ...opciones, dataJson: juego.assetEnemigo });
    this.costo = TIPOS_ENEMIGOS.find((tipo) => tipo.clase === "base").costo;
  }
}
