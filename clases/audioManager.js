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
      explosion: [ 'assets/audio/explosion1.wav' ],
      grunido: ['assets/audio/grunt.ogg'],
      disparo: [ 'assets/audio/shot2.wav' ],
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

    // Estado de la música
    this.juegoComenzado = false;
    this.instanciaStartIntro = null;
    this.instanciaMenuMusic = null;
    this.instanciaBgMusic = null;
    this.instanciaGameOver = null;
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

    // Agregar recursos para la intro y música de fondo
    PIXI.sound.add('start_intro', 'assets/menu/start.wav');
    PIXI.sound.add('menu_music', 'assets/menu/menumusic.mp3');
    PIXI.sound.add('bg_music', 'assets/audio/bgmusic.wav');
    PIXI.sound.add('game_over', 'assets/audio/gameover.wav');
  }

  playStartAndMenuMusic() {
    PIXI.sound.stop('start_intro');
    PIXI.sound.stop('menu_music');

    this.actualizarVolumenMusica();

    PIXI.sound.play('start_intro', {
      volume: this.canales.Musica,
      loop: false,
      complete: () => {
        if (!this.juegoComenzado) {
          PIXI.sound.play('menu_music', {
            volume: this.canales.Musica,
            loop: true
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

  fadeOut(alias, durationMs = 500, onComplete = null) {
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

    PIXI.sound.stop('start_intro');
    PIXI.sound.stop('menu_music');
    PIXI.sound.stop('bg_music');

    this.actualizarVolumenMusica();

    PIXI.sound.play('bg_music', {
      volume: this.canales.Musica,
      loop: true
    });
  }

  pausarMusicaJuego() {
    PIXI.sound.pause('bg_music');
  }

  reanudarMusicaJuego() {
    if (this.juegoComenzado) {
      PIXI.sound.resume('bg_music');
    }
  }

  playGameOver() {
    this.juegoComenzado = false;

    PIXI.sound.stop('bg_music');
    PIXI.sound.stop('game_over');

    this.actualizarVolumenMusica();

    PIXI.sound.play('game_over', {
      volume: this.canales.Musica,
      loop: false
    });
  }

  actualizarVolumenMusica() {
    const vol = this.canales.Musica;
    if (PIXI.sound.exists('start_intro')) PIXI.sound.volume('start_intro', vol);
    if (PIXI.sound.exists('menu_music')) PIXI.sound.volume('menu_music', vol);
    if (PIXI.sound.exists('bg_music')) PIXI.sound.volume('bg_music', vol);
    if (PIXI.sound.exists('game_over')) PIXI.sound.volume('game_over', vol);
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
