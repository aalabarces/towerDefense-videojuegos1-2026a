class EntidadConSalud extends GameObject {
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
    this.container.addChild(this.barraVidaContainer);

    this.inicializarBarraDeVida();
  }

  morir() {
    console.log("morir", this.id);
    this.explotar();
    this.sacameDeLosArrays();
    this.container.destroy();
    this.container = null;
  }

  //////////
  // VIDA
  //////////

  inicializarBarraDeVida() {
    this.barraVidaFondo.clear();
    this.barraVidaFondo.rect(-25, -5, 50, 6);
    this.barraVidaFondo.fill({ color: 0x000000, alpha: 0.5 });

    this.actualizarBarraDeVida();
    this.barraVidaContainer.y = -this.radio * 2 - 35;
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

  recibirDaño(cuanto) {
    this.vida -= cuanto;
    this.actualizarBarraDeVida();
    if (this.vida <= 0) {
      this.morir();
    }
  }

  explotar() {}
}
