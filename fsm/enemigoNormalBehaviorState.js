class EnemigoNormalBehaviorState extends FSMState {
  update() {
    this.owner.separacion();
    this.owner.moverHaciaTarget();
    this.owner.siYaLlegueAlPuntoDelCaminoPAsarAlSiguiente();
    this.owner.repelerObstaculos();
    this.owner.siEstoyCercaDelCentroUrbanoMorir();
  }
  doChecks() {
    if (this.owner.vida < 0.2) {
      this.fsm.setState("moribundo");
    }
  }
}
