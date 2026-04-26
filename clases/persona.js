const EstadosPersona = Object.freeze({
  IDLE: "idle",
  WALK: "walk",
  RUN: "run",
  HURT: "hurt",
  MUERTO: "muerto",
});

class Persona extends GameObject {
  constructor(x, y, juego, opciones = {}) {
    super(x, y, juego);

    juego.personas.push(this);
    this.nombre = generateName();

    this.juego = juego;
    this.dataJson = juego.assetsCivil;
    this.distanciaParaLlegar = 100;
    this.rapidezWalk = 1;
    this.rapidezRun = 3;

    this.aceleracionParaCorrer = 0.25;

    this.vidaMax = opciones.vida ?? 100;
    this.vida = this.vidaMax;
    this.radio = 10;
    this.fuerza = opciones.fuerza ?? 1;
    this.mostrarVida = opciones.mostrarVida ?? true;

    this.estado = opciones.estadoInicial ?? "idle";
    this.direccion = opciones.direccionInicial ?? "down";
    this.ultimoEstadoDeMovimiento = this.estado;

    this.spritesAnimados = {
      idle: {},
      walk: {},
      run: {},
      hurt: {},
      "1h_slash": {},
    };
    this.listaDeSprites = [];
    this.spriteActual = null;

    this.estatico = false;

    this.friccion = 0.9;

    this.cargarSpritesAnimados(this.dataJson);
    this.spriteSplat = this.crearSpriteSplat(juego.assetsSplat);
    this.cambiarAnimacion(this.estado, this.direccion);
    this.inicializarBarraDeVida();
    this.render();
  }

  crearSpriteAnimado(frames, nombre, opciones = {}) {
    const spriteAnimado = new PIXI.AnimatedSprite(frames);

    spriteAnimado.label = nombre;
    spriteAnimado.visible = false;
    spriteAnimado.loop = opciones.loop ?? true;
    spriteAnimado.animationSpeed = opciones.animationSpeed ?? 0.12;
    spriteAnimado.scale.set(opciones.scale ?? 1);
    this.configurarOrigen(spriteAnimado);
    spriteAnimado.play();

    spriteAnimado.onComplete = () => {
      if (!spriteAnimado.loop) {
        this.cambiarAnimacion("idle", this.direccion);
      }
    };

    this.listaDeSprites.push(spriteAnimado);
    this.container.addChild(spriteAnimado);

    return spriteAnimado;
  }

  crearSpriteSplat(data) {
    const frames = data?.animations?.splat;

    if (!frames) {
      console.warn('No encontre la animacion "splat" en splat.json');
      return null;
    }

    const sprite = new PIXI.AnimatedSprite(frames);

    sprite.label = "splat";
    sprite.visible = false;
    sprite.loop = false;
    sprite.alpha = 0.8;

    sprite.animationSpeed = 1;
    sprite.scale.set(1);
    sprite.y = -10;
    sprite.x = -10;
    sprite.anchor.set(0.5, 0.5);
    sprite.zIndex = 10;
    sprite.onComplete = () => {
      sprite.visible = false;
      sprite.stop();
    };

    this.container.addChild(sprite);
    return sprite;
  }

  cargarSpritesAnimados(textureData) {
    const animations = textureData.animations ?? {};
    const direcciones = ["up", "left", "down", "right"];

    for (let estado of ["idle", "walk", "run", "1h_slash"]) {
      for (let direccion of direcciones) {
        const key = `${estado}_${direccion}`;
        const frames = animations[key];

        if (!frames) {
          console.warn(`No encontre la animacion ${key} en civil1.json`);
          continue;
        }

        this.spritesAnimados[estado][direccion] = this.crearSpriteAnimado(
          frames,
          key,
          {
            scale: 1,
            loop: estado !== "1h_slash",
            animationSpeed: estado === "1h_slash" ? 0.25 : 0.12,
          },
        );
      }
    }

    if (!animations.hurt) {
      console.warn('No encontre la animacion "hurt" en civil1.json');
      return;
    }

    const spriteHurt = this.crearSpriteAnimado(animations.hurt, "hurt", {
      animationSpeed: 0.14,
      loop: false,
    });

    for (let direccion of direcciones) {
      this.spritesAnimados.hurt[direccion] = spriteHurt;
    }
  }

  obtenerSpriteSegunEstadoYDireccion(estado, direccion) {
    if (this.spritesAnimados[estado]?.[direccion]) {
      return this.spritesAnimados[estado][direccion];
    }

    if (this.spritesAnimados[estado]?.down) {
      return this.spritesAnimados[estado].down;
    }

    return null;
  }

  ocultarTodosLosSprites() {
    for (let sprite of this.listaDeSprites) {
      sprite.visible = false;
    }
  }

  cambiarAnimacion(estado, direccion = this.direccion) {
    const sprite = this.obtenerSpriteSegunEstadoYDireccion(estado, direccion);

    if (!sprite) {
      return;
    }

    if (
      this.spriteActual === sprite &&
      this.estado === estado &&
      this.direccion === direccion
    ) {
      return;
    }

    this.ocultarTodosLosSprites();
    sprite.visible = true;

    if (this.spriteActual !== sprite) {
      sprite.gotoAndPlay(0);
    }

    this.spriteActual = sprite;
    this.estado = estado;
    this.direccion = direccion;

    if (estado !== "hurt") {
      this.ultimoEstadoDeMovimiento = estado;
    }
  }

  obtenerDireccionSegunAngulo() {
    if (this.angulo > 45 && this.angulo <= 135) {
      return "down";
    }

    if (this.angulo <= -45 && this.angulo > -135) {
      return "up";
    }

    if (this.angulo > 135 || this.angulo <= -135) {
      return "left";
    }

    return "right";
  }

