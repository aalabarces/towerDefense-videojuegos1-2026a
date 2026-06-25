const MUNDO_ANCHO = 3500;
const MUNDO_ALTO = 2024;
const ANCHO_CELDA = 100;
const CAMARA_VELOCIDAD = 20;
const ZOOM_MAX = 2.0;
const ZOOM_FACTOR = 0.001;
const BASE_FRAME_MS = 1000 / 60;
const DELTA_TIME_MAX_MS = 1000;
const CLASES_DE_TORRE = [Torre1, Torre2, Torre3];

/** Equivale a background-size: cover: el mundo tapa siempre el viewport (sin bandas por ratio). */
function zoomMinimoCover() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return Math.max(vw / MUNDO_ANCHO, vh / MUNDO_ALTO);
}

class Juego {
  constructor(opciones = {}) {
    this.opciones = opciones;

    this.grilla = new Grilla(MUNDO_ANCHO, MUNDO_ALTO, ANCHO_CELDA, this);
    this.colorDeFondo = opciones.background ?? "#ffff00";

    this.app = null;
    this.containerPrincipal = null;
    this.ui = null;
    this.assetsCivil = null;
    this.assetsSplat = null;
    this.texturas = {};
    this.ultimoFrameRenderizado = performance.now();

    //un array para cada tipo de gameObject
    this.gameObjects = [];
    this.enemigos = [];
    this.torres = [];
    this.piedras = [];
    this.centrosUrbanos = [];
    this.personas = [];
    this.casitas = [];
    this.balas = [];

    this.pixiInicializado = false;
    this.input = new Input(this);

    this.deltaTimeRatio = 1;
    this.fps = 60;
    this.deltaTime = 1 / 60;
    this.numeroDeFrame = 0;
    this.pausado = false;
    this.usuario = new Usuario();
    this.debugMode = false;
    this.estamosArrastrandoUnItemPAraPonerlo = null;

    this.gestorDeAudio = new GestorDeAudio(this);

    this.clasesDeTorre = [];
    CLASES_DE_TORRE.forEach((clase, index) => {
      this.clasesDeTorre[index + 1] = clase;
    });
  }

  sumarPlata(cuanto) {
    this.usuario.sumarPlata(cuanto);
  }

  /**
   * Arranca Pixi, el mundo, la UI y el bucle. No hace nada si ya se inicializó.
   */
  async init() {
    if (this.pixiInicializado) {
      console.log("no podes arrancar pixi de nuevo");
      return;
    }

    await this.inicializarAplicacionPixi();
    this.configurarOrdenamientoDelStage();
    this.registrarAppGlobalParaDepuracion();
    this.agregarCanvasEnBody();

    await this.cargarAssets();

    this.crearContainerPrincipal();
    // this.agregarFondoDelMundo();
    // this.spawnCentroUrbano();
    this.nivel = new Nivel(this);

    this.crearInterfazUsuario();
    this.registrarEventosDeEntrada();
    this.pixiInicializado = true;
  }

  /**
   * Arranca el bucle de juego. Debe llamarse desde el menú principal
   * una vez que el jugador hace clic en "Jugar", después de que todos
   * los assets ya hayan sido cargados por init().
   */
  comenzarJuego() {
    this.iniciarBucleDeJuego();
  }

  /**
   * Opciones pasadas a PIXI.Application.init (tamaño, rendimiento, resize).
   */
  obtenerOpcionesDeInicializacionPixi() {
    return {
      background: this.colorDeFondo,
      width: window.innerWidth,
      height: window.innerHeight,
      pixelArt: true,
      resolution: 1,
      autoDensity: true,
      powerPreference: "high-performance",
      backgroundAlpha: 0,
      antialias: false,
      resizeTo: window,
      backgroundColor: 0x1099bb,
    };
  }

  /**
   * Crea la aplicación Pixi y la inicializa con las opciones del juego.
   */
  async inicializarAplicacionPixi() {
    this.app = new PIXI.Application();
    await this.app.init(this.obtenerOpcionesDeInicializacionPixi());
  }

  /**
   * Permite ordenar hijos del stage por zIndex.
   */
  configurarOrdenamientoDelStage() {
    this.app.stage.sortableChildren = true;
  }

  /**
   * Expone la app en window para inspección en consola / herramientas.
   */
  registrarAppGlobalParaDepuracion() {
    window.__PIXI_APP__ = this.app;
  }

