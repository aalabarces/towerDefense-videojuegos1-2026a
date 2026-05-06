class Nivel {
  constructor(juego) {
    this.juego = juego;
    this.nodosDelCamino = [
      {
        x: 6876,
        y: 3840,
      },
      {
        x: 6246,
        y: 3393,
      },
      {
        x: 5800,
        y: 2850,
      },
      {
        x: 5483,
        y: 2070,
      },
      {
        x: 5586,
        y: 1558,
      },
      {
        x: 5950,
        y: 1205,
      },
      {
        x: 6183,
        y: 855,
      },
      {
        x: 5683,
        y: 505,
      },
      {
        x: 4553,
        y: 300,
      },
      {
        x: 3566,
        y: 483,
      },
      {
        x: 2900,
        y: 720,
      },
      {
        x: 2700,
        y: 1056,
      },
      {
        x: 2950,
        y: 1400,
      },
      {
        x: 3650,
        y: 1540,
      },
      {
        x: 3870,
        y: 1900,
      },
      {
        x: 3376,
        y: 2450,
      },
      {
        x: 3725,
        y: 2896,
      },
      {
        x: 4309,
        y: 3186,
      },
      {
        x: 3720,
        y: 3613,
      },
      {
        x: 2840,
        y: 3600,
      },
      {
        x: 2460,
        y: 3200,
      },
      {
        x: 2030,
        y: 1913,
      },
      {
        x: 1820,
        y: 683,
      },
      {
        x: 1110,
        y: 520,
      },
      {
        x: 820,
        y: 1980,
      },
    ];
  }

  spawnEnemigo() {
    this.juego.spawnEnemigo(
      MUNDO_ANCHO * 1.02 + Math.random() * 100,
      MUNDO_ALTO * 1.02 + Math.random() * 100,
    );
  }
  update() {
    const ahora = performance.now();
    // console.log(ahora);
    if (ahora > 0 && ahora < 5000) {
    } else if (ahora > 5000 && ahora < 7000) {
      this.spawnEnemigo();
    }
  }
}
