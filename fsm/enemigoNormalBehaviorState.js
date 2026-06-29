class EnemigoNormalBehaviorState extends FSMState {
  update() {
    this.owner.separacion();
    this.owner.moverHaciaTarget();
    this.owner.siYaLlegueAlPuntoDelCaminoPAsarAlSiguiente();
    this.owner.repelerObstaculos();
    this.owner.siEstoyCercaDelCentroUrbanoMorir();
    if (this.owner.objTarget !== this.owner.juego.centroUrbano) {
      this.owner.repelerOtrosEnemigosAPuntoDeExplotar();
    }
  }
  doChecks() {
    const umbral =
      this.owner.juego.config.getCombate().umbralEstadoMoribundo;
    if (this.owner.vida < umbral) {
      this.fsm.setState("moribundo");
    }
  }
}