  /**
   * Inserta el canvas en el DOM y evita scroll/márgenes por defecto del body.
   */
  agregarCanvasEnBody() {
    document.body.appendChild(this.app.canvas);
    document.body.style.margin = "0px";
    document.body.style.overflow = "hidden";
  }

  /**
   * Contenedor raíz del mundo: posición inicial centrada y orden por zIndex.
   */
  crearContainerPrincipal() {
    this.containerPrincipal = new PIXI.Container();
    this.containerPrincipal.sortableChildren = true;
    this.containerPrincipal.x = Math.round(
      (window.innerWidth - MUNDO_ANCHO) / 2,
    );
    this.containerPrincipal.y = Math.round(
      (window.innerHeight - MUNDO_ALTO) / 2,
    );
    this.app.stage.addChild(this.containerPrincipal);
  }

  /**
   * Fondo repetido (tiling) que cubre todo el tamaño lógico del mundo.
   */
  agregarFondoDelMundo() {
    const texturaBg = this.texturas["bg"];
    const fondo = new PIXI.Sprite({
      texture: texturaBg,
      width: MUNDO_ANCHO,
      height: MUNDO_ALTO,
    });
    fondo.zIndex = -1;
    this.containerPrincipal.addChild(fondo);
  }

  /**
   * Instancia la capa de UI del juego (HUD, colocación, etc.).
   */
  crearInterfazUsuario() {
    // this.ui = new UI(this);
    this.ui = new UIHTML(this);
    // this.ui.container.zIndex = 10000;
  }

  /**
   * Resize, mouse, teclado, rueda, foco y visibilidad de la pestaña.
   */
  registrarEventosDeEntrada() {
    this.gameloop = this.gameloop.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onContextMenu = this.onContextMenu.bind(this);
    this.onWheel = this.onWheel.bind(this);

    this.onVisibilityChange = this.onVisibilityChange.bind(this);
    this.onWindowBlur = this.onWindowBlur.bind(this);
    this.onWindowFocus = this.onWindowFocus.bind(this);

    window.addEventListener("resize", this.onResize);
    window.addEventListener("click", this.onClick);
    window.addEventListener("contextmenu", this.onContextMenu);
    window.addEventListener("wheel", this.onWheel, { passive: false });

    // document.addEventListener("visibilitychange", this.onVisibilityChange);
    // window.addEventListener("blur", this.onWindowBlur);
    // window.addEventListener("focus", this.onWindowFocus);
  }

  /**
   * Registra y arranca el game loop en el ticker de Pixi.
   */
  iniciarBucleDeJuego() {
    // this.app.ticker.remove(this.gameloop);
    // this.app.ticker.add(this.gameloop);
    // this.app.ticker.start();
    this.ultimoFrameRenderizado = performance.now();
    this.gameloop();
  }

  /**
   * Spritesheets y texturas usadas por entidades y escenario.
   */
  async cargarAssets() {
    await this.gestorDeAudio.inicializar();

    this.assetEnemigo = await PIXI.Assets.load({
      src: "assets/enemigo.json",
      data: { cachePrefix: "enemigo_" },
    });
    this.assetEnemigoDuro = await PIXI.Assets.load({
      src: "assets/enemigoDuro.json",
      data: { cachePrefix: "enemigoDuro_" },
    });
    this.assetEnemigoRapido = await PIXI.Assets.load({
      src: "assets/enemigoRapido.json",
      data: { cachePrefix: "enemigoRapido_" },
    });
    this.assetEnemigoFuerte = await PIXI.Assets.load({
      src: "assets/enemigoFuerte.json",
      data: { cachePrefix: "enemigoFuerte_" },
    });

    this.assetsSplat = await PIXI.Assets.load("assets/splat/splat.json");
    this.assetExplosion = await PIXI.Assets.load(
      "assets/explosion/explosions.json",
    );

    this.assetTorre1 = await PIXI.Assets.load({
      src: "assets/torre_ss/torre1.json",
      data: { cachePrefix: "torre1_" },
    });

    this.assetPoli = await PIXI.Assets.load({
      src: "assets/poli.json",
      data: { cachePrefix: "poli_" },
    });

    this.assetTorre2 = await PIXI.Assets.load({
      src: "assets/torre2_ss/torre2.json",
      data: { cachePrefix: "torre2_" },
    });

    const imagenes = {
      centroUrbano: "assets/centroUrbano.png",
      torre1: "assets/torre1.png",
      torre2: "assets/torre2.png",
      torre3: "assets/torre3.png",
      torre4: "assets/torre4.png",
      torre5: "assets/torre5.png",
      rock1: "assets/rock1.png",
      rock2: "assets/rock2.png",
      rock3: "assets/rock3.png",
      rock4: "assets/rock4.png",
      torre3_base: "assets/torre3/base.png",
      torre3_tapa: "assets/torre3/tapa.png",
      bg: "assets/fondo.jpg",
      sombra: "assets/sombra.png",
    };

    const entradas = Object.entries(imagenes);

    await Promise.all(
      entradas.map(async ([nombre, ruta]) => {
        const textura = await PIXI.Assets.load(ruta);
        this.texturas[nombre] = textura;
      }),
    );
  }

