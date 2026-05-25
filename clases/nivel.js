class Nivel {
  constructor(juego) {
    this.juego = juego;

    this.cargarJSON();

    this.oleadaActual = null;
    this.oleadas = 0;
    this.tiempoEntreOleadas = 5000;
    this.tiempoSiguienteOleada = 5000;

    this.juego.agregarFondoDelMundo();
    // this.juego.spawnCentroUrbano();

    this.posicionDeSpawn = { x: -100, y: -100 };
    this.nodosDelCamino = [this.posicionDeSpawn];
  }

  async cargarJSON() {
    const dataNivel1 = await (await fetch("niveles/nivel1.json")).json();

    this.nodosDelCamino = dataNivel1.puntos.map((nodo) => ({
      x: nodo.x,
      y: nodo.y,
    }));
    this.posicionCentroUrbano = dataNivel1.posicionCentroUrbano;
    this.juego.spawnCentroUrbano(
      this.posicionCentroUrbano.x,
      this.posicionCentroUrbano.y,
    );
  }

  spawnEnemigo(tipo) {
    return this.juego.spawnEnemigo(
      this.posicionDeSpawn.x,
      this.posicionDeSpawn.y,
      {
        tipo,
      },
    );
  }

  spawnOleada() {
    // console.log("Spawn de oleada");
    this.oleadas++;
    this.oleadaActual = new Oleada(this.juego, this.oleadas);
    this.tiempoSiguienteOleada = this.tiempoEntreOleadas;
    // console.log("Spawn de oleada ", this.oleadas);
    // console.log("Tiempo siguiente oleada ", this.tiempoSiguienteOleada);
  }

  update() {
    if (this.oleadaActual) {
      this.oleadaActual.update();
      if (this.oleadaActual.enemigosDeLaOleada.length === 0) {
        this.oleadaActual = null;
      }
      return;
    }
    this.tiempoSiguienteOleada -= this.juego.deltaTime;
    if (this.tiempoSiguienteOleada <= 0 && !this.oleadaActual) {
      this.spawnOleada();
    }
  }
}
