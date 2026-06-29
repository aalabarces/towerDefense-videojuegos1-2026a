class EntidadConSalud extends GameObject {
  static OFFSET_BARRA_VIDA = 20;
  static INTENSIDAD_FLASH = 0.85;
  static MATRIZ_FLASH_DAÑO = [
    0.15, 0, 0, 0, 0.85,
    0, 0.15, 0, 0, 0.85,
    0, 0, 0.15, 0, 0.85,
    0, 0, 0, 1, 0,
  ];

  constructor(x, y, juego) {
    super(x, y, juego);
    this.vida = 1;
    this.vidaMax = 1;
    this.dañoQueProduce = 0.1;

    this.mostrarVida = true;

    this.barraVidaContainer = new PIXI.Container();
    this.barraVidaFondo = new PIXI.Graphics();
    this.barraVida = new PIXI.Graphics();
    this.barraVidaContainer.addChild(this.barraVidaFondo);
    this.barraVidaContainer.addChild(this.barraVida);
    // Por encima del sprite del edificio/personaje (mismo zIndex = orden de addChild tapa la barra).
    this.barraVidaContainer.zIndex = 100;
    this.container.addChild(this.barraVidaContainer);

    setTimeout(() => this.inicializarBarraDeVida(), 500);
  }

  morir() {
    if (this._muerto) return;
    this._muerto = true;

    this.sacameDeLosArrays();
    this.explotar();

    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }

  //////////
  // VIDA
  //////////

  inicializarBarraDeVida() {
    if (!this.sprite) return;
    this.barraVidaFondo.clear();
    this.barraVidaFondo.rect(-25, -5, 50, 6);
    this.barraVidaFondo.fill({ color: 0x000000, alpha: 0.5 });

    this.actualizarBarraDeVida();
    this.barraVidaContainer.y =
      -this.sprite.height - EntidadConSalud.OFFSET_BARRA_VIDA;
    this.barraVidaContainer.visible = this.mostrarVida;
    this.barraVidaContainer.visible = false;
  }

  actualizarBarraDeVida() {
    const porcentaje = Math.max(0, this.vida / this.vidaMax);
    this.barraVidaContainer.visible = this.mostrarVida && porcentaje < 1;
    this.barraVida.clear();
    this.barraVida.rect(-25, -5, 50 * porcentaje, 6);
    const color =
      porcentaje > 0.5 ? 0x00ff00 : porcentaje > 0.2 ? 0xffff00 : 0xff0000;
    this.barraVida.fill({ color: color, alpha: 1 });
  }

  chequearMuerte() {
    if (this.vida > 0) return;
    this.morir();
  }

  obtenerElementosParaFlash() {
    return this.sprite ? [this.sprite] : [];
  }

  flashearAlRecibirDaño() {
    const elementos = this.obtenerElementosParaFlash();
    if (elementos.length === 0) return;

    if (!this._filtroFlashBlanco) {
      this._filtroFlashBlanco = new PIXI.ColorMatrixFilter();
      this._filtroFlashBlanco.matrix = EntidadConSalud.MATRIZ_FLASH_DAÑO;
    }

    this._elementosFlasheados = elementos;
    for (const elemento of elementos) {
      elemento.filters = [this._filtroFlashBlanco];
    }

    clearTimeout(this._timeoutFlashBlanco);
    this._timeoutFlashBlanco = setTimeout(() => {
      for (const elemento of this._elementosFlasheados ?? []) {
        if (elemento.destroyed) continue;
        elemento.filters = null;
      }
      this._elementosFlasheados = null;
    }, 100);
  }

  recibirDaño(cuanto) {
    const vidaAnterior = this.vida;
    this.vida -= Math.min(cuanto, 0.5);
    const dañoReal = vidaAnterior - this.vida;

    this.actualizarBarraDeVida();
    this.chequearMuerte();

    if (dañoReal > 0) {
      const ySpriteMinimo =
        this.posicion.y - (this.sprite ? this.sprite.height : 40);
      this.juego.crearTextoDaño(this.posicion.x, ySpriteMinimo, dañoReal);
      this.flashearAlRecibirDaño();
    }
  }

  explotar() {
    this.juego.gestorDeAudio.reproducirEfecto("explosion");
    this.juego.ponerExplosion(this.posicion.x, this.posicion.y, this);
  }
}
