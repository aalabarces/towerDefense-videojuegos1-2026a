class EnemigoAPuntoDeExplotarBehaviorState extends FSMState {
  onEnter() {
    this.owner.animationFSM.setState("aPuntoDeExplotar");
  }
  update() {
    const frames =
      this.owner.juego.config.getExplosiones().framesAntesDeDetonar;
    if (this.currentFrame >= frames) {
      this.owner.morir();
    }
  }
  doChecks() {}
}
