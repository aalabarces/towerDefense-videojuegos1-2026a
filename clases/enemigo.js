class Enemigo extends EntidadConSalud {
  constructor(x, y, juego, opciones = { estadoInicial: "walk" }) {
    super(x, y, juego);

    this.id = juego.enemigos.length;
    this.tipo = "enemigo";

    juego.enemigos.push(this);
    this.nombre = generateName();

    this.juego = juego;
    this.dataJson = opciones.dataJson ?? juego.assetsCivil;
    this.distanciaParaLlegar = 150;
    this.rapidezWalk = 1;
    this.rapidezRun = 2;

    this.aceleracionParaCorrer = 0.25;
    this.distanciaParaExplotarElCentroUrbano = 100;
    this.radio = 10;
    this.radioDeVision = 500;
    this.velocidadMaxima = 2;
    this.distanciaParaEscaparmeDeLaPersonaQueMeAsusta = 40;
    this.enemigosCerca = [];
    this.torresCerca = [];
    this.distanciaPersonal = 30; // distancia mínima deseada respecto a otros enemigos
    this.distanciaAlCentroUrbano = 9999999;
    this.mostrarVida = true;
    // this.estado = opciones.estadoInicial ?? "idle";
    this.direccion = opciones.direccionInicial ?? "down";
    // this.ultimoEstadoDeMovimiento = this.estado;

    this.spritesAnimados = {
      idle: {},
      walk: {},
      run: {},
      hurt: {},
      "1h_slash": {},
      spellcast: {},
    };

    this.estatico = false;

    this.friccion = 0.9;
    this.nodoDelCaminoActual = 0;
    this.asignarTarget(this.juego.nivel.nodosDelCamino[0]);

    this.cargarSpritesAnimados(this.dataJson);
    this.spriteSplat = this.crearSpriteSplat(juego.assetsSplat);
    this.cambiarAnimacion("idle", this.direccion);

    this.crearSombra();
    this.crearFSMparaComportamientos();
    this.crearFSMparaAnimacion();

    this.render();
  }

  crearSombra() {
    this.sombra = new PIXI.Sprite(this.juego.texturas.sombra);
    this.sombra.anchor.set(0.5, 0.5);
    this.sombra.scale.set(0.1);
    this.sombra.zIndex = -1;
    this.sombra.alpha = 0.5;
    this.container.addChild(this.sombra);
  }

  asignarTarget(obj) {
    this.objTarget = obj;
    this.targetX = obj.x;
    this.targetY = obj.y;
  }

  resetear() {
    this.desactivar();
    this.nodoDelCaminoActual = 0;
    this.asignarTarget(this.juego.nivel.nodosDelCamino[0]);
    this.cambiarAnimacion(this.estado, this.direccion);
  }

  crearSpriteAnimado(frames, nombre, opciones = {}) {
    const spriteAnimado = super.crearSpriteAnimado(frames, nombre, opciones);

    spriteAnimado.onComplete = () => {
      if (!spriteAnimado.loop) {
        this.cambiarAnimacion("idle", this.direccion);
      }
    };

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

    for (let estado of ["idle", "walk", "run", "1h_slash", "spellcast"]) {
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

  cambiarAnimacion(estado, direccion = this.direccion) {
    const sprite = this.obtenerSpriteSegunEstadoYDireccion(estado, direccion);

    if (!sprite) {
      return;
    }

    if (
      this.sprite === sprite &&
      this.animacionActual === estado &&
      this.direccion === direccion
    ) {
      return;
    }

    this.ocultarTodosLosSprites();
    sprite.visible = true;

    if (this.sprite !== sprite) {
      sprite.gotoAndPlay(0);
    }

    this.sprite = sprite;
    this.animacionActual = estado;
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

  // obtenerEstadoSegunVelocidadLineal() {
  //   if (this.velocidadLineal < 0.01) {
  //     return "idle";
  //   }

  //   const umbralRun = (this.rapidezWalk + this.rapidezRun) / 2;
  //   return this.velocidadLineal >= umbralRun ? "run" : "walk";
  // }

  // sincronizarAnimacionConMovimiento() {
  //   // if (
  //   //   this.estado === EstadosEnemigo.HURT ||
  //   //   this.estado === EstadosEnemigo.MUERTO
  //   // ) {
  //   //   return;
  //   // }

  //   // this.cambiarAnimacion(
  //   //   this.obtenerEstadoSegunVelocidadLineal(),
  //   //   this.direccion,
  //   // );
  // }

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
    const scale = Math.max(cuanto * 10, 0.25);
    this.spriteSplat.scale.set(
      scale * Math.random() * 0.5 + 0.75,
      scale * Math.random() * 0.5 + 0.75,
    );
    this.spriteSplat.gotoAndPlay(0);

    this.juego.estamparSangre(this);
  }

  recibirDaño(cuanto) {
    super.recibirDaño(cuanto);

    this.mostrarSplat(cuanto);
  }

  morir() {
    super.morir();
    this.juego.gestorDeAudio.reproducirEfecto("grunido");
    this.juego.sumarPlata(10);
  }

  render() {
    // if (this.estado === EstadosEnemigo.MUERTO) return;
    if (!this.container) return;

    super.render();
    this.animationFSM.update();

    if (
      this.animationFSM.currentStateName === "caminando" ||
      this.animationFSM.currentStateName === "corriendo"
    ) {
      this.juego.gestorDeAudio.reproducirEfecto("pasos");
    }
  }

  percibirEntorno() {
    this.enemigosCerca = this.juego.getEnemigosCerca(
      this.posicion.x,
      this.posicion.y,
      this.radioDeVision,
    );

    this.torresCerca = this.juego.getTorresCerca(
      this.posicion.x,
      this.posicion.y,
      this.radioDeVision,
    );

    this.torreMasCerca = this.buscarTorreMasCercaOCentroUrbano();

    this.distanciaAlCentroUrbano = distancia(
      this.posicion.x,
      this.posicion.y,
      this.juego.centroUrbano.posicion.x,
      this.juego.centroUrbano.posicion.y,
    );

    this.direccion = this.obtenerDireccionSegunAngulo();
  }

  buscarTorreMasCercaOCentroUrbano() {
    return [...this.torresCerca, this.juego.centroUrbano].sort((a, b) =>
      distanciaCuadrada(this, a) > distanciaCuadrada(this, b) ? 1 : -1,
    )[0];
  }

  update() {
    this.percibirEntorno();

    this.behaviorFSM.update();
    super.update();
  }

  siEstoyCercaDelCentroUrbanoMorir() {
    if (
      this.distanciaAlCentroUrbano < this.distanciaParaExplotarElCentroUrbano
    ) {
      this.inmolarme();
    }
  }

  inmolarme() {
    this.behaviorFSM.setState("aPuntoDeExplotar");
  }

  siEstoyCercaDeUnaTorreMorir() {
    for (let i = 0; i < this.torresCerca.length; i++) {
      const torre = this.torresCerca[i];
      if (
        distanciaCuadrada(this, torre) <
        this.distanciaParaExplotarElCentroUrbano ** 2
      ) {
        this.inmolarme();

        return;
      }
    }
  }
  repelerObstaculos(cuantoMirarAlFuturo = 15) {
    const cuantoMirarAlrededor = 200;

    const miPosFutura = {
      x: this.posicion.x + this.velocidad.x * cuantoMirarAlFuturo,
      y: this.posicion.y + this.velocidad.y * cuantoMirarAlFuturo,
    };

    const piedrasCerca = this.juego.getPiedrasCerca(
      miPosFutura.x,
      miPosFutura.y,
      cuantoMirarAlrededor,
    );

    const torresCerca = this.juego.getTorresCerca(
      miPosFutura.x,
      miPosFutura.y,
      cuantoMirarAlrededor,
    );

    const arbolesCerca = this.juego.getArbolesCerca(
      miPosFutura.x,
      miPosFutura.y,
      cuantoMirarAlrededor,
    );
    const nuevoArrayConTodosLosObstaculosCerca = [
      ...piedrasCerca,
      ...torresCerca,
      ...arbolesCerca,
    ];

    if (nuevoArrayConTodosLosObstaculosCerca.length === 0) return;
    const fuerzaMaxima = 0.8;

    for (let obstaculo of nuevoArrayConTodosLosObstaculosCerca) {
      const dx = miPosFutura.x - obstaculo.posicion.x;
      const dy = miPosFutura.y - obstaculo.posicion.y;
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

  repelerOtrosEnemigosAPuntoDeExplotar() {
    if (!this.enemigosCerca || this.enemigosCerca.length === 0) return;
    const cuantoMirarAlrededor = 300;

    const fuerzaMaxima = 0.8;

    for (let enemigo of this.enemigosCerca) {
      if (enemigo.behaviorFSM.currentStateName !== "aPuntoDeExplotar") continue;
      const dx = this.posicion.x - enemigo.posicion.x;
      const dy = this.posicion.y - enemigo.posicion.y;
      const distancia = Math.hypot(dx, dy);
      if (distancia < 0.0001 || enemigo === this) continue;

      const cercania = Math.max(0, 1 - distancia / cuantoMirarAlrededor);
      const fuerza = fuerzaMaxima * cercania * cercania;
      if (fuerza <= 0) continue;

      this.agregarAceleracion(
        (fuerza * dx) / distancia,
        (fuerza * dy) / distancia,
      );
    }
  }

  // cohesion() {
  //   let promX = 0;
  //   let promY = 0;
  //   //calculamos promedio de posicion de los enemigos q puedo ver:
  //   for (let i = 0; i < this.enemigosCerca.length; i++) {
  //     promX += this.enemigosCerca[i].posicion.x;
  //     promY += this.enemigosCerca[i].posicion.y;
  //   }

  //   if (this.enemigosCerca.length === 0) return;

  //   promX /= this.enemigosCerca.length;
  //   promY /= this.enemigosCerca.length;

  //   // vector desde mi posicion hasta el centro de masa (promX,promY)
  //   const dx = promX - this.posicion.x;
  //   const dy = promY - this.posicion.y;
  //   const dist = Math.sqrt(dx * dx + dy * dy);

  //   if (dist > 0) {
  //     // magnitud de la aceleracion hacia el objetivo
  //     const fuerza = 0.1; // ajustable: mayor -> acelera mas rapido hacia el punto

  //     // normalizamos y aplicamos fuerza
  //     const ax = (dx / dist) * fuerza;
  //     const ay = (dy / dist) * fuerza;

  //     this.agregarAceleracion(ax, ay);
  //   }
  // }

  // alineacion() {
  //   let promX = 0;
  //   let promY = 0;
  //   //calculamos promedio de posicion de los enemigos q puedo ver:
  //   for (let i = 0; i < this.enemigosCerca.length; i++) {
  //     promX += this.enemigosCerca[i].velocidad.x;
  //     promY += this.enemigosCerca[i].velocidad.y;
  //   }

  //   if (this.enemigosCerca.length === 0) return;

  //   promX /= this.enemigosCerca.length;
  //   promY /= this.enemigosCerca.length;

  //   // vector desde mi posicion hasta el centro de masa (promX,promY)
  //   const dx = promX - this.velocidad.x;
  //   const dy = promY - this.velocidad.y;
  //   const dist = Math.sqrt(dx * dx + dy * dy);

  //   if (dist > 0) {
  //     // magnitud de la aceleracion hacia el objetivo
  //     const fuerza = 0.05; // ajustable: mayor -> acelera mas rapido hacia el punto

  //     // normalizamos y aplicamos fuerza
  //     const ax = (dx / dist) * fuerza;
  //     const ay = (dy / dist) * fuerza;

  //     this.agregarAceleracion(ax, ay);
  //   }
  // }

  separacion() {
    if (!this.enemigosCerca || this.enemigosCerca.length === 0) return;

    const fuerzaMax = 0.5; // fuerza máxima de empuje para separarse (ajustable)

    for (let i = 0; i < this.enemigosCerca.length; i++) {
      const otro = this.enemigosCerca[i];
      let dx = otro.posicion.x - this.posicion.x;
      let dy = otro.posicion.y - this.posicion.y;
      let dist = Math.hypot(dx, dy);

      if (dist === 0) continue;

      if (dist < this.distanciaPersonal) {
        const ratio = this.distanciaPersonal / dist;
        const ax = -(dx / dist) * fuerzaMax * ratio;
        const ay = -(dy / dist) * fuerzaMax * ratio;

        this.agregarAceleracion(ax, ay);
      }
    }
  }
  siYaLlegueAlPuntoDelCaminoPAsarAlSiguiente() {
    if (this.distHaciaTarget <= this.distanciaParaLlegar) {
      this.nodoDelCaminoActual++;
      //si ya no hay mas nodos, ir al centro urbano
      const objTarget =
        this.juego.nivel.nodosDelCamino[this.nodoDelCaminoActual] ||
        this.juego.centroUrbano.posicion;

      this.asignarTarget(objTarget);
      // return;
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

    const rapidez = this.aceleracionParaCorrer;
    const vx = dx / this.distHaciaTarget;
    const vy = dy / this.distHaciaTarget;

    this.agregarAceleracion(vx * rapidez, vy * rapidez);

    // this.cambiarAnimacion(
    //   this.obtenerEstadoSegunVelocidadLineal(),
    //   this.direccion,
    // );
  }

  crearFSMparaAnimacion() {
    this.animationFSM = new FSM(this, {
      states: {
        idle: EnemigoIdleAnimationState,
        caminando: EnemigoCaminandoAnimationState,
        corriendo: EnemigoCorriendoAnimationState,
        aPuntoDeExplotar: EnemigoAPuntoDeExplotarAnimationState,
      },
      initialState: "idle",
    });
  }

  crearFSMparaComportamientos() {
    this.behaviorFSM = new FSM(this, {
      states: {
        normal: EnemigoNormalBehaviorState,
        moribundo: EnemigoMoribundoBehaviorState,
        aPuntoDeExplotar: EnemigoAPuntoDeExplotarBehaviorState,
      },
      initialState: "normal",
    });
  }
}
