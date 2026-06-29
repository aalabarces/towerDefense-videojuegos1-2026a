const CONFIG_DEFECTO = {
  economia: {
    plataInicial: 200,
    recompensaPlataPorKillDefault: 10,
  },
  centroUrbano: {
    integridadMaxima: 3,
    multiplicadorDañoExplosion: 2,
    radioColision: 80,
  },
  combate: {
    dañoMaximoPorGolpe: 0.5,
    umbralEstadoMoribundo: 0.66,
  },
  movimientoEnemigo: {
    velocidadMaximaDefault: 2.5,
    aceleracionDefault: 0.25,
    friccion: 0.9,
    distanciaNodoCamino: 150,
    distanciaInmolacion: 100,
    distanciaPersonal: 30,
    fuerzaSeparacion: 0.5,
    fuerzaRepulsionObstaculos: 0.8,
    radioVision: 500,
    radioColision: 10,
  },
  enemigos: {
    base: {
      vidaMaxima: 1,
      velocidadMaxima: 2.5,
      aceleracion: 0.25,
      costoOleada: 10,
      oleadaDesbloqueo: 1,
      recompensaPlata: 8,
      dañoLeak: 1,
    },
    rapido: {
      vidaMaxima: 1,
      velocidadMaxima: 7,
      aceleracion: 0.4,
      costoOleada: 20,
      oleadaDesbloqueo: 3,
      recompensaPlata: 15,
      dañoLeak: 1,
    },
    duro: {
      vidaMaxima: 4,
      velocidadMaxima: 2,
      aceleracion: 0.2,
      costoOleada: 35,
      oleadaDesbloqueo: 8,
      recompensaPlata: 25,
      dañoLeak: 1,
    },
    fuerte: {
      vidaMaxima: 2,
      velocidadMaxima: 2.5,
      aceleracion: 0.25,
      costoOleada: 40,
      oleadaDesbloqueo: 15,
      recompensaPlata: 30,
      dañoLeak: 2,
    },
  },
  oleadas: {
    tiempoEntreOleadasMs: 6000,
    tiempoInicialAntesPrimeraOleadaMs: 6000,
    presupuestoBase: 10,
    presupuestoMultiplicador: 16,
    presupuestoExponente: 1.18,
    intervaloSpawnInicialMs: 1500,
    intervaloSpawnMinimoMs: 250,
    intervaloSpawnReduccionPorOleadaMs: 40,
    escaladoVidaPorOleada: 0.06,
    composicionPonderada: true,
    pesosPorOleada: {},
  },
  torres: {
    1: {
      precio: 100,
      dañoPorDisparo: 0.08,
      cooldownMs: 350,
      radioVision: 450,
      radioColision: 40,
    },
    2: {
      precio: 150,
      dañoPorDisparo: 0.06,
      cooldownMs: 500,
      radioVision: 320,
      radioColision: 40,
    },
    3: {
      precio: 250,
      dañoPorDisparo: 0.04,
      cooldownMs: 90,
      radioVision: 380,
      radioColision: 40,
    },
  },
  piedras: {
    1: { precio: 10, vidaMaxima: 2, radioColision: 45 },
    2: { precio: 20, vidaMaxima: 4, radioColision: 50 },
    3: { precio: 35, vidaMaxima: 6, radioColision: 55 },
    4: { precio: 50, vidaMaxima: 10, radioColision: 60 },
  },
  consumibles: {
    superBomba: {
      precio: 500,
      dañoGlobal: 0.5,
      duracionSacudidaMs: 1000,
      intensidadSacudida: 66,
    },
  },
  explosiones: {
    radioArea: 100,
    factorDañoEnemigos: 150,
    factorDañoEstructuras: 150,
    multiplicadorDañoEstructuras: 5,
    framesAntesDeDetonar: 50,
  },
};

function mezclarProfundo(base, override) {
  if (!override || typeof override !== "object") return base;
  const resultado = { ...base };
  for (const clave of Object.keys(override)) {
    if (clave.startsWith("_")) continue;
    const valor = override[clave];
    if (
      valor &&
      typeof valor === "object" &&
      !Array.isArray(valor) &&
      base[clave] &&
      typeof base[clave] === "object"
    ) {
      resultado[clave] = mezclarProfundo(base[clave], valor);
    } else if (valor !== undefined) {
      resultado[clave] = valor;
    }
  }
  return resultado;
}

class ConfigJuego {
  constructor(datos) {
    this.datos = datos;
  }

