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
    this.crearDivTimer();
  }

  crearBotones() {
    for (let i = 0; i < this.botones.length; i++) {
      const cualBoton = this.botones[i];
      this.crearBoton(cualBoton);
    }
  }

  crearBoton(cualBoton) {
    const container = document.createElement("div");
    container.classList.add("contenedor-botoncito");

    const button = document.createElement("button");

    button.data = cualBoton;
    cualBoton.buttonElement = button;
    button.style.backgroundImage = "url(" + cualBoton.url + ")";

    button.setAttribute("numero-de-boton", cualBoton.id);

    button.classList.add("botoncito");

    const priceLabel = document.createElement("span");
    priceLabel.classList.add("precio-botoncito");
    priceLabel.textContent = "$" + cualBoton.precio;

    container.appendChild(button);
    container.appendChild(priceLabel);

    this.contenedorHTML.appendChild(container);

    button.onclick = (event) => {
      this.juego.quitarFantasma();
      event.stopPropagation();

      this.juego.gestorDeAudio.reproducirInterfaz('clic');

      if (cualBoton.tipo === "superBomba") {
        if (this.juego.usuario.plata < cualBoton.precio) return;
        this.juego.usuario.plata -= cualBoton.precio;
        this.juego.tirarSuperBomba();
        return;
      }

      this.juego.crearSpriteFantasma(button.data);
    };
  }

  crearDivGameOver() {
    const div = document.createElement("div");
    div.style.display = "none";
    div.id = "game-over";
    this.gameOverDiv = div;
    document.body.appendChild(div);
  }

  crearDivPlata() {
    const div = document.createElement("div");
    div.id = "plata";
    document.body.appendChild(div);
    this.plataDiv = div;
  }

  crearDivTimer() {
    const div = document.createElement("div");
    div.id = "timer";
    div.textContent = "Time: 0s";
    document.body.appendChild(div);
    this.timerDiv = div;
  }

  actualizarTimer() {
    if (!this.timerDiv) return;
    const segundos = Math.floor(this.juego.tiempoSobrevivido);
    this.timerDiv.textContent = `Time: ${segundos}s`;
  }

  getHighscores() {
    try {
      const data = localStorage.getItem("towerDefense_highscores");
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  qualifiesForHighscore(time) {
    const scores = this.getHighscores();
    if (scores.length < 5) return true;
    return time > scores[scores.length - 1].time;
  }

  saveHighscore(initials, time) {
    let scores = this.getHighscores();
    scores.push({ initials: initials.toUpperCase().slice(0, 3) || "???", time: Math.floor(time) });
    scores.sort((a, b) => b.time - a.time);
    scores = scores.slice(0, 5);
    localStorage.setItem("towerDefense_highscores", JSON.stringify(scores));
  }

  renderHighscoresList(newHighscoreIndex = -1) {
    const listEl = document.getElementById("highscores-list");
    if (!listEl) return;
    listEl.innerHTML = "";
    
    const scores = this.getHighscores();
    
    // Fill up to 5 entries
    for (let i = 0; i < 5; i++) {
      const itemEl = document.createElement("li");
      itemEl.className = "highscore-item";
      if (i === newHighscoreIndex) {
        itemEl.classList.add("highlighted");
      }
      
      const rankEl = document.createElement("span");
      rankEl.className = "highscore-rank";
      rankEl.textContent = `${i + 1}. `;
      
      const score = scores[i];
      if (score) {
        const initialsEl = document.createElement("span");
        initialsEl.className = "highscore-initials";
        initialsEl.textContent = score.initials;
        
        const timeEl = document.createElement("span");
        timeEl.className = "highscore-time";
        timeEl.textContent = `${score.time}s`;
        
        itemEl.appendChild(rankEl);
        itemEl.appendChild(initialsEl);
        itemEl.appendChild(timeEl);
      } else {
        const initialsEl = document.createElement("span");
        initialsEl.className = "highscore-initials";
        initialsEl.textContent = "---";
        
        const timeEl = document.createElement("span");
        timeEl.className = "highscore-time";
        timeEl.textContent = "0s";
        
        itemEl.appendChild(rankEl);
        itemEl.appendChild(initialsEl);
        itemEl.appendChild(timeEl);
      }
      
      listEl.appendChild(itemEl);
    }
  }

  renderGameOverContent() {
    const finalSeconds = Math.floor(this.juego.tiempoSobrevivido);
    
    this.gameOverDiv.innerHTML = `
      <div class="game-over-container">
        <h1 class="game-over-title">Defeat</h1>
        <p class="game-over-stats">You survived for <span>${finalSeconds}</span> seconds</p>
        
        <div id="highscore-entry-section" class="highscore-input-section" style="display: none;">
          <p class="highscore-input-msg">New Highscore! Enter your initials:</p>
          <div class="highscore-input-row">
            <input type="text" id="initials-input" maxlength="3" placeholder="AAA" autofocus />
            <button id="save-highscore-btn">Save</button>
          </div>
        </div>

        <div class="highscores-container">
          <h2 class="highscores-title">Leaderboard</h2>
          <ul class="highscores-list" id="highscores-list"></ul>
        </div>

        <div class="game-over-buttons">
          <button class="game-over-btn game-over-btn--primary" onclick="window.location.reload()">Replay</button>
        </div>
      </div>
    `;

    this.renderHighscoresList();

    const qualifies = this.qualifiesForHighscore(finalSeconds);
    if (qualifies) {
      const entrySection = document.getElementById("highscore-entry-section");
      if (entrySection) entrySection.style.display = "flex";

      const saveBtn = document.getElementById("save-highscore-btn");
      const initialsInput = document.getElementById("initials-input");

      const performSave = () => {
        const initials = (initialsInput.value || "AAA").toUpperCase().slice(0, 3);
        this.saveHighscore(initials, finalSeconds);
        
        // Find the index of the newly inserted score to highlight it
        const updatedScores = this.getHighscores();
        const newIndex = updatedScores.findIndex(s => s.initials === initials && s.time === finalSeconds);
        
        this.renderHighscoresList(newIndex);
        
        if (entrySection) entrySection.style.display = "none";
      };

      if (saveBtn) {
        saveBtn.onclick = performSave;
      }
      if (initialsInput) {
        initialsInput.onkeydown = (e) => {
          if (e.key === "Enter") {
            performSave();
          }
        };
      }
    }
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
    this.actualizarTimer();
  }

  actualizarPlata() {
    if (!this.plataDiv) return;
    this.plataDiv.textContent = "$ " + this.juego.usuario.plata;
    this.actualizarBotonesSegunPlata();
  }

  mostrarGameOver() {
    document.body.classList.add("game-over");
    this.gameOverDiv.style.display = "flex";
    this.contenedorHTML.style.display = "none";
    if (this.timerDiv) this.timerDiv.style.display = "none";
    this.renderGameOverContent();
  }

  toggleDebug() {
    this.juego.toggleDebug();
  }
}
