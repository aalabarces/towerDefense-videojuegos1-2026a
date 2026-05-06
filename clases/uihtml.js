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
      },
      {
        tipo: "torre",
        id: 2,
        url: "assets/torre2.png",
        nombreTextura: "torre2",
      },
      {
        tipo: "torre",
        id: 3,
        url: "assets/torre3.png",
        nombreTextura: "torre3",
      },
      {
        tipo: "torre",
        id: 4,
        url: "assets/torre4.png",
        nombreTextura: "torre4",
      },
      {
        tipo: "torre",
        id: 5,
        url: "assets/torre5.png",
        nombreTextura: "torre5",
      },
      {
        tipo: "piedra",
        id: 1,
        url: "assets/rock1.png",
        nombreTextura: "rock1",
      },
      {
        tipo: "piedra",
        id: 2,
        url: "assets/rock2.png",
        nombreTextura: "rock2",
      },
      {
        tipo: "piedra",
        id: 3,
        url: "assets/rock3.png",
        nombreTextura: "rock3",
      },
      {
        tipo: "piedra",
        id: 4,
        url: "assets/rock4.png",
        nombreTextura: "rock4",
      },
    ];

    this.crearBotones();
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
      event.stopPropagation();
      //   const cual = button.getAttribute("numero-de-boton");
      //   console.log(cualBoton.url);
      console.log(button.data);

      this.juego.crearSpriteFantasma(button.data);
    };
  }
}
