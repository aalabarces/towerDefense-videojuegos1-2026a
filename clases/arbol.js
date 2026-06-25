class Arbol extends GameObject {
  constructor(x, y, juego) {
    super(x, y, juego);
    juego.arboles.push(this);
    this.inicializarSprite(juego.texturas.arbol1);
  }

  inicializarSprite(textura) {
    this.textura = textura;
    this.sprite = new PIXI.Sprite(this.textura);
    this.configurarOrigen(this.sprite);
    this.sprite.scale.set(2 + Math.random() * 0.5);
    this.sprite.scale.x *= Math.random() > 0.5 ? 1 : -1;

    this.container.addChild(this.sprite);
    this.juego.agregarGameObject(this);
    this.render();
  }
}
