class GestorDeAudio {
  constructor(juego) {
    this.juego = juego;
    
    // Volúmenes de los canales
    this.canales = {
      Musica: 1.0,
      Efectos: 0.8,
      Interfaz: 1.0
    };
    
    this.datosDeSonidos = {
      clic: ['assets/audio/click1.wav'],
      explosion: [
        'assets/audio/explosion1.wav',
        'assets/audio/exlposion2.wav',
        'assets/audio/explosion3.mp3',
        'assets/audio/explosion4.wav'
      ],
      grunido: ['assets/audio/grunt.ogg'],
      disparo: [
        'assets/audio/shot1.wav',
        'assets/audio/shot2.wav',
      ],
      pasos: [
        'assets/audio/steps1.wav',
        'assets/audio/steps2.wav',
        'assets/audio/steps3.wav',
        'assets/audio/steps4.wav',
      ]
    };

    // Límites de instancias por grupo de sonido
    this.limites = {
      clic: 3,
      explosion: 5,
      grunido: 3,
      disparo: 4,
      pasos: 2
    };

    // Cooldown (ms) por grupo de sonido
    this.cooldowns = {
      clic: 0,
      explosion: 50,
      grunido: 1000,
      disparo: 100,
      pasos: 400
    };

    this.ultimaVezReproducido = {};
    this.instanciasActivas = {};
    
    // Inicializar la lógica de seguimiento
    for (let clave in this.datosDeSonidos) {
      this.ultimaVezReproducido[clave] = 0;
      this.instanciasActivas[clave] = 0;
    }
  }

  async inicializar() {
    // Precargar sonidos a través de PIXI.sound.add
    // Los agregamos con un ID formateado como: nombreGrupo_indice
    for (const [grupo, rutas] of Object.entries(this.datosDeSonidos)) {
      rutas.forEach((ruta, indice) => {
        const idSonido = `${grupo}_${indice}`;
        PIXI.sound.add(idSonido, ruta);
      });
    }
  }

  reproducir(grupo, nombreCanal = 'Efectos', opciones = {}) {
    if (!this.datosDeSonidos[grupo]) {
        console.warn(`Grupo de sonido ${grupo} no encontrado`);
        return null;
    }

    const ahora = performance.now();
    // Verificar cooldown
    if (ahora - this.ultimaVezReproducido[grupo] < this.cooldowns[grupo]) {
        return null;
    }

    // Verificar límites
    if (this.instanciasActivas[grupo] >= this.limites[grupo]) {
        return null;
    }

    // Elegir un sonido aleatorio del grupo
    const rutas = this.datosDeSonidos[grupo];
    const indice = Math.floor(Math.random() * rutas.length);
    const idSonido = `${grupo}_${indice}`;

    this.ultimaVezReproducido[grupo] = ahora;
    this.instanciasActivas[grupo]++;

    const volumenBase = this.canales[nombreCanal] || 1;
    const opcionesReproduccion = {
      volume: (opciones.volumen !== undefined ? opciones.volumen : 1) * volumenBase,
      loop: opciones.bucle || false,
      speed: opciones.speed || 1,
      complete: () => {
        this.instanciasActivas[grupo]--;
      }
    };

    const instancia = PIXI.sound.play(idSonido, opcionesReproduccion);
    
    // Manejar fadeIn si hace falta
    if (instancia && opciones.fadeIn) {
        const volumenObjetivo = opcionesReproduccion.volume;
        instancia.volume = 0;
        
        let volumenActual = 0;
        const pasoDesvanecimiento = volumenObjetivo / (opciones.fadeIn / 16.6); // ~60fps
        const intervaloDesvanecimiento = setInterval(() => {
            volumenActual += pasoDesvanecimiento;
            if (volumenActual >= volumenObjetivo) {
                instancia.volume = volumenObjetivo;
                clearInterval(intervaloDesvanecimiento);
            } else {
                instancia.volume = volumenActual;
            }
        }, 16.6);
    }

    return instancia;
  }

  reproducirInterfaz(grupo, opciones = {}) {
    return this.reproducir(grupo, 'Interfaz', opciones);
  }

  reproducirEfecto(grupo, opciones = {}) {
    return this.reproducir(grupo, 'Efectos', opciones);
  }

  reproducirMusica(grupo, opciones = {}) {
    return this.reproducir(grupo, 'Musica', opciones);
  }
}

window.GestorDeAudio = GestorDeAudio;
