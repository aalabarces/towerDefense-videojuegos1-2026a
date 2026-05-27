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
    if (this.owner.vida < 0.66) {
      this.fsm.setState("moribundo");
    }
  }
}
