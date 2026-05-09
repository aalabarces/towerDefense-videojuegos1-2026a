const TIPOS_ENEMIGOS = [{
    clase: 'base',
    costo: 10,
    oleada_desbloqueo: 1
  },
  {
    clase: 'rapido',
    costo: 20,
    oleada_desbloqueo: 3
  },
  {
    clase: 'duro',
    costo: 30,
    oleada_desbloqueo: 8
  },
  {
    clase: 'fuerte',
    costo: 30,
    oleada_desbloqueo: 15
  },
]

class Oleada {
  constructor(juego, numero) {
    this.juego = juego;
    this.numero = numero;
    this.duracion = 15 + numero * 2;
    this.intervaloSpawn = Math.max(0.2, 1.5 - numero * 0.05);
    this.tiempoSiguienteSpawn = this.intervaloSpawn;
    this.presupuesto = this.calcularPresupuesto();
    this.enemigosDisponibles = this.obtenerEnemigosDesbloqueados();
    this.enemigosDeLaOleada = [];
    this.generarOleada();
  }

  calcularPresupuesto() {
    return 10 + 10 * Math.pow(1.3, this.numero - 1);
  }

  obtenerEnemigosDesbloqueados() {
    const enemigos = [];
    for (let i = 0; i < TIPOS_ENEMIGOS.length; i++) {
      if (TIPOS_ENEMIGOS[i].oleada_desbloqueo <= this.numero) {
        enemigos.push(TIPOS_ENEMIGOS[i]);
      }
    }
    return enemigos;
  }

  generarOleada() {
    while (this.presupuesto > 0) {
      const tipoEnemigo = this.enemigosDisponibles[Math.floor(Math.random() * this.enemigosDisponibles.length)];
      const enemigo = this.juego.spawnEnemigo(
        MUNDO_ANCHO * 1.02 + Math.random() * 100,
        MUNDO_ALTO * 1.02 + Math.random() * 100,
        { tipo: tipoEnemigo.clase }
      );
      this.enemigosDeLaOleada.push(enemigo);
      this.presupuesto -= tipoEnemigo.costo;
    }
  }

  obtenerEnemigos() {
    return this.enemigosDeLaOleada;
  }

  update() {
    this.tiempoSiguienteSpawn -= this.juego.deltaTime;
    if (this.tiempoSiguienteSpawn <= 0) {
      const enemigo = this.enemigosDeLaOleada.pop();
      if (enemigo) {
        enemigo.activar();
        this.tiempoSiguienteSpawn = this.intervaloSpawn;
      }
    }
  }
}