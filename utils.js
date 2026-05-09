function distancia(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function distanciaCuadrada(obj1, obj2) {
  return (
    (obj2.posicion.x - obj1.posicion.x) ** 2 +
    (obj2.posicion.y - obj1.posicion.y) ** 2
  );
}
