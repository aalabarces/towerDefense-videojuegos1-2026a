class EnemigoIdleAnimationState extends FSMState {
  onEnter() {}
  update() {
    this.owner.cambiarAnimacion("idle", this.owner.direccion);
  }
  doChecks() {
    if (this.owner.velocidadLineal > 0.01) {
      this.fsm.setState("caminando");
    }
  }
}
