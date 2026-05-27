class Input {
  constructor(juego) {
    this.juego = juego;
    this.teclas = {};
    this.teclasPresionadas = {};

    window.addEventListener("keydown", this.onKeyDown.bind(this));
    window.addEventListener("keyup", this.onKeyUp.bind(this));
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
    if (this.estaApretada("shift") && this.estaApretada("d")) {
      // this.ui.toggleDebug();
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