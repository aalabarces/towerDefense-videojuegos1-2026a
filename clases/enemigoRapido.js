class EnemigoRapido extends Enemigo {
  constructor(x, y, juego, opciones = {}) {
    super(x, y, juego, { ...opciones, dataJson: juego.assetEnemigoRapido });
    this.velocidadMaxima = 30;
    this.aceleracionParaCorrer = 0.5;
    this.costo = TIPOS_ENEMIGOS.find((tipo) => tipo.clase === "rapido").costo;
  }
}