  agregarGameObject(gameObject) {
    this.containerPrincipal.addChild(gameObject.container);
    gameObject.render();

    return gameObject;
  }

  spawnEnemigo(x, y, opciones = {}) {
    const tipo = opciones.tipo ?? "base";
    const ClasePorTipo = {
      base: EnemigoNormal,
      rapido: EnemigoRapido,
      duro: EnemigoDuro,
      fuerte: EnemigoFuerte,
    };
    const Clase = ClasePorTipo[tipo] ?? EnemigoNormal;
    const enemigo = new Clase(x, y, this, opciones);
    return this.agregarGameObject(enemigo);
  }

  emitirBala(quienDispara, x, y) {
    const bala = new Bala(x, y, this, quienDispara);
    this.agregarGameObject(bala);
  }
  spawnCentroUrbano(x, y) {
    this.centroUrbano = new CentroUrbano(x, y, this);
    return this.agregarGameObject(this.centroUrbano);
  }

  spawnTorre(x, y, tipo = 1) {
    let clase = Torre1;
    if (tipo == 1) clase = Torre1;
    else if (tipo == 2) clase = Torre2;
    else if (tipo == 3) clase = Torre3;

    const torre = new clase(x, y, this, tipo);
    this.usuario.plata -= precioCompra("torre", tipo);

    return this.agregarGameObject(torre);
  }

  spawnPiedra(x, y, tipo = 1) {
    const piedra = new Piedra(x, y, this, tipo);
    this.usuario.plata -= precioCompra("piedra", tipo);
    return this.agregarGameObject(piedra);
  }

  quitarFantasma() {
    if (!this.arrastrandoFantasma) return;
    if (this.arrastrandoFantasma.esPreview) {
      this.arrastrandoFantasma.sacameDeLosArrays();
      this.containerPrincipal.removeChild(this.arrastrandoFantasma.container);
      this.arrastrandoFantasma.container.destroy();
    } else if (this.arrastrandoFantasma.sprite) {
      this.containerPrincipal.removeChild(this.arrastrandoFantasma.sprite);
      this.arrastrandoFantasma.sprite.destroy();
    }
    this.arrastrandoFantasma = null;
  }

  onClick(event) {
    // console.log("on click", event);
    if (this.arrastrandoFantasma) {
      if (this.arrastrandoFantasma.esPreview) {
        const torre = this.arrastrandoFantasma;
        torre.esPreview = false;
        torre.container.alpha = 1.0;
        if (torre.rangeCircle) {
          torre.rangeCircle.visible = this.debugMode;
        }
        this.usuario.plata -= precioCompra("torre", torre.tipoDeTorre);
        this.arrastrandoFantasma = null;
      } else if (
        this.arrastrandoFantasma.dataBoton &&
        this.arrastrandoFantasma.dataBoton.tipo == "piedra"
      ) {
        this.spawnPiedra(
          this.input.mouse.x,
          this.input.mouse.y,
          this.arrastrandoFantasma.dataBoton.id,
        );
        this.quitarFantasma();
      }
    }
  }

  onWheel(event) {
    event.preventDefault();
    if (!this.containerPrincipal) return;

    const zoom = this.containerPrincipal.scale.x;
    const zoomMin = zoomMinimoCover();
    const nuevoZoom = Math.min(
      ZOOM_MAX,
      Math.max(zoomMin, zoom - event.deltaY * ZOOM_FACTOR * zoom),
    );

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const mundoX = (mouseX - this.containerPrincipal.x) / zoom;
    const mundoY = (mouseY - this.containerPrincipal.y) / zoom;

    this.containerPrincipal.scale.set(nuevoZoom);
    this.containerPrincipal.x = mouseX - mundoX * nuevoZoom;
    this.containerPrincipal.y = mouseY - mundoY * nuevoZoom;
    this.clampCamaraAlMundo();
  }

