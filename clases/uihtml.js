class UIHTML {
  constructor(juego) {
    this.juego = juego;

    this.contenedorHTML = document.createElement("div");
    this.contenedorHTML.id = "ui";

    document.body.appendChild(this.contenedorHTML);

    this.botones = CATALOGO_BOTONES.map((def) => ({ ...def }));

    this.crearBotones();
    this.crearDivGameOver();
    this.crearDivPlata();
  }

  crearBotones() {
    for (let i = 0; i < this.botones.length; i++) {
      const cualBoton = this.botones[i];
      this.crearBoton(cualBoton);
    }
  }

  crearBoton(cualBoton) {
    const button = document.createElement("button");

    button.data = cualBoton;
    cualBoton.buttonElement = button;
    button.style.backgroundImage = "url(" + cualBoton.url + ")";

    button.setAttribute("numero-de-boton", cualBoton.id);

    button.classList.add("botoncito");
    this.contenedorHTML.appendChild(button);

    button.onclick = (event) => {
      this.juego.quitarFantasma();
      event.stopPropagation();
      console.log(button.data);

      this.juego.gestorDeAudio.reproducirInterfaz("clic");
      this.juego.crearSpriteFantasma(button.data);
    };
  }

  crearDivGameOver() {
    const div = document.createElement("div");
    div.style.display = "none";
    div.id = "game-over";
    div.innerHTML = `
      <h1>Game Over</h1>
      <button onclick="window.location.reload()">Replay</button>
    `;

    this.gameOverDiv = div;
    document.body.appendChild(div);
  }

  crearDivPlata() {
    const div = document.createElement("div");
    div.id = "plata";
    document.body.appendChild(div);
    this.plataDiv = div;
  }

  actualizarBotonesSegunPlata() {
    for (let i = 0; i < this.botones.length; i++) {
      const cualBoton = this.botones[i];
      if (!cualBoton || !cualBoton?.buttonElement) continue;

      if (cualBoton.precio <= this.juego.usuario.plata) {
        this.botones[i].buttonElement.classList.add("activo");
      } else {
        this.botones[i].buttonElement.classList.remove("activo");
      }
    }
  }
  update() {
    this.actualizarPlata();
  }

  actualizarPlata() {
    if (!this.plataDiv) return;
    this.plataDiv.textContent = "$ " + this.juego.usuario.plata;
    this.actualizarBotonesSegunPlata();
  }

  mostrarGameOver() {
    document.body.classList.add("game-over");
    this.gameOverDiv.style.display = "block";
    this.contenedorHTML.style.display = "none";
  }
}
