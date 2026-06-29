class Oleada {
  constructor(juego, numero) {
    this.juego = juego;
    this.numero = numero;
    this.config = juego.config.getOleadas();

    this.intervaloSpawn = juego.config.calcularIntervaloSpawnMs(numero);
    this.tiempoSiguienteSpawn = this.intervaloSpawn;
    this.presupuesto = juego.config.calcularPresupuestoOleada(numero);
    this.enemigosDisponibles = this.obtenerEnemigosDesbloqueados();
    this.enemigosDeLaOleada = [];
    this.generarOleada();
  }

  obtenerEnemigosDesbloqueados() {
    return this.juego.config
      .getListaEnemigosOleada()
      .filter((tipo) => tipo.oleadaDesbloqueo <= this.numero);
  }

  generarOleada() {
    while (this.presupuesto > 0) {
      const tipoEnemigo = this.juego.config.elegirArquetipoOleada(
        this.numero,
        this.enemigosDisponibles,
      );

      const enemigo = this.juego.nivel.spawnEnemigo(
        tipoEnemigo.clase,
        this.numero,
      );
      this.enemigosDeLaOleada.push(enemigo);
      this.presupuesto -= tipoEnemigo.costoOleada;
    }
  }

  obtenerEnemigos() {
    return this.enemigosDeLaOleada;
  }

  update() {
    this.tiempoSiguienteSpawn -= this.juego.deltaTime;
    if (this.tiempoSiguienteSpawn <= 0) {
      const enemigo = this.enemigosDeLaOleada.pop();
      if (enemigo) {
        this.tiempoSiguienteSpawn = this.intervaloSpawn;
      }
    }
  }
}
