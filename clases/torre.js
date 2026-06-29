class Torre extends Estructura {
  constructor(x, y, juego, tipo = 1) {
    super(x, y, juego);
    this.radio = 40;
    this.radioDeVision = 400;

    this.tipo = "torre";
    this.tipoDeTorre = tipo;
    this.cooldown = 100;
    this.tiempoDesdeUltimoDisparo = this.cooldown;
    this.offsetSalidaBala = { x: 0, y: -50 };
    this.dañoPorDisparo = 0.05;

    this.rangeCircle = this.crearCirculoDeRango(this.radioDeVision);
    this.rangeCircle.visible = juego.debugMode;
    this.container.addChild(this.rangeCircle);

    // this.cargarSpritesTorre(juego.assetTorre1);
    // this.cambiarAnimacion("s");

    this.lineaDisparo = new PIXI.Sprite(juego.texturas.fireline);
    this.lineaDisparo.anchor.set(0.5, 0.5);
    this.lineaDisparo.x = this.offsetSalidaBala.x;
    this.lineaDisparo.y = this.offsetSalidaBala.y;
    this.lineaDisparo.visible = false;
    this._escalaLineaDisparoX = 1;
    this._flipLineaDisparo = false;
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
      this.inicializarBarraDeVida();
    }
    this.posicionarOrigenLineaDisparo();
  }

  posicionarOrigenLineaDisparo() {
    this.lineaDisparo.x = this.offsetSalidaBala.x;
    this.lineaDisparo.y = this.offsetSalidaBala.y;
  }

  aplicarTransformacionLineaDisparo() {
    const tex = this.lineaDisparo.texture;
    const flip = this._flipLineaDisparo ? -1 : 1;
    this.lineaDisparo.scale.set(
      flip * this._escalaLineaDisparoX,
      4 / tex.height,
    );
  }

  actualizarLineaDisparoVisible() {
    if (!this.lineaDisparo.visible) return;

    const D = this._distLineaDisparo;
    const tex = this.lineaDisparo.texture;
    const longitud = D * (0.5 + Math.random() * 0.5);
    const offsetMax = Math.min(longitud * 0.5, Math.max(0, D - longitud));
    const offset = Math.random() * offsetMax;
    const desdeDisparador = Math.random() < 0.5;
    const inicio = desdeDisparador ? offset : D - offset - longitud;
    const centro = inicio + longitud * 0.5;

    this._escalaLineaDisparoX = longitud / tex.width;
    this._flipLineaDisparo = Math.random() < 0.5;

    const ox = this.offsetSalidaBala.x;
    const oy = this.offsetSalidaBala.y;
    const a = this._anguloLineaDisparo;
    this.lineaDisparo.rotation = a;
    this.lineaDisparo.x = ox + Math.cos(a) * centro;
    this.lineaDisparo.y = oy + Math.sin(a) * centro;

    this.aplicarTransformacionLineaDisparo();
  }

  getPosicionSalidaBala() {
    return {
      x: this.posicion.x + this.offsetSalidaBala.x,
      y: this.posicion.y + this.offsetSalidaBala.y,
    };
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

    this.actualizarLineaDisparoVisible();

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

    this.juego.gestorDeAudio.reproducirEfecto("disparo", {
      volumen: 0.1,
      speed: Math.random() * 0.6 + 0.7,
    });

    // this.juego.emitirBala(this, enemigo.posicion.x, enemigo.posicion.y);

    if (typeof enemigo.recibirDaño === "function" && !enemigo._muerto) {
      enemigo.recibirDaño(this.dañoPorDisparo);
    }

    const salida = this.getPosicionSalidaBala();
    const dx = enemigo.posicion.x - salida.x;
    const dy = enemigo.posicion.y - salida.y;
    this._distLineaDisparo = Math.hypot(dx, dy);
    this._anguloLineaDisparo = Math.atan2(dy, dx);
    this.lineaDisparo.visible = true;
    this.actualizarLineaDisparoVisible();

    // if (this.sprite) this.sprite.tint = 0xaa0000;
    setTimeout(() => {
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
