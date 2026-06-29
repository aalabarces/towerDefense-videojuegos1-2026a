/*
class Bala extends GameObject {
  static velocidadBala = 20;
  static vidaUtil = 60 * 5;
  constructor(x, y, juego, quienDispara) {
    const salida = quienDispara.getPosicionSalidaBala();
    super(salida.x, salida.y, juego);
    this.tiempoVida = 0;
    this.sprite = new PIXI.Sprite(juego.texturas.sombra);
    this.sprite.scale.set(0.05);
    this.container.addChild(this.sprite);

    juego.balas.push(this);

    this.velocidadMaxima = Bala.velocidadBala;
    this.daño = 0.05;
    this.quienDispara = quienDispara;
    this._impactada = false;

    this.agregarAceleracion((x - salida.x) * 10, (y - salida.y) * 10);
  }

  update() {
    if (this._impactada) return;
    this.tiempoVida++;
    if (this.tiempoVida > Bala.vidaUtil) {
      this.impacatar();
    }
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
*/
