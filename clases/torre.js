class Torre extends Estructura {
  constructor(x, y, juego, tipo = 1) {
    super(x, y, juego);
    this.radio = 40;
    this.radioDeVision = 400;

    this.tipo = "torre";
    this.tipoDeTorre = tipo;
    this.cooldown = 100;
    this.tiempoDesdeUltimoDisparo = this.cooldown;

    this.rangeCircle = this.crearCirculoDeRango(this.radioDeVision);
    this.rangeCircle.visible = juego.debugMode;
    this.container.addChild(this.rangeCircle);

    // this.cargarSpritesTorre(juego.assetTorre1);
    // this.cambiarAnimacion("s");

    this.lineaDisparo = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.lineaDisparo.width = 2;
    this.lineaDisparo.anchor.set(0.5, 0);
    this.lineaDisparo.y = 0;
    this.lineaDisparo.visible = false;
    this.container.addChild(this.lineaDisparo);

    juego.torres.push(this);
  }

  cargarSpritesTorre(textureData, scale = 0.75) {
    const animations = textureData.animations ?? {};
    this.spritesAnimados = {};

    for (let dir of ["n", "ne", "e", "se", "s", "so", "o", "no"]) {
      const frames = animations[dir];
      if (!frames) continue;
      this.spritesAnimados[dir] = this.crearSpriteAnimado(frames, dir, {
        scale: scale,
        loop: false,
        animationSpeed: 0,
      });
    }
  }

  crearCirculoDeRango(radio) {
    const rangeCircle = new PIXI.Graphics();
    rangeCircle.beginFill(0xff0000, 0.15);
    rangeCircle.lineStyle(2, 0xff0000, 0.4);
    rangeCircle.drawCircle(0, 0, radio);
    rangeCircle.endFill();
    return rangeCircle;
  }

  ajustarLineaDisparo() {
    if (this.sprite) {
      this.lineaDisparo.y = -this.sprite.height * 0.85;
      this.inicializarBarraDeVida();
    }
  }

  obtenerDireccion8(dx, dy) {
    const angulo = Math.atan2(dy, dx) * (180 / Math.PI);

    if (angulo >= -22.5 && angulo < 22.5) return "e";
    if (angulo >= 22.5 && angulo < 67.5) return "se";
    if (angulo >= 67.5 && angulo < 112.5) return "s";
    if (angulo >= 112.5 && angulo < 157.5) return "so";
    if (angulo >= 157.5 || angulo < -157.5) return "o";
    if (angulo >= -157.5 && angulo < -112.5) return "no";
    if (angulo >= -112.5 && angulo < -67.5) return "n";
    return "ne";
  }

  update() {
    if (this.esPreview) {
      this.render();
      return;
    }
    this.tiempoDesdeUltimoDisparo += this.juego.deltaTime;

    this.enemigosCerca = this.juego.getEnemigosCerca(
      this.posicion.x,
      this.posicion.y,
      this.radioDeVision,
    );

    if (this.enemigosCerca.length === 0) return;

    const enemigoCercano = this.enemigosCerca[0];
    const dx = enemigoCercano.posicion.x - this.posicion.x;
    const dy = enemigoCercano.posicion.y - this.posicion.y;
    this.cambiarAnimacion(this.obtenerDireccion8(dx, dy));

    this.dispararA(enemigoCercano);

    super.update();
  }

  puedeDisparar() {
    return this.tiempoDesdeUltimoDisparo >= this.cooldown;
  }

  dispararA(enemigo) {
    if (!this.puedeDisparar()) return;

    this.tiempoDesdeUltimoDisparo = 0;

    this.juego.gestorDeAudio.reproducirEfecto("disparo");

    const posFuturaDelEnemigo = {
      x: enemigo.posicion.x + enemigo.velocidad.x * 60,
      y: enemigo.posicion.y + enemigo.velocidad.y * 60,
    };

    this.juego.emitirBala(this, posFuturaDelEnemigo.x, posFuturaDelEnemigo.y);

    const dx = posFuturaDelEnemigo.x - this.posicion.x;
    const dy =
      posFuturaDelEnemigo.y - 30 - this.posicion.y - this.lineaDisparo.y;
    this.lineaDisparo.height = Math.hypot(dx, dy);
    this.lineaDisparo.rotation = Math.atan2(-dx, dy);
    this.lineaDisparo.visible = true;

    if (this.sprite) this.sprite.tint = 0xaa0000;
    setTimeout(() => {
      if (!this.sprite) return;
      this.sprite.tint = 0xffffff;
      this.lineaDisparo.visible = false;
    }, 30);
  }

  onMouseOver() {
    console.log("mouse over torre", this.posicion.x, this.posicion.y);
    this.rangeCircle.visible = true;
  }

  onMouseOut() {
    console.log("mouse out torre", this.posicion.x, this.posicion.y);
    this.rangeCircle.visible = false;
  }
}

window.Torre = Torre;
