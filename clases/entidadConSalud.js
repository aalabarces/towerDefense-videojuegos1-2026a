class EntidadConSalud extends GameObject {
  constructor(x, y, juego) {
    super(x, y, juego);
    this.salud = 1;
    this.dañoQueProduce = 0.1;
  }
  morir() {
    console.log("morir", this.id);
    this.explotar();
    super.morir();
  }

  explotar() {}
}
