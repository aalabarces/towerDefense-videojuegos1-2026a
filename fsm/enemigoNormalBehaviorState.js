class EnemigoNormalBehaviorState extends FSMState {
  update() {
    this.owner.separacion();
    this.owner.moverHaciaTarget();
    this.owner.siYaLlegueAlPuntoDelCaminoPAsarAlSiguiente();
    this.owner.repelerObstaculos();
    this.owner.siEstoyCercaDelCentroUrbanoMorir();
    this.owner.repelerOtrosEnemigosAPuntoDeExplotar();
  }
  doChecks() {
    if (this.owner.vida < 0.66) {
      this.fsm.setState("moribundo");
    }
  }
}