  onContextMenu(event) {
    event.preventDefault();
    // if (this.ui?.fantasma) {
    //   this.ui.cancelarColocacion();
    //   return;
    // }
  }

  pausa() {
    this.pausado = true;
    // this.app?.ticker?.stop();
    // PIXI.Ticker.shared.stop();
    console.log("pausando juego");
  }

  reanudar() {
    if (!this.pausado) return;
    console.log("reanudando juego");
    this.pausado = false;
    // this.app?.ticker?.start();
    // PIXI.Ticker.shared.start();
    // this.gameloop();
  }

  gameOver() {
    this.pausa();
    this.ui.mostrarGameOver();
  }

  onVisibilityChange() {
    if (document.hidden) {
      this.pausa();
    } else {
      this.reanudar();
    }
  }

  onWindowBlur() {
    this.pausa();
  }

  onWindowFocus() {
    this.reanudar();
  }

  onResize() {
    if (!this.app) {
      return;
    }

    this.app.renderer.resize(window.innerWidth, window.innerHeight);
    if (this.containerPrincipal) {
      const zoomMin = zoomMinimoCover();
      if (this.containerPrincipal.scale.x < zoomMin) {
        this.containerPrincipal.scale.set(zoomMin);
      }
    }
    this.clampCamaraAlMundo();
    // this.ui?.posicionarPanel();
  }

  /**
   * Evita que el viewport quede fuera del sprite de fondo (huecos / fondo blanco del DOM).
   * Con zoom >= zoomMinimoCover() el escenario llena el viewport como background-size: cover.
   */
  clampCamaraAlMundo() {
    if (!this.containerPrincipal) return;
    const zoom = this.containerPrincipal.scale.x;
    const anchoEscalado = MUNDO_ANCHO * zoom;
    const altoEscalado = MUNDO_ALTO * zoom;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (anchoEscalado <= vw) {
      this.containerPrincipal.x = Math.round((vw - anchoEscalado) / 2);
    } else {
      this.containerPrincipal.x = Math.min(
        0,
        Math.max(vw - anchoEscalado, this.containerPrincipal.x),
      );
    }

    if (altoEscalado <= vh) {
      this.containerPrincipal.y = Math.round((vh - altoEscalado) / 2);
    } else {
      this.containerPrincipal.y = Math.min(
        0,
        Math.max(vh - altoEscalado, this.containerPrincipal.y),
      );
    }
  }

  moverCamara() {
    if (!this.containerPrincipal) return;
    const desplazamiento = CAMARA_VELOCIDAD * this.deltaTimeRatio;

    if (this.input.estaApretada("a") || this.input.estaApretada("arrowleft")) {
      this.containerPrincipal.x += desplazamiento;
    }
    if (this.input.estaApretada("d") || this.input.estaApretada("arrowright")) {
      this.containerPrincipal.x -= desplazamiento;
    }
    if (this.input.estaApretada("w") || this.input.estaApretada("arrowup")) {
      this.containerPrincipal.y += desplazamiento;
    }
    if (this.input.estaApretada("s") || this.input.estaApretada("arrowdown")) {
      this.containerPrincipal.y -= desplazamiento;
    }

    this.clampCamaraAlMundo();
  }

  gameloop() {
    if (this.pausado) return;

    this.grilla.resetear();

    this.moverCamara();
    for (let gameObject of this.gameObjects) {
      gameObject.update();
    }
    this.nivel.update();
    this.input.update();
    this.ui.update();
    this.actualizarDeltaTime();

    requestAnimationFrame(this.gameloop);
  }

  actualizarDeltaTime() {
    this.numeroDeFrame++;
    this.deltaTime = performance.now() - this.ultimoFrameRenderizado;
    this.fps = 1000 / this.deltaTime;
    this.deltaTimeRatio = this.deltaTime / 16.666666666666667;
    this.ultimoFrameRenderizado = performance.now();
  }

  toggleDebug() {
    this.debugMode = !this.debugMode;
    if (this.nivel) {
      this.nivel.toggleDebug();
    }
    this.actualizarVisualizacionRangos();
  }

  actualizarVisualizacionRangos() {
    for (let torre of this.torres) {
      if (torre.rangeCircle) {
        torre.rangeCircle.visible = this.debugMode;
      }
    }
  }

