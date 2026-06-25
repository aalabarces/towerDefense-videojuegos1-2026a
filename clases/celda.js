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
    // Query this cell and its neighbors (up to 2 cells away) to find any overlapping sprites
    const entidades = this.getEntidadesAcaYEnCeldasVecinas(2);

    // Prioritize towers and structures
    entidades.sort((a, b) => {
      const aIsTorre = a instanceof Torre;
      const bIsTorre = b instanceof Torre;
      if (aIsTorre && !bIsTorre) return -1;
      if (!aIsTorre && bIsTorre) return 1;
      return 0;
    });

    for (let i = 0; i < entidades.length; i++) {
      let entidad = entidades[i];
      if (entidad.sprite) {
        const sprite = entidad.sprite;
        const width = sprite.texture.width * sprite.scale.x;
        const height = sprite.texture.height * sprite.scale.y;
        const anchorX = sprite.anchor ? sprite.anchor.x : 0;
        const anchorY = sprite.anchor ? sprite.anchor.y : 0;

        const left = entidad.posicion.x - anchorX * width;
        const right = entidad.posicion.x + (1 - anchorX) * width;
        const top = entidad.posicion.y - anchorY * height;
        const bottom = entidad.posicion.y + (1 - anchorY) * height;

        if (x >= left && x <= right && y >= top && y <= bottom) {
          return entidad;
        }
      }
    }
    return null;
  }
}
