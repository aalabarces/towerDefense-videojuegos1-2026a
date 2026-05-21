const MUNDO_ANCHO = 7000 * ESCALA_FONDO;
const MUNDO_ALTO = 4048 * ESCALA_FONDO;
const CAMARA_VELOCIDAD = 20;
const ZOOM_MAX = 2.0;
const ZOOM_FACTOR = 0.001;
const BASE_FRAME_MS = 1000 / 60;
const DELTA_TIME_MAX_MS = 1000;

/** Equivale a background-size: cover: el mundo tapa siempre el viewport (sin bandas por ratio). */
function zoomMinimoCover() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return Math.max(vw / MUNDO_ANCHO, vh / MUNDO_ALTO);
}

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
    this.balas = [];

    this.pixiInicializado = false;
    this.teclas = {};

    this.deltaTimeRatio = 1;
    this.fps = 60;
    this.deltaTime = 1 / 60;
    this.numeroDeFrame = 0;
    this.pausado = false;
    // this.interrumpirGameloop = false;
    this.usuario = new Usuario();
    this.estamosArrastrandoUnItemPAraPonerlo = null;

    this.nivel = new Nivel(this);
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
    this.agregarFondoDelMundo();
    this.spawnCentroUrbano();

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
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
    this.onWindowBlur = this.onWindowBlur.bind(this);
    this.onWindowFocus = this.onWindowFocus.bind(this);

    window.addEventListener("resize", this.onResize);
    window.addEventListener("click", this.onClick);
    window.addEventListener("contextmenu", this.onContextMenu);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("wheel", this.onWheel, { passive: false });
    window.addEventListener("mousemove", this.onMouseMove);
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
    this.assetEnemigo = await PIXI.Assets.load("assets/enemigo.json");
    this.assetEnemigoDuro = await PIXI.Assets.load("assets/enemigoDuro.json");
    this.assetEnemigoRapido = await PIXI.Assets.load(
      "assets/enemigoRapido.json",
    );
    this.assetEnemigoFuerte = await PIXI.Assets.load(
      "assets/enemigoFuerte.json",
    );

    this.assetsSplat = await PIXI.Assets.load("assets/splat/splat.json");
    this.assetExplosion = await PIXI.Assets.load(
      "assets/explosion/explosions.json",
    );

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

  emitirBala(quienDispara, aQuien) {
    const bala = new Bala(
      quienDispara.posicion.x,
      quienDispara.posicion.y,
      this,
      aQuien,
    );
    this.agregarGameObject(bala);
  }
  spawnCentroUrbano(x, y) {
    this.centroUrbano = new CentroUrbano(this);
    return this.agregarGameObject(this.centroUrbano);
  }

  spawnTorre(x, y, tipo = 1) {
    const torre = new Torre(x, y, this, tipo);
    this.usuario.plata -= precioCompra("torre", tipo);

    return this.agregarGameObject(torre);
  }

  spawnPiedra(x, y, tipo = 1) {
    const piedra = new Piedra(x, y, this, tipo);
    this.usuario.plata -= precioCompra("piedra", tipo);
    return this.agregarGameObject(piedra);
  }

  // moverEnemigosHacia(x, y) {
  //   for (let enemigo of this.enemigos) {
  //     enemigo.setearTarget(x, y);
  //   }
  // }

  onKeyDown(event) {
    this.teclas[event.key.toLowerCase()] = true;
  }

  onKeyUp(event) {
    this.teclas[event.key.toLowerCase()] = false;
  }

  quitarFantasma() {
    if (!this.arrastrandoFantasma || !this.arrastrandoFantasma?.sprite) return;
    this.containerPrincipal.removeChild(this.arrastrandoFantasma.sprite);
    this.arrastrandoFantasma.sprite.destroy();
    this.arrastrandoFantasma = null;
  }

  onClick(event) {
    // console.log("on click", event);
    if (this.arrastrandoFantasma) {
      if (this.arrastrandoFantasma.dataBoton.tipo == "torre") {
        this.spawnTorre(
          this.mouse.x,
          this.mouse.y,
          this.arrastrandoFantasma.dataBoton.id,
        );
      } else if (this.arrastrandoFantasma.dataBoton.tipo == "piedra") {
        this.spawnPiedra(
          this.mouse.x,
          this.mouse.y,
          this.arrastrandoFantasma.dataBoton.id,
        );
      }
      this.quitarFantasma();
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
    this.app?.ticker?.stop();
    PIXI.Ticker.shared.stop();
    console.log("pausando juego");
  }

  reanudar() {
    if (!this.pausado) return;
    console.log("reanudando juego");
    this.pausado = false;
    this.app?.ticker?.start();
    PIXI.Ticker.shared.start();
    this.gameloop();
  }

  gameOver() {
    // this.interrumpirGameloop = true;
    this.pausa();
    // this.containerPrincipal.visible = false;
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

    this.clampCamaraAlMundo();
  }

  gameloop() {
    // this.actualizarMetricasDeTiempo(deltaTimeMsReal);
    if (this.pausado) return;

    this.moverCamara();

    for (let gameObject of this.gameObjects) {
      gameObject.update();
    }

    // this.ui?.actualizarMetricasDeRendimiento();
    this.nivel.update();
    this.numeroDeFrame++;
    this.deltaTime = performance.now() - this.ultimoFrameRenderizado;
    this.fps = 1000 / this.deltaTime;
    this.deltaTimeRatio = this.deltaTime / 16.666666666666667;
    this.ultimoFrameRenderizado = performance.now();
    this.ui.actualizarPlata(this.usuario?.plata || 0);
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

  getTorresCerca(x, y, radio) {
    return this.torres.filter((obstaculo) => {
      return (
        distancia(x, y, obstaculo.posicion.x, obstaculo.posicion.y) < radio
      );
    });
  }

  onMouseMove(event) {
    // if (!this.teclas["1"]) return;

    const zoom = this.containerPrincipal.scale.x;
    const mundoX = (event.clientX - this.containerPrincipal.x) / zoom;
    const mundoY = (event.clientY - this.containerPrincipal.y) / zoom;

    this.mouse = { x: mundoX, y: mundoY };

    if (this.arrastrandoFantasma) {
      this.arrastrandoFantasma.sprite.x = this.mouse.x;
      this.arrastrandoFantasma.sprite.y = this.mouse.y;
      this.arrastrandoFantasma.sprite.zIndex = this.mouse.y;
    }

    // this.spawnEnemigo(mundoX, mundoY);
  }

  crearSpriteFantasma(dataDelBoton) {
    // console.log("poner fantasma", dataDelBoton);

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

    this.arrastrandoFantasma.sprite.x = this.mouse.x;
    this.arrastrandoFantasma.sprite.y = this.mouse.y;

    this.containerPrincipal.addChild(this.arrastrandoFantasma.sprite);
  }

  ponerExplosion(x, y) {
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

    const enemigosEnArea = this.getEnemigosCerca(x, y, 100);
    const torresEnArea = this.getTorresCerca(x, y, 100);
    const nuevoArrayConTodosLosObjetosEnArea = [
      ...enemigosEnArea,
      ...torresEnArea,
      this.centroUrbano,
    ];

    for (let objeto of nuevoArrayConTodosLosObjetosEnArea) {
      const cuantoDaño =
        150 / distanciaCuadrada(objeto, { posicion: { x, y } });

      // console.log("cuantoDaño", cuantoDaño);
      objeto.recibirDaño(cuantoDaño);
    }
  }
}

window.Juego = Juego;
