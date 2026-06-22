class Bala extends GameObject {
  constructor(x, y, juego, aQuien, quienDispara) {
    super(x, y - 50, juego);

    this.sprite = new PIXI.Sprite(juego.texturas.sombra);
    this.sprite.scale.set(0.05);
    this.container.addChild(this.sprite);

    juego.balas.push(this);

    this.velocidadMaxima = 50;
    this.daño = 0.05;
    this.quienDispara = quienDispara;
    this._impactada = false;

    this.agregarAceleracion(
      (aQuien.posicion.x - x) * 10,
      (aQuien.posicion.y - y) * 10,
    );
  }

  update() {
    if (this._impactada) return;
    super.update();
    this.chequearColision();
  }

  chequearColision() {
    const celda = this.juego.grilla.getCeldaEnPosicion(
      this.posicion.x,
      this.posicion.y,
    );
    if (!celda) return;

    let masCercano = null;
    let distMinCuad = Infinity;

    for (let entidad of celda.entidadesAca) {
      if (entidad === this) continue;
      if (entidad === this.quienDispara) continue;
      if (entidad instanceof Bala) continue;
      if (entidad._muerto) continue;
      if (typeof entidad.recibirDaño !== "function") continue;

      const distCuad = distanciaCuadrada(this, entidad);
      const sumRadios = this.radio + entidad.radio;
      if (distCuad >= sumRadios * sumRadios) continue;

      if (distCuad < distMinCuad) {
        distMinCuad = distCuad;
        masCercano = entidad;
      }
    }

    if (!masCercano) return;

    masCercano.recibirDaño(this.daño);
    this.impacatar();
  }

  impacatar() {
    if (this._impactada) return;
    this._impactada = true;

    // Acá irán VFX/sonido de impacto

    this.sacameDeLosArrays();
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }
}

window.Bala = Bala;
