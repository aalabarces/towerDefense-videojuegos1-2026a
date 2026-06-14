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

    // Referencias al DOM
    this.elLoadingScreen = document.getElementById('loading-screen');
    this.elMainMenu      = document.getElementById('main-menu');
    this.elOptionsPanel  = document.getElementById('options-panel');
    this.elFadeOverlay   = document.getElementById('fade-overlay');

    this.btnJugar    = document.getElementById('btn-jugar');
    this.btnOpciones = document.getElementById('btn-opciones');
    this.btnVolver   = document.getElementById('btn-volver');

    this.sliderGeneral = document.getElementById('vol-general');
    this.sliderMusica  = document.getElementById('vol-musica');
    this.sliderFx      = document.getElementById('vol-fx');

    this._inicializarSliders();
    this._vincularEventos();
  }

  // ─── Helpers privados ──────────────────────────────────────────────────────

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
  }

  _mostrar(el) { el.style.display = 'flex'; }
  _ocultar(el) { el.style.display = 'none'; }

  _onOpciones() {
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
    this._mostrar(this.elMainMenu);
  }
}

window.MenuManager = MenuManager;