  static async cargar(url = "config/gameDesign.json") {
    try {
      const respuesta = await fetch(url);
      if (!respuesta.ok) {
        throw new Error(`HTTP ${respuesta.status}`);
      }
      const json = await respuesta.json();
      const datos = mezclarProfundo(CONFIG_DEFECTO, json);
      console.log("[ConfigJuego] Configuración cargada desde", url);
      return new ConfigJuego(datos);
    } catch (error) {
      console.error(
        "[ConfigJuego] No se pudo cargar",
        url,
        "- usando defaults embebidos.",
        error,
      );
      return new ConfigJuego(structuredClone(CONFIG_DEFECTO));
    }
  }

  getEconomia() {
    return this.datos.economia;
  }

  getCentroUrbano() {
    return this.datos.centroUrbano;
  }

  getCombate() {
    return this.datos.combate;
  }

  getMovimientoEnemigo() {
    return this.datos.movimientoEnemigo;
  }

  getOleadas() {
    return this.datos.oleadas;
  }

  getExplosiones() {
    return this.datos.explosiones;
  }

  getConsumibles() {
    return this.datos.consumibles;
  }

  getEnemigo(arquetipo) {
    const mov = this.getMovimientoEnemigo();
    const stats = this.datos.enemigos[arquetipo];
    if (!stats) {
      console.warn("[ConfigJuego] Arquetipo desconocido:", arquetipo);
      return { ...this.datos.enemigos.base, ...mov };
    }
    return { ...mov, ...stats, arquetipo };
  }

  getListaEnemigosOleada() {
    return Object.entries(this.datos.enemigos).map(([clase, stats]) => ({
      clase,
      ...stats,
    }));
  }

  getTorre(id) {
    const stats = this.datos.torres[String(id)];
    if (!stats) {
      console.warn("[ConfigJuego] Torre desconocida:", id);
      return this.datos.torres["1"];
    }
    return stats;
  }

  getPiedra(id) {
    const stats = this.datos.piedras[String(id)];
    if (!stats) {
      console.warn("[ConfigJuego] Piedra desconocida:", id);
      return this.datos.piedras["1"];
    }
    return stats;
  }

  precioCompra(tipo, id) {
    if (tipo === "torre") return this.getTorre(id).precio;
    if (tipo === "piedra") return this.getPiedra(id).precio;
    if (tipo === "superBomba") return this.getConsumibles().superBomba.precio;
    return 0;
  }

  calcularPresupuestoOleada(numeroOleada) {
    const o = this.getOleadas();
    return (
      o.presupuestoBase +
      o.presupuestoMultiplicador *
        Math.pow(o.presupuestoExponente, numeroOleada - 1)
    );
  }

  calcularIntervaloSpawnMs(numeroOleada) {
    const o = this.getOleadas();
    return Math.max(
      o.intervaloSpawnMinimoMs,
      o.intervaloSpawnInicialMs -
        (numeroOleada - 1) * o.intervaloSpawnReduccionPorOleadaMs,
    );
  }

  calcularVidaEscalada(vidaBase, numeroOleada) {
    const escalado = this.getOleadas().escaladoVidaPorOleada;
    return vidaBase * (1 + escalado * (numeroOleada - 1));
  }

  elegirArquetipoOleada(numeroOleada, enemigosDisponibles) {
    const o = this.getOleadas();
    if (!o.composicionPonderada || !o.pesosPorOleada) {
      return this._elegirUniforme(enemigosDisponibles);
    }

    const clavesOleada = Object.keys(o.pesosPorOleada)
      .map(Number)
      .sort((a, b) => a - b);
    let pesos = null;
    for (const clave of clavesOleada) {
      if (clave <= numeroOleada) {
        pesos = o.pesosPorOleada[String(clave)];
      }
    }

    if (!pesos) {
      return this._elegirUniforme(enemigosDisponibles);
    }

    const candidatos = enemigosDisponibles.filter((e) => pesos[e.clase] > 0);
    if (candidatos.length === 0) {
      return this._elegirUniforme(enemigosDisponibles);
    }

    let total = 0;
    for (const c of candidatos) {
      total += pesos[c.clase];
    }

    let roll = Math.random() * total;
    for (const c of candidatos) {
      roll -= pesos[c.clase];
      if (roll <= 0) return c;
    }
    return candidatos[candidatos.length - 1];
  }

  _elegirUniforme(enemigosDisponibles) {
    return enemigosDisponibles[
      Math.floor(Math.random() * enemigosDisponibles.length)
    ];
  }
}

window.ConfigJuego = ConfigJuego;
