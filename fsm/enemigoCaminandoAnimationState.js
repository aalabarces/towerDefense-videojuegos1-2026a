class EnemigoCaminandoAnimationState extends FSMState {
  onEnter() {}
  update() {
    this.owner.cambiarAnimacion("walk", this.owner.direccion);
  }
  doChecks() {
    if (this.owner.velocidadLineal < 0.01) {
      this.fsm.setState("idle");
      return;
    }

    if (this.owner.velocidadLineal > 1.5) {
      this.fsm.setState("corriendo");
      return;
    }
  }
}
