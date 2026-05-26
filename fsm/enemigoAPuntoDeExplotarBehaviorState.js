class EnemigoAPuntoDeExplotarBehaviorState extends FSMState {
  onEnter() {
    this.owner.animationFSM.setState("aPuntoDeExplotar");
  }
  update() {
    if (this.currentFrame >= 50) {
      this.owner.morir();
    }
  }
  doChecks() {}
}
