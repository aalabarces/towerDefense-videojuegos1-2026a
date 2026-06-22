class Grilla {
  constructor(ancho, alto, anchoDeCelda, juego) {
    this.ancho = ancho;
    this.alto = alto;
    this.anchoDeCelda = anchoDeCelda;
    this.juego = juego;

    this.crearCeldas();
  }

  crearCeldas() {
    this.celdas = [];
    for (let i = 0; i < Math.floor(this.ancho / this.anchoDeCelda); i++) {
      this.celdas[i] = [];
      for (let j = 0; j < Math.floor(this.alto / this.anchoDeCelda); j++) {
        this.celdas[i][j] = new Celda(i, j, this);
      }
    }
  }

  getCeldaEnPosicion(x, y) {
    let col = this.celdas[Math.floor(x / this.anchoDeCelda)];
    if (!col) return null;
    return col[Math.floor(y / this.anchoDeCelda)];
  }

  resetear() {
    for (let i = 0; i < Math.floor(this.ancho / this.anchoDeCelda); i++) {
      for (let j = 0; j < Math.floor(this.alto / this.anchoDeCelda); j++) {
        let celda = this.getCeldaEnGrilla(i, j);
        if (celda) celda.vaciar();
      }
    }

    for (let gameObject of this.juego.gameObjects) {
      gameObject.metermeEnLaGrilla();
    }
  }

  getCeldaEnGrilla(x, y) {
    let columna = this.celdas[x];
    if (!columna) return null;

    return columna[y];
  }

  insertar(entidad) {
    let celda = this.getCeldaEnPosicion(entidad.posicion.x, entidad.posicion.y);
    if (!celda) return;
    celda.insertar(entidad);
  }

  remover(entidad) {
    let celda = this.getCeldaEnPosicion(entidad.posicion.x, entidad.posicion.y);
    if (!celda) return;
    celda.remover(entidad);
  }

  query(x, y, radioPx = ANCHO_CELDA) {
    let celda = this.getCeldaEnPosicion(x, y);
    if (!celda) return [];
    return celda.getEntidadesAcaYEnCeldasVecinas(
      Math.ceil(radioPx / ANCHO_CELDA),
    );
  }
}