  getEnemigosCerca(x, y, radio) {
    // return this.enemigos.filter((enemigo) => {
    //   return distancia(x, y, enemigo.posicion.x, enemigo.posicion.y) < radio;
    // });

    let entidadesEnEstas9Celdas = this.grilla.query(x, y, radio);

    let soloEnemigos = entidadesEnEstas9Celdas.filter((entidad) => {
      if (entidad instanceof Enemigo) return true;
    });

    return soloEnemigos;
  }

  getPiedrasCerca(x, y, radio) {
    let entidadesEnEstas9Celdas = this.grilla.query(x, y, radio);

    let soloPiedras = entidadesEnEstas9Celdas.filter((entidad) => {
      if (entidad instanceof Piedra) return true;
    });

    return soloPiedras;
  }

  getTorresCerca(x, y, radio) {
    let entidadesEnEstas9Celdas = this.grilla.query(x, y, radio);

    let soloTorres = entidadesEnEstas9Celdas.filter((entidad) => {
      if (entidad instanceof Torre) return true;
    });

    return soloTorres;
  }

  crearSpriteFantasma(dataDelBoton) {
    // console.log("poner fantasma", dataDelBoton);

    if (dataDelBoton.tipo === "torre") {
      // Elegir clase de torre según el id del botón (1, 2, 3, etc.)
      console.log(this.clasesDeTorre);
      console.log(dataDelBoton.id);
      const clase = this.clasesDeTorre[dataDelBoton.id] || Torre1;

      const torre = new clase(
        this.input.mouse.x,
        this.input.mouse.y,
        this,
        dataDelBoton.id,
      );
      torre.esPreview = true;
      torre.container.alpha = 0.5;

      if (torre.rangeCircle) {
        torre.rangeCircle.visible = true;
      }

      this.arrastrandoFantasma = torre;
      this.agregarGameObject(torre);
    } else {
      const nuevoSpriteArrastrable = new PIXI.Sprite(
        this.texturas[dataDelBoton.nombreTextura],
      );

      nuevoSpriteArrastrable.scale.set(2);
      nuevoSpriteArrastrable.alpha = 0.4;
      nuevoSpriteArrastrable.tint = 0x5555ff;

      nuevoSpriteArrastrable.anchor.set(0.5, 1);

      nuevoSpriteArrastrable.dataBoton = dataDelBoton;

      this.arrastrandoFantasma = {
        sprite: nuevoSpriteArrastrable,
        dataBoton: dataDelBoton,
      };

      this.arrastrandoFantasma.sprite.x = this.input.mouse.x;
      this.arrastrandoFantasma.sprite.y = this.input.mouse.y;

      this.containerPrincipal.addChild(this.arrastrandoFantasma.sprite);
    }
  }

  ponerExplosion(x, y, quienRevento) {
    const spriteAnimado = new PIXI.AnimatedSprite(
      this.assetExplosion.animations.explosion2,
    );

    spriteAnimado.zIndex = y;
    spriteAnimado.label = "explosion1";
    spriteAnimado.visible = true;
    spriteAnimado.loop = false;
    spriteAnimado.animationSpeed = 0.33;
    spriteAnimado.scale.set(1.5);
    spriteAnimado.x = x;
    spriteAnimado.y = y;
    spriteAnimado.anchor.set(0.5, 1);

    spriteAnimado.onComplete = () => {
      this.containerPrincipal.removeChild(spriteAnimado);
      spriteAnimado.destroy();
    };

    this.containerPrincipal.addChild(spriteAnimado);

    spriteAnimado.play();

    const enemigosEnArea = this.getEnemigosCerca(x, y, 100).filter(
      (enemigo) => {
        return enemigo !== quienRevento;
      },
    );

    const torresEnArea = this.getTorresCerca(x, y, 100);
    const nuevoArrayConTodosLosObjetosEnArea = [
      ...enemigosEnArea,
      ...torresEnArea,
      this.centroUrbano,
    ];

    for (let objeto of nuevoArrayConTodosLosObjetosEnArea) {
      if (!objeto?.container || objeto._muerto) continue;

      const cuantoDaño =
        150 / distanciaCuadrada(objeto, { posicion: { x, y } });

      // console.log("cuantoDaño", cuantoDaño);
      objeto.recibirDaño(cuantoDaño);
    }
  }

  guardarPartida() {
    let save = {}
    for (let gameObject of this.gameObjects) {
      save[gameObject.id] = gameObject.serializar();
    }
    localStorage.setItem("juegoSave", JSON.stringify(save));
  }

  cargarPartida() {
    let saveData = JSON.parse(localStorage.getItem("juegoSave"));
    console.log("cargando partida", saveData);
  }

}

window.Juego = Juego;
