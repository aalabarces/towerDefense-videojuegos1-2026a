class Piedra extends Casita {
  constructor(x, y, juego, tipo = 1) {
    super(x, y, juego);
    this.radio = 50;

    this.tipo = "piedra";
    this.tipoDePiedra = tipo;
    this.inicializarSprite(juego.texturas[`rock${tipo}`], 2);

    juego.piedras.push(this);
  }
}
