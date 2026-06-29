class Piedra extends Estructura {
  constructor(x, y, juego, tipo = 1) {
    super(x, y, juego);

    const stats = juego.config.getPiedra(tipo);

    this.radio = stats.radioColision;
    this.tipo = "piedra";
    this.tipoDePiedra = tipo;
    this.vidaMax = stats.vidaMaxima;
    this.vida = this.vidaMax;
    this.mostrarVida = true;

    this.inicializarSprite(juego.texturas[`rock${tipo}`], 1);

    juego.piedras.push(this);
  }
}
