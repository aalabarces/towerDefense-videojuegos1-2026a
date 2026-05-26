class EnemigoAPuntoDeExplotarAnimationState extends FSMState {
  onEnter() {}
  update() {
    this.owner.cambiarAnimacion("spellcast", this.owner.direccion);
  }
  doChecks() {}
}
