class EntidadConSalud extends GameObject {
  static OFFSET_BARRA_VIDA = 20;

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
    this.barraVidaFondo.clear();
    this.barraVidaFondo.rect(-25, -5, 50, 6);
    this.barraVidaFondo.fill({ color: 0x000000, alpha: 0.5 });

    this.actualizarBarraDeVida();
    this.barraVidaContainer.y =
      -this.sprite.height - EntidadConSalud.OFFSET_BARRA_VIDA;
    this.barraVidaContainer.visible = this.mostrarVida;
  }

  actualizarBarraDeVida() {
    const porcentaje = Math.max(0, this.vida / this.vidaMax);
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

  recibirDaño(cuanto) {
    this.vida -= Math.min(cuanto, 0.5);
    this.actualizarBarraDeVida();
    this.chequearMuerte();
  }

  explotar() {
    this.juego.gestorDeAudio.reproducirEfecto("explosion");
    this.juego.ponerExplosion(this.posicion.x, this.posicion.y);
  }
}
