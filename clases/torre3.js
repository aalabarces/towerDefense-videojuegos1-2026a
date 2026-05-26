class Torre3 extends Torre {
  constructor(x, y, juego, tipo) {
    super(x, y, juego, tipo);
    // this.cargarSpritesTorre(juego.assetTorre1);
    // this.cambiarAnimacion("s");
    this.inicializarSpritesDeTorre3(1);
    this.ajustarLineaDisparo();
  }

  inicializarSpritesDeTorre3(escala = 1) {
    this.spriteBase = new PIXI.Sprite(this.juego.texturas[`torre3_base`]);
    this.spriteTapa = new PIXI.Sprite(this.juego.texturas[`torre3_tapa`]);
    this.spriteBase.anchor.set(0.5, 1);
    this.spriteTapa.anchor.set(0.5, 1);
    this.spriteAnimadoChaboncito = this.crearSpriteAnimadoChaboncito();

    this.container.addChild(this.spriteBase);
    this.container.addChild(this.spriteAnimadoChaboncito);
    this.container.addChild(this.spriteTapa);

    this.sprite = this.spriteBase;
  }

  crearSpriteAnimadoChaboncito() {
    const spriteAnimado = new PIXI.AnimatedSprite(
      this.juego.assetPoli.animations["idle_down"],
    );

    spriteAnimado.label = "torre3_chaboncito";
    spriteAnimado.visible = true;
    spriteAnimado.loop = true;
    spriteAnimado.animationSpeed = 0.12;
    spriteAnimado.y = -135;
    // spriteAnimado.scale.set(1);
    spriteAnimado.anchor.set(0.5, 1);
    spriteAnimado.play();

    return spriteAnimado;
  }
}
