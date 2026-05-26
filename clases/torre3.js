class Torre3 extends Torre {
  constructor(x, y, juego, tipo) {
    super(x, y, juego, tipo);
    this.inicializarSpritesDeTorre3(1);
    this.ajustarLineaDisparo();
  }

  inicializarSpritesDeTorre3(escala = 1) {
    this.spriteBase = new PIXI.Sprite(this.juego.texturas[`torre3_base`]);
    this.spriteTapa = new PIXI.Sprite(this.juego.texturas[`torre3_tapa`]);
    this.spriteBase.anchor.set(0.5, 1);
    this.spriteTapa.anchor.set(0.5, 1);

    this.container.addChild(this.spriteBase);

    this.spritesAnimadosPoli = {};
    this.listaDeSpritesPoli = [];
    this.spritesPoliActual = null;
    this.accionPoliActual = null;
    this.direccionPoliActual = "down";

    this.cargarSpritesDelPoli(escala);

    this.container.addChild(this.spriteTapa);

    this.sprite = this.spriteBase;

    this.cambiarAnimacionPoli("idle", "down");
  }

  cargarSpritesDelPoli(escala = 1) {
    const animations = this.juego.assetPoli.animations ?? {};
    const direcciones = ["up", "down", "left", "right"];

    const configAcciones = [
      { accion: "idle",          loop: true,  animationSpeed: 0.12 },
      { accion: "sacar_arma",    loop: false, animationSpeed: 0.12 },
      { accion: "disparando",    loop: true,  animationSpeed: 0.12 },
      { accion: "guardando_arma",loop: false, animationSpeed: 0.12 },
    ];

    for (const { accion, loop, animationSpeed } of configAcciones) {
      this.spritesAnimadosPoli[accion] = {};

      for (const dir of direcciones) {
        const key = `${accion}_${dir}`;
        const frames = animations[key];

        if (!frames) {
          console.warn(`Torre3: no encontré la animación "${key}" en poli.json`);
          continue;
        }

        const spr = new PIXI.AnimatedSprite(frames);
        spr.label = `poli_${key}`;
        spr.visible = false;
        spr.loop = loop;
        spr.animationSpeed = animationSpeed;
        spr.scale.set(escala);
        spr.anchor.set(0.5, 1);
        spr.y = -135;

        if (accion === "sacar_arma") {
          spr.onComplete = () => {
            this.cambiarAnimacionPoli("disparando", this.direccionPoliActual);
          };
        }

        if (accion === "guardando_arma") {
          spr.onComplete = () => {
            this.cambiarAnimacionPoli("idle", this.direccionPoliActual);
          };
        }

        spr.play();

        this.listaDeSpritesPoli.push(spr);
        this.container.addChild(spr);
        this.spritesAnimadosPoli[accion][dir] = spr;
      }
    }
  }

  cambiarAnimacionPoli(accion, dir = this.direccionPoliActual) {
    const spr =
      this.spritesAnimadosPoli[accion]?.[dir] ??
      this.spritesAnimadosPoli[accion]?.down;

    if (!spr) return;
    if (
      this.spritesPoliActual === spr &&
      this.accionPoliActual === accion &&
      this.direccionPoliActual === dir
    ) return;

    for (const s of this.listaDeSpritesPoli) s.visible = false;
    spr.visible = true;

    if (this.spritesPoliActual !== spr) {
      spr.gotoAndPlay(0);
    }

    this.spritesPoliActual = spr;
    this.accionPoliActual = accion;
    this.direccionPoliActual = dir;
  }

  obtenerDireccionLPC(dx, dy) {
    if (Math.abs(dy) > Math.abs(dx)) {
      return dy > 0 ? "down" : "up";
    }
    return dx > 0 ? "right" : "left";
  }

  update() {
    this.tiempoDesdeUltimoDisparo += this.juego.deltaTime;

    this.enemigosCerca = this.juego.getEnemigosCerca(
      this.posicion.x,
      this.posicion.y,
      this.radioDeVision,
    );

    if (this.enemigosCerca.length === 0) {
      // Si estaba disparando, guardar el arma; si ya estaba guardando, no interrumpir
      if (this.accionPoliActual === "disparando") {
        this.cambiarAnimacionPoli("guardando_arma", this.direccionPoliActual);
      } else if (this.accionPoliActual !== "guardando_arma" && this.accionPoliActual !== "idle") {
        this.cambiarAnimacionPoli("idle", this.direccionPoliActual);
      }
      return;
    }

    const enemigoCercano = this.enemigosCerca[0];
    const dx = enemigoCercano.posicion.x - this.posicion.x;
    const dy = enemigoCercano.posicion.y - this.posicion.y;
    const dirLPC = this.obtenerDireccionLPC(dx, dy);

    // Iniciar la secuencia solo si estamos en idle
    if (this.accionPoliActual === "idle") {
      this.cambiarAnimacionPoli("sacar_arma", dirLPC);
      return;
    }

    // Actualizar dirección si estamos disparando
    if (this.accionPoliActual === "disparando") {
      this.cambiarAnimacionPoli("disparando", dirLPC);
    }

    if (this.tiempoDesdeUltimoDisparo < this.cooldown) return;

    this.dispararA(enemigoCercano);
    this.tiempoDesdeUltimoDisparo = 0;

    super.update();
  }
}
