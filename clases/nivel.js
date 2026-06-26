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

    // debug:
    this.debugNodosContainer = new PIXI.Container();
    this.debugNodosContainer.zIndex = 9999;
    this.juego.containerPrincipal.addChild(this.debugNodosContainer);
    this.debugNodosContainer.visible = false;
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
    this.agregarArbolesSegunJSON(dataNivel1.arboles);
    this.ponerPiedrasSegunJSON(dataNivel1.piedras);
    this.dibujarDebugNodos();
  }

  agregarArbolesSegunJSON(arboles) {
    for (let arbol of arboles) {
      this.crearArbol(arbol.x, arbol.y);
    }
  }

  ponerPiedrasSegunJSON(piedras) {
    for (let piedra of piedras) {
      this.crearPiedra(piedra.x, piedra.y);
    }
  }

  dibujarDebugNodos() {
    if (!this.debugNodosContainer) return;

    this.debugNodosContainer.removeChildren();

    const puntos = new PIXI.Graphics();

    for (let i = 0; i < this.nodosDelCamino.length; i++) {
      const nodo = this.nodosDelCamino[i];
      puntos.circle(nodo.x, nodo.y, 10);
      puntos.fill({ color: i === 0 ? 0x00d1ff : 0xff3d7f, alpha: 0.95 });
      puntos.circle(nodo.x, nodo.y, 16);
      puntos.stroke({ width: 2, color: 0x000000, alpha: 0.75 });
    }

    this.debugNodosContainer.addChild(puntos);
  }

  toggleDebug() {
    if (this.debugNodosContainer) {
      this.debugNodosContainer.visible = !this.debugNodosContainer.visible;
    }
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
  crearPiedra(x, y) {
    this.juego.spawnPiedra(x, y, Math.floor(Math.random() * 4) + 1);
  }

  crearArbol(x, y) {
    new Arbol(x, y, this.juego);
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
