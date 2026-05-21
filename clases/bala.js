class Bala extends GameObject {
  constructor(x, y, juego, aQuien) {
    super(x, y - 50, juego);

    this.sprite = new PIXI.Sprite(juego.texturas.sombra);
    this.sprite.scale.set(0.05);
    this.container.addChild(this.sprite);

    juego.balas.push(this);

    this.velocidadMaxima = 20;

    this.agregarAceleracion(aQuien.posicion.x - x, aQuien.posicion.y - y);
  }
}
