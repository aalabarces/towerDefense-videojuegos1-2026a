const MUNDO_ANCHO = 7000;
const MUNDO_ALTO = 4000;
const CAMARA_VELOCIDAD = 6;
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 2.0;
const ZOOM_FACTOR = 0.001;
const BASE_FRAME_MS = 1000 / 60;
const DELTA_TIME_MAX_MS = 1000;

class Juego {
  constructor(opciones = {}) {
    this.opciones = opciones;
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

    this.pixiInicializado = false;
    this.teclas = {};

    this.deltaTimeRatio = 1;
    this.fps = 60;
    this.deltaTime = 1 / 60;
    this.pausado = false;
    this.interrumpirGameloop = false;

    this.gameloop = this.gameloop.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onContextMenu = this.onContextMenu.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
    this.onWindowBlur = this.onWindowBlur.bind(this);
    this.onWindowFocus = this.onWindowFocus.bind(this);
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
    this.agregarFondoDelMundo();
    this.spawnCentroUrbano(MUNDO_ANCHO / 2, MUNDO_ALTO / 2);

    this.crearInterfazUsuario();
    this.registrarEventosDeEntrada();
    this.pixiInicializado = true;
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
    const fondo = new PIXI.TilingSprite({
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
    this.ui = new UI(this);
    this.ui.container.zIndex = 10000;
  }

  /**
   * Resize, mouse, teclado, rueda, foco y visibilidad de la pestaña.
   */
  registrarEventosDeEntrada() {
    window.addEventListener("resize", this.onResize);
    document.body.addEventListener("click", this.onClick);
    document.body.addEventListener("contextmenu", this.onContextMenu);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("wheel", this.onWheel, { passive: false });
    window.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("visibilitychange", this.onVisibilityChange);
    window.addEventListener("blur", this.onWindowBlur);
    window.addEventListener("focus", this.onWindowFocus);
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
    this.assetsCivil = await PIXI.Assets.load("civil1.json");
    this.assetsSplat = await PIXI.Assets.load("splat/splat.json");

    const imagenes = {
      centroUrbano: "centroUrbano.png",
      torre1: "torre1.png",
      torre2: "torre2.png",
      torre3: "torre3.png",
      torre4: "torre4.png",
      torre5: "torre5.png",
      rock1: "rock1.png",
      rock2: "rock2.png",
      rock3: "rock3.png",
      rock4: "rock4.png",
      bg: "bg.jpg",
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
    const enemigo = new Enemigo(x, y, this, opciones);
    return this.agregarGameObject(enemigo);
  }

  spawnCentroUrbano(x, y) {
    const centroUrbano = new CentroUrbano(x, y, this);
    this.centroUrbano = centroUrbano;
    return this.agregarGameObject(centroUrbano);
  }

  spawnTorre(x, y, tipo = 1) {
    const torre = new Torre(x, y, this, tipo);

    return this.agregarGameObject(torre);
  }

  spawnPiedra(x, y, tipo = 1) {
    const piedra = new Piedra(x, y, this, tipo);

    return this.agregarGameObject(piedra);
  }

  moverEnemigosHacia(x, y) {
    for (let enemigo of this.enemigos) {
      enemigo.setearTarget(x, y);
    }
  }

  onKeyDown(event) {
    this.teclas[event.key.toLowerCase()] = true;
  }

  onKeyUp(event) {
    this.teclas[event.key.toLowerCase()] = false;
  }

  onClick(event) {
    if (this.ui?.ignorarProximoClick) {
      this.ui.ignorarProximoClick = false;
      return;
    }

    const zoom = this.containerPrincipal.scale.x;
    const mundoX = (event.pageX - this.containerPrincipal.x) / zoom;
    const mundoY = (event.pageY - this.containerPrincipal.y) / zoom;

    if (this.ui?.confirmarColocacion(mundoX, mundoY)) return;

    this.moverEnemigosHacia(mundoX, mundoY);
  }

  onWheel(event) {
    event.preventDefault();
    if (!this.containerPrincipal) return;

    const zoom = this.containerPrincipal.scale.x;
    const nuevoZoom = Math.min(
      ZOOM_MAX,
      Math.max(ZOOM_MIN, zoom - event.deltaY * ZOOM_FACTOR * zoom),
    );

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const mundoX = (mouseX - this.containerPrincipal.x) / zoom;
    const mundoY = (mouseY - this.containerPrincipal.y) / zoom;

    this.containerPrincipal.scale.set(nuevoZoom);
    this.containerPrincipal.x = mouseX - mundoX * nuevoZoom;
    this.containerPrincipal.y = mouseY - mundoY * nuevoZoom;
  }

  onContextMenu(event) {
    event.preventDefault();
    if (this.ui?.fantasma) {
      this.ui.cancelarColocacion();
      return;
    }
  }

  onMouseMove(event) {
    if (!this.teclas["1"]) return;

    const zoom = this.containerPrincipal.scale.x;
    const mundoX = (event.clientX - this.containerPrincipal.x) / zoom;
    const mundoY = (event.clientY - this.containerPrincipal.y) / zoom;

    this.spawnEnemigo(mundoX, mundoY);
  }

  pausa() {
    this.pausado = true;
    console.log("pausando juego");
    this.app?.ticker?.stop();
  }

  reanudar() {
    if (this.pausado) {
      console.log("reanudando juego");
      this.pausado = false;
      this.app?.ticker?.start();
    }
  }

  gameOver() {
    this.interrumpirGameloop = true;
    this.pausado = true;
    this.containerPrincipal.visible = false;
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
    this.ui?.posicionarPanel();
  }

  moverCamara() {
    if (!this.containerPrincipal) return;
    const desplazamiento = CAMARA_VELOCIDAD * this.deltaTimeRatio;

    if (this.teclas["a"] || this.teclas["arrowleft"]) {
      this.containerPrincipal.x += desplazamiento;
    }
    if (this.teclas["d"] || this.teclas["arrowright"]) {
      this.containerPrincipal.x -= desplazamiento;
    }
    if (this.teclas["w"] || this.teclas["arrowup"]) {
      this.containerPrincipal.y += desplazamiento;
    }
    if (this.teclas["s"] || this.teclas["arrowdown"]) {
      this.containerPrincipal.y -= desplazamiento;
    }

    const zoom = this.containerPrincipal.scale.x;
    const anchoEscalado = MUNDO_ANCHO * zoom;
    const altoEscalado = MUNDO_ALTO * zoom;

    if (anchoEscalado <= window.innerWidth) {
      this.containerPrincipal.x = Math.round(
        (window.innerWidth - anchoEscalado) / 2,
      );
    } else {
      this.containerPrincipal.x = Math.min(
        0,
        Math.max(window.innerWidth - anchoEscalado, this.containerPrincipal.x),
      );
    }

    if (altoEscalado <= window.innerHeight) {
      this.containerPrincipal.y = Math.round(
        (window.innerHeight - altoEscalado) / 2,
      );
    } else {
      this.containerPrincipal.y = Math.min(
        0,
        Math.max(window.innerHeight - altoEscalado, this.containerPrincipal.y),
      );
    }
  }

  gameloop() {
    // this.actualizarMetricasDeTiempo(deltaTimeMsReal);
    if (this.interrumpirGameloop) return;

    this.moverCamara();

    for (let gameObject of this.gameObjects) {
      gameObject.update();
    }

    this.ui?.actualizarMetricasDeRendimiento();

    this.deltaTime = performance.now() - this.ultimoFrameRenderizado;
    this.fps = 1000 / this.deltaTime;
    this.deltaTimeRatio = this.deltaTime / 16.666666666666667;
    this.ultimoFrameRenderizado = performance.now();

    requestAnimationFrame(this.gameloop);
  }

  getEnemigosCerca(x, y, radio) {
    return this.enemigos.filter((enemigo) => {
      return distancia(x, y, enemigo.posicion.x, enemigo.posicion.y) < radio;
    });
  }

  getPiedrasCerca(x, y, radio) {
    return this.piedras.filter((obstaculo) => {
      return (
        distancia(x, y, obstaculo.posicion.x, obstaculo.posicion.y) < radio
      );
    });
  }
}

window.Juego = Juego;
