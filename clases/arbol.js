class Arbol extends GameObject {
  constructor(x, y, juego) {
    super(x, y, juego);
    juego.arboles.push(this);
    this.tipo = Math.floor(Math.random() * 4) + 1;
    this.inicializarSprite(juego.texturas["arbol" + this.tipo]);
    this.ponerSombra();
  }
  ponerSombra() {
    this.crearSombra(200);
    this.sombra.anchor.set(0.5, 0.8);
    // this.sombra.alpha = 0.3;
  }

  inicializarSprite(textura) {
    this.textura = textura;
    this.sprite = new PIXI.Sprite(this.textura);
    this.configurarOrigen(this.sprite);
    this.sprite.scale.set(1.3 + Math.random() * 0.5);
    this.sprite.scale.x *= Math.random() > 0.5 ? 1 : -1;

    this.container.addChild(this.sprite);
    this.juego.agregarGameObject(this);

    this.render();
  }
}
