class Enemigo extends Persona {
  constructor(x, y, juego, opciones = {}) {
    super(x, y, juego, {
      estadoInicial: "walk",
      ...opciones,
    });

    this.id = juego.enemigos.length;
    this.tipo = "enemigo";

    this.targetX = juego.centroUrbano.posicion.x;
    this.targetY = juego.centroUrbano.posicion.y;

    this.ultimoAtaque = 0;
    this.cooldownAtaque = 1000;

    juego.enemigos.push(this);
  }

  update() {
    if (this.estado === EstadosPersona.MUERTO) return;

    const dx = this.juego.centroUrbano.posicion.x - this.posicion.x;
    const dy = this.juego.centroUrbano.posicion.y - this.posicion.y;
    const dist = Math.hypot(dx, dy);

    if (dist < this.radio + this.juego.centroUrbano.radio + 20) {
      this.asignarVelocidad(0, 0);
      this.velocidadLineal = 0;
      this.atacar();
    } else {
      super.update();
    }
  }

  atacar() {
    const ahora = performance.now();
    if (ahora - this.ultimoAtaque > this.cooldownAtaque) {
      this.juego.centroUrbano.recibirDaño(this.fuerza);
      this.ultimoAtaque = ahora;
      this.cambiarAnimacion("1h_slash", this.direccion);
    }
  }
}

window.Enemigo = Enemigo;
