/**
 * Gestiona las pantallas previas al juego:
 * pantalla de carga, menú principal y panel de opciones.
 *
 * Uso:
 *   const menu = new MenuManager(juego)
 *   menu.mostrarMenuPrincipal()   // llamar después de juego.init()
 */
class MenuManager {
  constructor(juego) {
    this.juego = juego;

    // Valores base de volumen por canal (antes del escalado maestro)
    this.volMaster     = 1.0;
    this.volMusicaBase = juego.gestorDeAudio.canales.Musica;  // 1.0
    this.volFxBase     = juego.gestorDeAudio.canales.Efectos; // 0.8

    // Cargar volúmenes guardados si existen
    this._cargarVolumenes();

    // Referencias al DOM
    this.elLoadingScreen = document.getElementById('loading-screen');
    this.elMainMenu      = document.getElementById('main-menu');
    this.elOptionsPanel  = document.getElementById('options-panel');
    this.elFadeOverlay   = document.getElementById('fade-overlay');
    this.elStartInteractionScreen = document.getElementById('start-interaction-screen');
    this.btnJugar    = document.getElementById('btn-jugar');
    this.btnOpciones = document.getElementById('btn-opciones');
    this.btnVolver   = document.getElementById('btn-volver');
    this.btnReanudar = document.getElementById('btn-reanudar');
    this.elOptionsTitle = document.getElementById('options-title');

    this.sliderGeneral = document.getElementById('vol-general');
    this.sliderMusica  = document.getElementById('vol-musica');
    this.sliderFx      = document.getElementById('vol-fx');

    this._inicializarSliders();
    this._vincularEventos();
    this._aplicarVolumenes();
  }

  // ─── Helpers privados ──────────────────────────────────────────────────────

  /** Carga los volúmenes guardados en localStorage. */
  _cargarVolumenes() {
    try {
      const saved = localStorage.getItem('towerDefense_volume_options');
      if (saved) {
        const config = JSON.parse(saved);
        if (config.volMaster !== undefined) this.volMaster = config.volMaster;
        if (config.volMusicaBase !== undefined) this.volMusicaBase = config.volMusicaBase;
        if (config.volFxBase !== undefined) this.volFxBase = config.volFxBase;
      }
    } catch (e) {
      console.error('Error al cargar volúmenes de localStorage:', e);
    }
  }

  /** Guarda los volúmenes actuales en localStorage. */
  _guardarVolumenes() {
    try {
      const config = {
        volMaster: this.volMaster,
        volMusicaBase: this.volMusicaBase,
        volFxBase: this.volFxBase
      };
      localStorage.setItem('towerDefense_volume_options', JSON.stringify(config));
    } catch (e) {
      console.error('Error al guardar volúmenes en localStorage:', e);
    }
  }

  /** Sincroniza los sliders con los valores iniciales del gestor de audio. */
  _inicializarSliders() {
    this.sliderGeneral.value = this.volMaster;
    this.sliderMusica.value  = this.volMusicaBase;
    this.sliderFx.value      = this.volFxBase;
  }

  /**
   * Escribe los volúmenes efectivos (master × base) en el gestor de audio.
   * Se llama cada vez que cambia cualquier slider.
   */
  _aplicarVolumenes() {
    const c = this.juego.gestorDeAudio.canales;
    c.Musica   = this.volMaster * this.volMusicaBase;
    c.Efectos  = this.volMaster * this.volFxBase;
    c.Interfaz = this.volMaster * this.volFxBase;

    this.juego.gestorDeAudio.actualizarVolumenMusica();
    this._guardarVolumenes();
  }

  _vincularEventos() {
    this.btnJugar.addEventListener('click',    () => this._onJugar());
    this.btnOpciones.addEventListener('click', () => this._onOpciones());
    this.btnVolver.addEventListener('click',   () => this._onVolver());

    this.sliderGeneral.addEventListener('input', () => {
      this.volMaster = parseFloat(this.sliderGeneral.value);
      this._aplicarVolumenes();
    });

    this.sliderMusica.addEventListener('input', () => {
      this.volMusicaBase = parseFloat(this.sliderMusica.value);
      this._aplicarVolumenes();
    });

    this.sliderFx.addEventListener('input', () => {
      this.volFxBase = parseFloat(this.sliderFx.value);
      this._aplicarVolumenes();
    });

    if (this.btnReanudar) {
      this.btnReanudar.addEventListener('click', () => {
        this.juego.reanudar();
      });
    }
  }

  _mostrar(el) { el.style.display = 'flex'; }
  _ocultar(el) { el.style.display = 'none'; }

  prepararModoOpciones() {
    this.elOptionsPanel.classList.remove('pause-mode');
    if (this.elOptionsTitle) this.elOptionsTitle.textContent = "Options";
    this._mostrar(this.btnVolver);
    this._ocultar(this.btnReanudar);
  }

  prepararModoPausa() {
    this.elOptionsPanel.classList.add('pause-mode');
    if (this.elOptionsTitle) this.elOptionsTitle.textContent = "Game Paused";
    this._ocultar(this.btnVolver);
    this._mostrar(this.btnReanudar);
  }

  _onOpciones() {
    this.prepararModoOpciones();
    this._ocultar(this.elMainMenu);
    this._mostrar(this.elOptionsPanel);
  }

  _onVolver() {
    this._ocultar(this.elOptionsPanel);
    this._mostrar(this.elMainMenu);
  }

  _onJugar() {
    // Deshabilitar botones de inmediato para evitar dobles clicks
    this.btnJugar.disabled    = true;
    this.btnOpciones.disabled = true;

    // Marcar el inicio del juego de inmediato para que el click no active la música del menú en navegadores restringidos
    this.juego.gestorDeAudio.juegoComenzado = true;

    // Desvanecer la música del menú e intro
    this.juego.gestorDeAudio.fadeMenuMusicAndIntro(550);

    // Bloquear interacción durante el fade
    this.elFadeOverlay.style.pointerEvents = 'all';

    // Fade a negro
    this.elFadeOverlay.style.opacity = '1';

    this.elFadeOverlay.addEventListener('transitionend', () => {
      // El juego ya está cargado: arrancarlo y ocultar el menú
      this._ocultar(this.elMainMenu);
      this.juego.comenzarJuego();

      // Desvanecer el overlay para revelar el juego
      this.elFadeOverlay.style.opacity = '0';

      this.elFadeOverlay.addEventListener('transitionend', () => {
        this.elFadeOverlay.style.pointerEvents = 'none';
      }, { once: true });

    }, { once: true });
  }

  // ─── API pública ───────────────────────────────────────────────────────────

  /** Oculta la pantalla de carga y muestra el menú principal. */
  mostrarMenuPrincipal() {
    this._ocultar(this.elLoadingScreen);

    if (this.elStartInteractionScreen) {
      this._mostrar(this.elStartInteractionScreen);
      
      const onFirstClick = () => {
        this.elStartInteractionScreen.removeEventListener('click', onFirstClick);
        this._ocultar(this.elStartInteractionScreen);
        this._mostrar(this.elMainMenu);
        
        // El usuario ha interactuado, reproducimos la música del menú directamente
        this.juego.gestorDeAudio.playStartAndMenuMusic();
      };
      
      this.elStartInteractionScreen.addEventListener('click', onFirstClick);
    } else {
      this._mostrar(this.elMainMenu);
      this.juego.gestorDeAudio.setupMenuMusicTrigger();
    }
  }
}

window.MenuManager = MenuManager;
