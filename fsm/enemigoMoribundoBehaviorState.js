class EnemigoMoribundoBehaviorState extends FSMState {
  onEnter() {}
  update() {
    if (this.owner.torreMasCerca) {
      this.owner.asignarTarget(this.owner.torreMasCerca.posicion);
    }

    // this.owner.separacion();
    this.owner.moverHaciaTarget();
    // this.owner.repelerObstaculos();
    this.owner.siEstoyCercaDelCentroUrbanoMorir();

    this.owner.siEstoyCercaDeUnaTorreMorir();
  }
  doChecks() {}
}
