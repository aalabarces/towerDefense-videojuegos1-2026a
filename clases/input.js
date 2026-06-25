class Input {
  constructor(juego) {
    this.juego = juego;
    this.teclas = {};
    this.teclasPresionadas = {};
    this.mouse = { x: 0, y: 0 };
    this.objetoSeleccionado = null;
    window.addEventListener("keydown", this.onKeyDown.bind(this));
    window.addEventListener("keyup", this.onKeyUp.bind(this));

    window.addEventListener("mousemove", this.onMouseMove.bind(this));
  }

  onKeyDown(event) {
    const key = event.key.toLowerCase();

    // Solo marcar "presionada este frame"
    // si antes NO estaba apretada
    if (!this.teclas[key]) {
      this.teclasPresionadas[key] = true;
    }

    this.teclas[key] = true;
  }

  onMouseMove(event) {
    if (!this.juego.containerPrincipal) return;
    const zoom = this.juego.containerPrincipal.scale.x;
    const mundoX = (event.clientX - this.juego.containerPrincipal.x) / zoom;
    const mundoY = (event.clientY - this.juego.containerPrincipal.y) / zoom;

    this.mouse = { x: mundoX, y: mundoY };

    if (this.juego.arrastrandoFantasma) {
      if (this.juego.arrastrandoFantasma.esPreview) {
        this.juego.arrastrandoFantasma.posicion.x = this.mouse.x;
        this.juego.arrastrandoFantasma.posicion.y = this.mouse.y;
      } else {
        this.juego.arrastrandoFantasma.sprite.x = this.mouse.x;
        this.juego.arrastrandoFantasma.sprite.y = this.mouse.y;
        this.juego.arrastrandoFantasma.sprite.zIndex = this.mouse.y;
      }
    }
    
    if (this.juego.pausado) return;
    console.log(this.juego.grilla.getCeldaEnPosicion(this.mouse.x, this.mouse.y))
    console.log(this.juego.grilla.getCeldaEnPosicion(this.mouse.x, this.mouse.y)?.getObjetoEnPosicion(this.mouse.x, this.mouse.y))
    const nuevoSeleccionado = this.juego.grilla.getCeldaEnPosicion(this.mouse.x, this.mouse.y)?.getObjetoEnPosicion(this.mouse.x, this.mouse.y);
    console.log("nuevoSeleccionado", nuevoSeleccionado?.constructor.name, nuevoSeleccionado?.id);
    if (nuevoSeleccionado !== this.objetoSeleccionado) {
      this.objetoSeleccionado?.onMouseOut();
      nuevoSeleccionado?.onMouseOver();
      this.objetoSeleccionado = nuevoSeleccionado;
    }
    
  }

  onKeyUp(event) {
    const key = event.key.toLowerCase();

    this.teclas[key] = false;
  }

  update() {
    // pausar/reanudar
    if (this.fuePresionada("escape")) {
      if (this.juego.pausado) {
        console.log("reanudar juego");
        this.juego.reanudar();
      } else {
        console.log("pausar juego");
        this.juego.pausa();
      }
    }
    // debug
    if (this.estaApretada("shift") && this.fuePresionada("d")) {
      this.juego.toggleDebug();
    }
    // limpiar al final del frame
    this.teclasPresionadas = {};
  }

  estaApretada(key) {
    // this.teclas[key] puede ser undefined, así que lo convertimos a booleano
    return !!this.teclas[key];
  }

  fuePresionada(key) {
    return !!this.teclasPresionadas[key];
  }

}
