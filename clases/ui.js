const BOTON_TAMANO = 64;
const BOTON_PADDING = 8;
const CANTIDAD_DE_BOTONES = 9;
const PANEL_ANCHO =
  BOTON_TAMANO * CANTIDAD_DE_BOTONES +
  BOTON_PADDING * (CANTIDAD_DE_BOTONES + 1);
const PANEL_ALTO = BOTON_TAMANO + BOTON_PADDING * 2;

class UI {
  constructor(juego) {
    this.juego = juego;
    this.fantasma = null;
    this.ignorarProximoClick = false;
    this.textoRendimiento = null;

    this.container = new PIXI.Container();
    this.container.zIndex = 1000;
    juego.app.stage.addChild(this.container);

    this.crearPanel();
    this.posicionarPanel();
    this.crearDebugDeRendimiento();

    this.onMouseMove = this.onMouseMove.bind(this);
    document.body.addEventListener("mousemove", this.onMouseMove);
  }

  crearPanel() {
    const fondo = new PIXI.Graphics();
    fondo.roundRect(0, 0, PANEL_ANCHO, PANEL_ALTO, 10);
    fondo.fill({ color: 0x000000, alpha: 0.55 });
    this.container.addChild(fondo);

    for (let i = 1; i <= CANTIDAD_DE_BOTONES; i++) {
      this.crearBoton(
        i,
        BOTON_PADDING * i + BOTON_TAMANO * (i - 1),
        BOTON_PADDING,
      );
    }
  }

  crearBoton(tipo, x, y) {
    let textura;
    if (tipo >= 1 && tipo <= 5) {
      textura = this.juego.texturas[`torre${tipo}`];
    } else {
      const rockNum = tipo - 5;
      textura = this.juego.texturas[`rock${rockNum}`];
    }

    const marco = new PIXI.Graphics();
    marco.roundRect(0, 0, BOTON_TAMANO, BOTON_TAMANO, 6);
    marco.fill({ color: 0x334455, alpha: 1 });
    marco.x = x;
    marco.y = y;
    this.container.addChild(marco);

    const sprite = new PIXI.Sprite(textura);
    sprite.width = BOTON_TAMANO - 8;
    sprite.height = BOTON_TAMANO - 8;
    sprite.x = x + 4;
    sprite.y = y + 4;
    sprite.interactive = true;
    sprite.cursor = "pointer";

    sprite.on("pointerover", () => {
      marco.clear();
      marco.roundRect(0, 0, BOTON_TAMANO, BOTON_TAMANO, 6);
      marco.fill({ color: 0x4488cc, alpha: 1 });
    });

    sprite.on("pointerout", () => {
      marco.clear();
      marco.roundRect(0, 0, BOTON_TAMANO, BOTON_TAMANO, 6);
      marco.fill({ color: 0x334455, alpha: 1 });
    });

    sprite.on("pointerdown", () => {
      this.ignorarProximoClick = true;
      this.activarModoColocacion(tipo);
    });

    this.container.addChild(sprite);
  }

  posicionarPanel() {
    this.container.x = 12;
    this.container.y = window.innerHeight - PANEL_ALTO - 12;
  }

  crearDebugDeRendimiento() {
    this.textoRendimiento = new PIXI.Text({
      text: "",
      style: {
        fontFamily: "monospace",
        fontSize: 13,
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 3 },
      },
    });

    this.textoRendimiento.x = 12;
    this.textoRendimiento.y = 12;
    this.textoRendimiento.zIndex = 1200;

    this.juego.app.stage.addChild(this.textoRendimiento);
    this.actualizarMetricasDeRendimiento();
  }

  actualizarMetricasDeRendimiento() {
    if (!this.textoRendimiento) return;

    this.textoRendimiento.text = [
      `FPS : ${this.juego.fps.toFixed(1)}`,
      `Delta time: ${this.juego.deltaTime.toFixed(2)} ms`,
      `Delta time ratio: ${this.juego.deltaTimeRatio.toFixed(2)}`,
    ].join("\n");
  }

  activarModoColocacion(tipo) {
    this.cancelarColocacion();

    const esTorre = tipo >= 1 && tipo <= 5;
    const tipoDePiedra = tipo - 5;
    const textura = esTorre
      ? this.juego.texturas[`torre${tipo}`]
      : this.juego.texturas[`rock${tipoDePiedra}`];
    const sprite = new PIXI.Sprite(textura);
    sprite.anchor.set(0.5, 1);
    sprite.alpha = 0.5;
    sprite.tint = 0x4499ff;
    sprite.scale.set(2);
    sprite.zIndex = 9999;

    this.fantasma = { sprite, tipo, esTorre, tipoDePiedra };
    this.juego.containerPrincipal.addChild(sprite);
  }

  onMouseMove(event) {
    if (!this.fantasma) return;

    const contenedor = this.juego.containerPrincipal;
    if (!contenedor) return;

    const zoom = contenedor.scale.x;
    const mundoX = (event.pageX - contenedor.x) / zoom;
    const mundoY = (event.pageY - contenedor.y) / zoom;

    this.fantasma.sprite.x = mundoX;
    this.fantasma.sprite.y = mundoY;
  }

  confirmarColocacion(mundoX, mundoY) {
    if (!this.fantasma) return false;

    const { tipo, esTorre, tipoDePiedra } = this.fantasma;
    this.cancelarColocacion();
    if (esTorre) {
      this.juego.spawnTorre(mundoX, mundoY, tipo);
    } else {
      this.juego.spawnPiedra(mundoX, mundoY, tipoDePiedra);
    }
    return true;
  }

  cancelarColocacion() {
    if (!this.fantasma) return;

    this.juego.containerPrincipal.removeChild(this.fantasma.sprite);
    this.fantasma.sprite.destroy();
    this.fantasma = null;
  }
}

window.UI = UI;
