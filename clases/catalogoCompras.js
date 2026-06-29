const CATALOGO_BOTONES = [
  {
    tipo: "torre",
    id: 1,
    url: "assets/sprites/torre1.png",
    nombreTextura: "torre1",
  },
  {
    tipo: "torre",
    id: 2,
    url: "assets/sprites/torre2.png",
    nombreTextura: "torre2",
  },
  {
    tipo: "torre",
    id: 3,
    url: "assets/sprites/torre3.png",
    nombreTextura: "torre3",
  },
  {
    tipo: "superBomba",
    id: 5,
    url: "assets/sprites/superbomb.png",
    nombreTextura: "torre5",
  },
  {
    tipo: "piedra",
    id: 1,
    url: "assets/sprites/rock1.png",
    nombreTextura: "rock1",
  },
  {
    tipo: "piedra",
    id: 2,
    url: "assets/sprites/rock2.png",
    nombreTextura: "rock2",
  },
  {
    tipo: "piedra",
    id: 3,
    url: "assets/sprites/rock3.png",
    nombreTextura: "rock3",
  },
  {
    tipo: "piedra",
    id: 4,
    url: "assets/sprites/rock4.png",
    nombreTextura: "rock4",
  },
];

function enriquecerCatalogo(config) {
  return CATALOGO_BOTONES.map((def) => ({
    ...def,
    precio: config.precioCompra(def.tipo, def.id),
  }));
}
