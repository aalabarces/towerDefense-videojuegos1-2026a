class UIHTML {
  constructor(juego) {
    this.juego = juego;

    this.contenedorHTML = document.createElement("div");
    this.contenedorHTML.id = "ui";

    document.body.appendChild(this.contenedorHTML);

    this.botones = [
      {
        tipo: "torre",
        id: 1,
        url: "assets/torre1.png",
        nombreTextura: "torre1",
        precio: 100,
      },
      {
        tipo: "torre",
        id: 2,
        url: "assets/torre2.png",
        nombreTextura: "torre2",
        precio: 150,
      },
      {
        tipo: "torre",
        id: 3,
        url: "assets/torre3.png",
        nombreTextura: "torre3",
        precio: 250,
      },
      {
        tipo: "torre",
        id: 4,
        url: "assets/torre4.png",
        nombreTextura: "torre4",
        precio: 405,
      },
      {
        tipo: "torre",
        id: 5,
        url: "assets/torre5.png",
        nombreTextura: "torre5",
        precio: 660,
      },
      {
        tipo: "piedra",
        id: 1,
        url: "assets/rock1.png",
        nombreTextura: "rock1",
        precio: 50,
      },
      {
        tipo: "piedra",
        id: 2,
        url: "assets/rock2.png",
        nombreTextura: "rock2",
        precio: 50,
      },
      {
        tipo: "piedra",
        id: 3,
        url: "assets/rock3.png",
        nombreTextura: "rock3",
        precio: 50,
      },
      {
        tipo: "piedra",
        id: 4,
        url: "assets/rock4.png",
        nombreTextura: "rock4",
        precio: 50,
      },
    ];

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
    button.style.backgroundImage = "url(" + cualBoton.url + ")";

    button.setAttribute("numero-de-boton", cualBoton.id);

    button.classList.add("botoncito");
    this.contenedorHTML.appendChild(button);

    button.onclick = (event) => {
      this.juego.quitarFantasma();
      event.stopPropagation();
      //   const cual = button.getAttribute("numero-de-boton");
      //   console.log(cualBoton.url);
      console.log(button.data);

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

  actualizarPlata(plata) {
    if (!this.plataDiv) return;
    this.plataDiv.textContent = "$ " + (plata || 0);
  }

  mostrarGameOver() {
    document.body.classList.add("game-over");
    this.gameOverDiv.style.display = "block";
    this.contenedorHTML.style.display = "none";
  }
}
