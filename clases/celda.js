class Celda {
  constructor(x, y, grilla) {
    this.x = x;
    this.y = y;
    this.grilla = grilla;
    this.entidadesAca = [];
  }

  insertar(entidad) {
    this.entidadesAca.push(entidad);
  }

  remover(entidad) {
    this.entidadesAca = this.entidadesAca.filter((e) => e !== entidad);
  }

  vaciar() {
    this.entidadesAca = [];
  }

  getVecinos(cantDeCeldas = 1) {
    let celdas = [];

    for (let i = -cantDeCeldas; i <= cantDeCeldas; i++) {
      for (let j = -cantDeCeldas; j <= cantDeCeldas; j++) {
        if (i == 0 && j == 0) continue;
        let celda = this.grilla.getCeldaEnGrilla(this.x + i, this.y + j);
        if (celda) celdas.push(celda);
      }
    }

    return celdas;
  }

  getEntidadesAcaYEnCeldasVecinas(radioCeldas = 1) {
    let entidades = [];
    let vecinos = this.getVecinos(radioCeldas);
    for (let i = 0; i < vecinos.length; i++) {
      let celda = vecinos[i];
      entidades.push(...celda.entidadesAca);
    }

    entidades.push(...this.entidadesAca);
    return entidades;
  }

  getObjetoEnPosicion(x, y) {
    // TODO: que de prioridad a torres en vez de devolver el primero
    for (let i = 0; i < this.entidadesAca.length; i++) {
      let entidad = this.entidadesAca[i];
      console.log("checking entidad", entidad.constructor.name, entidad.id, "at", entidad.posicion.x, entidad.posicion.y);
      if (entidad.sprite) {
        let bounds = entidad.sprite.getBounds();
        if (x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height) {
          return entidad;
        }
      }
    }
    return null;
  }
}
