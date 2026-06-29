class Usuario {
  constructor(plataInicial = 200) {
    this.plata = plataInicial;
  }

  sumarPlata(cuanto) {
    this.plata += cuanto;
  }
}