  setEstado(estado) {
    this.cambiarAnimacion(estado, this.direccion);
  }

  obtenerEstadoSegunVelocidadLineal() {
    if (this.velocidadLineal < 0.01) {
      return "idle";
    }

    const umbralRun = (this.rapidezWalk + this.rapidezRun) / 2;
    return this.velocidadLineal >= umbralRun ? "run" : "walk";
  }

  sincronizarAnimacionConMovimiento() {
    if (
      this.estado === EstadosPersona.HURT ||
      this.estado === EstadosPersona.MUERTO
    ) {
      return;
    }

    this.cambiarAnimacion(
      this.obtenerEstadoSegunVelocidadLineal(),
      this.direccion,
    );
  }

  // chequearSiEstoyCercaDelTargetYFrenar() {
  //   if (this.targetX == null || this.targetY == null) {
  //     return;
  //   }

  //   if (
  //     distancia(this.posicion.x, this.posicion.y, this.targetX, this.targetY) <
  //     this.distanciaParaLlegar
  //   ) {
  //     this.asignarVelocidad(0, 0);
  //     this.velocidadLineal = 0;

  //     if (this.estado !== "hurt") {
  //       this.cambiarAnimacion("idle", this.direccion);
  //     }
  //   }
  // }

  mostrarSplat(cuanto) {
    if (!this.spriteSplat) return;
    this.spriteSplat.visible = true;
    this.spriteSplat.rotation = Math.random() * 2;
    this.spriteSplat.y = Math.random() * -20 - 50;
    this.spriteSplat.animationSpeed = Math.random() * 0.66 + 0.5;
    const scale = Math.min(Math.max(cuanto * 10, 0.25), 2);
    this.spriteSplat.scale.set(
      scale * Math.random() * 0.5 + 0.75,
      scale * Math.random() * 0.5 + 0.75,
    );
    this.spriteSplat.gotoAndPlay(0);
  }

  recibirDaño(cuanto) {
    super.recibirDaño(cuanto);
    this.mostrarSplat(cuanto);
  }

  chequearMuerte() {
    if (this.vida > 0) return;
    this.morir();
  }

  morir() {
    this.ocultarTodosLosSprites();
    const spriteHurt = this.obtenerSpriteSegunEstadoYDireccion(
      EstadosPersona.HURT,
      this.direccion,
    );
    if (spriteHurt) {
      spriteHurt.visible = true;
      spriteHurt.gotoAndPlay(0);
      this.spriteActual = spriteHurt;
    }

    this.estado = EstadosPersona.MUERTO;
    this.estatico = true;
    this.radio = 0;
    this.asignarVelocidad(0, 0);
    this.velocidadLineal = 0;
    this.targetX = null;
    this.targetY = null;
    this.barraVidaContainer.visible = false;
    this.sacameDeLosArrays();
  }

  setearTarget(targetX, targetY) {
    this.targetX = targetX;
    this.targetY = targetY;
  }

  render() {
    super.render();
    this.sincronizarAnimacionConMovimiento();
  }

  update() {
    if (this.estado === EstadosPersona.MUERTO) return;

    // this.actualizarVelocidadLinealYAngulo();

    // if (this.velocidadLineal < 0.00001) {
    //   this.asignarVelocidad(0, 0);
    // } else {
    this.direccion = this.obtenerDireccionSegunAngulo();
    // }

    this.repelerObstaculos();

    this.moverHaciaTarget();
    super.update();
  }

  repelerObstaculos() {
    const cuantoMirarAlrededor = 200;
    const piedrasCerca = this.juego.getPiedrasCerca(
      this.posicion.x,
      this.posicion.y,
      cuantoMirarAlrededor,
    );

    if (piedrasCerca.length === 0) return;
    const fuerzaMaxima = 0.8;

    for (let piedra of piedrasCerca) {
      const dx = this.posicion.x - piedra.posicion.x;
      const dy = this.posicion.y - piedra.posicion.y;
      const distancia = Math.hypot(dx, dy);
      if (distancia < 0.0001) continue;

      const cercania = Math.max(0, 1 - distancia / cuantoMirarAlrededor);
      const fuerza = fuerzaMaxima * cercania * cercania;
      if (fuerza <= 0) continue;

      this.agregarAceleracion(
        (fuerza * dx) / distancia,
        (fuerza * dy) / distancia,
      );
    }
  }

  moverHaciaTarget() {
    if (this.targetX == null || this.targetY == null) {
      return;
    }

    // this.chequearSiEstoyCercaDelTargetYFrenar();

    const dx = this.targetX - this.posicion.x;
    const dy = this.targetY - this.posicion.y;
    this.distHaciaTarget = Math.hypot(dx, dy);

    if (this.distHaciaTarget <= this.distanciaParaLlegar) {
      this.asignarVelocidad(0, 0);
      this.velocidadLineal = 0;
      this.cambiarAnimacion("idle", this.direccion);
      this.targetX = null;
      this.targetY = null;
      return;
    }

    const rapidez = this.aceleracionParaCorrer;
    const vx = dx / this.distHaciaTarget;
    const vy = dy / this.distHaciaTarget;

    this.agregarAceleracion(vx * rapidez, vy * rapidez);

    this.direccion = this.obtenerDireccionSegunAngulo();
    this.cambiarAnimacion(
      this.obtenerEstadoSegunVelocidadLineal(),
      this.direccion,
    );
  }
}

window.Persona = Persona;
window.EstadosPersona = EstadosPersona;
