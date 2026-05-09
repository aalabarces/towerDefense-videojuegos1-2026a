const CATALOGO_BOTONES = [
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

function precioCompra(tipo, id) {
  const item = CATALOGO_BOTONES.find(
    (boton) => boton.tipo === tipo && boton.id === id,
  );
  return item ? item.precio : 0;
}
