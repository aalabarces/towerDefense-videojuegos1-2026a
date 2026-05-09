class EnemigoFuerte extends Enemigo {
  constructor(x, y, juego, opciones = {}) {
    super(x, y, juego, { ...opciones, dataJson: juego.assetEnemigoFuerte });
    this.costo = TIPOS_ENEMIGOS.find((tipo) => tipo.clase === "fuerte").costo;
  }
}
