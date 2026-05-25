class EnemigoCorriendoAnimationState extends FSMState {
  onEnter() {}
  update() {
    this.owner.cambiarAnimacion("run", this.owner.direccion);
  }
  doChecks() {
    if (this.owner.velocidadLineal < 1.5) {
      this.fsm.setState("caminando");
      return;
    }
  }
}
