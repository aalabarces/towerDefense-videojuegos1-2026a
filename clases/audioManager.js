class GestorDeAudio {
  constructor(juego) {
    this.juego = juego;
    
    // Volúmenes de los canales
    this.canales = {
      Musica: 1.0,
      Efectos: 0.8,
      Interfaz: 1.0
    };
    
    // Estructura unificada de datos de audio organizada por canal
    this.datosDeAudio = {
      Musica: {
        start_intro: ['assets/audio/music/start.wav'],
        menu_music: ['assets/audio/music/menumusic.mp3'],
        bg_music: ['assets/audio/music/bgmusic.wav'],
        game_over: ['assets/audio/music/gameover.wav']
      },
      Efectos: {
        colocarTorre: ['assets/audio/fx/place.wav'],
        explosion: [ 'assets/audio/fx/explosion1.wav' ],
        grunido: ['assets/audio/fx/grunt.ogg'],
        disparo: [ 'assets/audio/fx/shot2.wav' ],
        pasos: [
          'assets/audio/fx/steps1.wav',
          'assets/audio/fx/steps2.wav',
          'assets/audio/fx/steps3.wav',
          'assets/audio/fx/steps4.wav',
        ]
      },
      Interfaz: {
        click: ['assets/audio/ui/click1.wav'],
        slider: ['assets/audio/ui/click2.wav']
      }
    };

    // Límites de instancias por grupo de sonido
    this.limites = {
      click: 3,
      explosion: 5,
      grunido: 3,
      disparo: 4,
      pasos: 2
    };

    // Cooldown (ms) por grupo de sonido
    this.cooldowns = {
      click: 0,
      explosion: 50,
      grunido: 1000,
      disparo: 100,
      pasos: 400
    };

    this.ultimaVezReproducido = {};
    this.instanciasActivas = {};
    
    // Inicializar la lógica de seguimiento para todos los canales y grupos de audio
    for (const canal in this.datosDeAudio) {
      for (const grupo in this.datosDeAudio[canal]) {
        this.ultimaVezReproducido[grupo] = 0;
        this.instanciasActivas[grupo] = 0;
      }
    }

    // Estado de la música
    this.juegoComenzado = false;
    this.instanciaStartIntro = null;
    this.instanciaMenuMusic = null;
    this.instanciaBgMusic = null;
    this.instanciaGameOver = null;
  }

  async inicializar() {
    // Precargar todos los recursos de audio dinámicamente
    // Agregamos cada archivo con un ID único formateado como: nombreGrupo_indice
    for (const [canal, grupos] of Object.entries(this.datosDeAudio)) {
      for (const [grupo, rutas] of Object.entries(grupos)) {
        rutas.forEach((ruta, indice) => {
          const idSonido = `${grupo}_${indice}`;
          PIXI.sound.add(idSonido, ruta);
        });
      }
    }
  }

  playStartAndMenuMusic() {
    this.stopMusica('start_intro');
    this.stopMusica('menu_music');

    this.actualizarVolumenMusica();

    this.reproducirMusica('start_intro', {
      bucle: false,
      complete: () => {
        if (!this.juegoComenzado) {
          this.reproducirMusica('menu_music', {
            bucle: true
          });
        }
      }
    });
  }

  setupMenuMusicTrigger() {
    const iniciarMusicaMenu = () => {
      cleanup();
      if (!this.juegoComenzado) {
        this.playStartAndMenuMusic();
      }
    };
    const cleanup = () => {
      document.removeEventListener('click', iniciarMusicaMenu);
      document.removeEventListener('keydown', iniciarMusicaMenu);
      document.removeEventListener('touchstart', iniciarMusicaMenu);
    };
    document.addEventListener('click', iniciarMusicaMenu);
    document.addEventListener('keydown', iniciarMusicaMenu);
    document.addEventListener('touchstart', iniciarMusicaMenu);
  }

  // Desvanece todas las pistas asociadas a un grupo (de cualquier canal)
  fadeOut(grupo, durationMs = 500, onComplete = null) {
    // Buscar el grupo en cualquier canal
    let rutas = null;
    for (const canal in this.datosDeAudio) {
      if (this.datosDeAudio[canal][grupo]) {
        rutas = this.datosDeAudio[canal][grupo];
        break;
      }
    }

    if (!rutas) {
      // Fallback si es un alias directo ya registrado en PIXI.sound
      if (!PIXI.sound.exists(grupo)) {
        if (onComplete) onComplete();
        return;
      }
      this._fadeOutAlias(grupo, durationMs, onComplete);
      return;
    }

    let completados = 0;
    const total = rutas.length;

    rutas.forEach((_, indice) => {
      const alias = `${grupo}_${indice}`;
      this._fadeOutAlias(alias, durationMs, () => {
        completados++;
        if (completados === total && onComplete) {
          onComplete();
        }
      });
    });
  }

  // Método auxiliar interno para desvanecer un alias específico de PIXI.sound
  _fadeOutAlias(alias, durationMs, onComplete) {
    if (!PIXI.sound.exists(alias)) {
      if (onComplete) onComplete();
      return;
    }
    const volumenInicial = PIXI.sound.volume(alias);
    const pasoDesvanecimiento = volumenInicial / (durationMs / 16.6);
    let volumenActual = volumenInicial;
    const intervaloDesvanecimiento = setInterval(() => {
      volumenActual -= pasoDesvanecimiento;
      if (volumenActual <= 0) {
        PIXI.sound.volume(alias, 0);
        PIXI.sound.stop(alias);
        clearInterval(intervaloDesvanecimiento);
        if (onComplete) onComplete();
      } else {
        PIXI.sound.volume(alias, volumenActual);
      }
    }, 16.6);
  }

  fadeMenuMusicAndIntro(durationMs = 500) {
    this.fadeOut('start_intro', durationMs);
    this.fadeOut('menu_music', durationMs);
  }

  comenzarMusicaJuego() {
    this.juegoComenzado = true;

    this.stopMusica('start_intro');
    this.stopMusica('menu_music');
    this.stopMusica('bg_music');

    this.actualizarVolumenMusica();

    this.reproducirMusica('bg_music', {
      bucle: true
    });
  }

  // Métodos genéricos de control de audio por canal
  stopAudio(grupo, nombreCanal) {
    const canal = this.datosDeAudio[nombreCanal];
    if (canal && canal[grupo]) {
      canal[grupo].forEach((_, indice) => {
        PIXI.sound.stop(`${grupo}_${indice}`);
      });
    }
  }

  pausarAudio(grupo, nombreCanal) {
    const canal = this.datosDeAudio[nombreCanal];
    if (canal && canal[grupo]) {
      canal[grupo].forEach((_, indice) => {
        PIXI.sound.pause(`${grupo}_${indice}`);
      });
    }
  }

  reanudarAudio(grupo, nombreCanal) {
    const canal = this.datosDeAudio[nombreCanal];
    if (canal && canal[grupo]) {
      canal[grupo].forEach((_, indice) => {
        PIXI.sound.resume(`${grupo}_${indice}`);
      });
    }
  }

  // Envoltorios (wrappers) para compatibilidad con la música
  stopMusica(grupo) {
    this.stopAudio(grupo, 'Musica');
  }

  pausarMusica(grupo) {
    this.pausarAudio(grupo, 'Musica');
  }

  reanudarMusica(grupo) {
    this.reanudarAudio(grupo, 'Musica');
  }

  pausarMusicaJuego() {
    this.pausarMusica('bg_music');
  }

  reanudarMusicaJuego() {
    if (this.juegoComenzado) {
      this.reanudarMusica('bg_music');
    }
  }

  playGameOver() {
    this.juegoComenzado = false;

    this.stopMusica('bg_music');
    this.stopMusica('game_over');

    this.actualizarVolumenMusica();

    this.reproducirMusica('game_over', {
      bucle: false
    });
  }

  actualizarVolumenMusica() {
    const vol = this.canales.Musica;
    const canalMusica = this.datosDeAudio.Musica;
    for (const grupo in canalMusica) {
      canalMusica[grupo].forEach((_, indice) => {
        const alias = `${grupo}_${indice}`;
        if (PIXI.sound.exists(alias)) {
          PIXI.sound.volume(alias, vol);
        }
      });
    }
  }

  reproducir(grupo, nombreCanal = 'Efectos', opciones = {}) {
    const diccionario = this.datosDeAudio[nombreCanal];

    if (!diccionario || !diccionario[grupo]) {
        console.warn(`Grupo de audio ${grupo} no encontrado en el canal ${nombreCanal}`);
        return null;
    }

    const ahora = performance.now();
    
    // Verificar cooldown (por defecto 0 si no se especifica)
    const cooldown = this.cooldowns[grupo] !== undefined ? this.cooldowns[grupo] : 0;
    if (ahora - this.ultimaVezReproducido[grupo] < cooldown) {
        return null;
    }

    // Verificar límites (por defecto Infinity si no se especifica)
    const limite = this.limites[grupo] !== undefined ? this.limites[grupo] : Infinity;
    if (this.instanciasActivas[grupo] >= limite) {
        return null;
    }

    // Elegir un sonido aleatorio del grupo
    const rutas = diccionario[grupo];
    const indice = Math.floor(Math.random() * rutas.length);
    const idSonido = `${grupo}_${indice}`;

    this.ultimaVezReproducido[grupo] = ahora;
    this.instanciasActivas[grupo]++;

    const volumenBase = this.canales[nombreCanal] !== undefined ? this.canales[nombreCanal] : 1;
    const opcionesReproduccion = {
      volume: (opciones.volumen !== undefined ? opciones.volumen : 1) * volumenBase,
      loop: opciones.bucle !== undefined ? opciones.bucle : (opciones.loop !== undefined ? opciones.loop : false),
      speed: opciones.speed || 1,
      complete: () => {
        this.instanciasActivas[grupo]--;
        if (opciones.complete) {
          opciones.complete();
        }
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
