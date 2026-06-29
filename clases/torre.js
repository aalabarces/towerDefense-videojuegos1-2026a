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
    this.offsetsMuzzle = null;
    this.escalaMuzzle = 1.5;
    this.zIndexMuzzleArriba = -200;
    this.zIndexMuzzleFrente = 500;
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

    this.inicializarMuzzleFlash();

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

  cambiarAnimacion(direccion) {
    super.cambiarAnimacion(direccion);
    this.posicionarMuzzleFlash(direccion);
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
    this.posicionarMuzzleFlash();
  }

  posicionarOrigenLineaDisparo() {
    this.lineaDisparo.x = this.offsetSalidaBala.x;
    this.lineaDisparo.y = this.offsetSalidaBala.y;
  }

  obtenerDireccionDisparo(dx, dy) {
    return this.obtenerDireccion8(dx, dy);
  }

  obtenerDireccionDesdeAngulo(angulo) {
    return this.obtenerDireccion8(Math.cos(angulo), Math.sin(angulo));
  }

  getDireccionMuzzleActual() {
    return this.direccion ?? "s";
  }

  apuntaHaciaArriba(direccion) {
    return direccion === "n" || direccion === "ne" || direccion === "no";
  }

  getOffsetMuzzle(direccion = this.getDireccionMuzzleActual()) {
    return this.offsetsMuzzle?.[direccion] ?? this.offsetSalidaBala;
  }

  getZIndexMuzzle(direccion) {
    return this.apuntaHaciaArriba(direccion)
      ? this.zIndexMuzzleArriba
      : this.zIndexMuzzleFrente;
  }

  indiceCapaMuzzleDetras() {
    if (this.spriteBase) return this.container.getChildIndex(this.spriteBase);
    if (this.sprite) return this.container.getChildIndex(this.sprite);
    return 1;
  }

  aplicarCapaMuzzle(direccion) {
    if (!this.muzzleFlash || !this.container) return;

    this.muzzleFlash.zIndex = this.getZIndexMuzzle(direccion);

    if (this.apuntaHaciaArriba(direccion)) {
      this.container.setChildIndex(
        this.muzzleFlash,
        this.indiceCapaMuzzleDetras(),
      );
    } else {
      this.container.addChild(this.muzzleFlash);
    }
  }

  static crearOffsetsMuzzle8(baseX = 0, baseY = -220, escala = 1) {
    const s = escala;
    return {
      n: { x: baseX, y: baseY },
      ne: { x: baseX + 48 * s, y: baseY + 8 * s },
      e: { x: baseX + 68 * s, y: baseY + 32 * s },
      se: { x: baseX + 48 * s, y: baseY + 68 * s },
      s: { x: baseX, y: baseY + 88 * s },
      so: { x: baseX - 48 * s, y: baseY + 68 * s },
      o: { x: baseX - 68 * s, y: baseY + 32 * s },
      no: { x: baseX - 48 * s, y: baseY + 8 * s },
    };
  }

  inicializarMuzzleFlash() {
    if (!this.juego.framesMuzzle?.length) return;

    this.muzzleFlash = new PIXI.AnimatedSprite(this.juego.framesMuzzle);
    this.muzzleFlash.label = "muzzleFlash";
    this.muzzleFlash.anchor.set(0, 0.5);
    this.muzzleFlash.visible = false;
    this.muzzleFlash.loop = false;
    this.muzzleFlash.animationSpeed = 0.4;
    this.muzzleFlash.scale.set(this.escalaMuzzle);
    this.muzzleFlash.onComplete = () => {
      this.muzzleFlash.visible = false;
    };
    this.muzzleFlash.play();

    this.container.addChild(this.muzzleFlash);
    this.posicionarMuzzleFlash();
  }

  getRotacionMuzzle(direccion) {
    const rotaciones8 = {
      e: 0,
      se: Math.PI / 4,
      s: Math.PI / 2,
      so: (3 * Math.PI) / 4,
      o: Math.PI,
      no: (-3 * Math.PI) / 4,
      n: -Math.PI / 2,
      ne: -Math.PI / 4,
    };
    const rotaciones4 = {
      right: 0,
      down: Math.PI / 2,
      left: Math.PI,
      up: -Math.PI / 2,
    };
    return rotaciones4[direccion] ?? rotaciones8[direccion] ?? 0;
  }

  posicionarMuzzleFlash(direccion = this.getDireccionMuzzleActual()) {
    if (!this.muzzleFlash) return;

    this.muzzleFlash.scale.set(this.escalaMuzzle);
    const off = this.getOffsetMuzzle(direccion);
    this.muzzleFlash.x = off.x;
    this.muzzleFlash.y = off.y;
    this.muzzleFlash.rotation = this.getRotacionMuzzle(direccion);
    this.aplicarCapaMuzzle(direccion);
  }

  activarMuzzleFlash(direccion = this.getDireccionMuzzleActual()) {
    if (!this.muzzleFlash) return;

    this.posicionarMuzzleFlash(direccion);
    this.muzzleFlash.visible = true;
    this.muzzleFlash.gotoAndPlay(0);
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
    this.activarMuzzleFlash(this.getDireccionMuzzleActual());

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
