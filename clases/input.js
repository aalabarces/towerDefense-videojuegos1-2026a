class Input {
  constructor(juego) {
    this.juego = juego;
    this.teclas = {};
    this.teclasPresionadas = {};
    this.mouse = { x: 0, y: 0 };
    window.addEventListener("keydown", this.onKeyDown.bind(this));
    window.addEventListener("keyup", this.onKeyUp.bind(this));
    window.addEventListener("mousedown", this.onMouseDown.bind(this));
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

  onMouseDown(event) {
    // this.juego.nivel.crearArbol(this.mouse.x, this.mouse.y);
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

    // this.spawnEnemigo(mundoX, mundoY);
  }

  onKeyUp(event) {
    const key = event.key.toLowerCase();

    this.teclas[key] = false;
  }

  update() {
    // limpiar al final del frame
    if (this.fuePresionada("escape")) {
      if (this.juego.pausado) {
        console.log("reanudar juego");
        this.juego.reanudar();
      } else {
        console.log("pausar juego");
        this.juego.pausa();
      }
    }
    if (this.estaApretada("shift") && this.fuePresionada("d")) {
      this.juego.toggleDebug();
    }
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
