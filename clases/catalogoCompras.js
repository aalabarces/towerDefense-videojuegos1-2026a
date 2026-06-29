const CATALOGO_BOTONES = [
  {
    tipo: "torre",
    id: 1,
    url: "assets/sprites/torre1.png",
    nombreTextura: "torre1",
    precio: 100,
  },
  {
    tipo: "torre",
    id: 2,
    url: "assets/sprites/torre2.png",
    nombreTextura: "torre2",
    precio: 150,
  },
  {
    tipo: "torre",
    id: 3,
    url: "assets/sprites/torre3.png",
    nombreTextura: "torre3",
    precio: 250,
  },
  // {
  //   tipo: "torre",
  //   id: 4,
  //   url: "assets/sprites/torre4.png",
  //   nombreTextura: "torre4",
  //   precio: 405,
  // },
  {
    tipo: "superBomba",
    id: 5,
    url: "assets/sprites/torre5.png",
    nombreTextura: "torre5",
    precio: 500,
  },
  {
    tipo: "piedra",
    id: 1,
    url: "assets/sprites/rock1.png",
    nombreTextura: "rock1",
    precio: 15,
  },
  {
    tipo: "piedra",
    id: 2,
    url: "assets/sprites/rock2.png",
    nombreTextura: "rock2",
    precio: 15,
  },
  {
    tipo: "piedra",
    id: 3,
    url: "assets/sprites/rock3.png",
    nombreTextura: "rock3",
    precio: 15,
  },
  {
    tipo: "piedra",
    id: 4,
    url: "assets/sprites/rock4.png",
    nombreTextura: "rock4",
    precio: 15,
  },
];

function precioCompra(tipo, id) {
  const item = CATALOGO_BOTONES.find(
    (boton) => boton.tipo === tipo && boton.id === id,
  );
  return item ? item.precio : 0;
}
