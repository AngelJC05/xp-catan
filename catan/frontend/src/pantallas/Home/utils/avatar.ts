//* Tonos oscuros de los terrenos del tablero, para que las iniciales blancas se lean bien
const COLORES_AVATAR = ["#2f6b3f", "#b64e36", "#b07a1f", "#176977", "#5d6773"];

//? Convierte un nombre en un color de la paleta, el mismo nombre siempre da el mismo color
export function colorParaNombre(nombre: string): string {
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + hash * 31;
  }
  return COLORES_AVATAR[Math.abs(hash) % COLORES_AVATAR.length];
}

//? Devuelve las iniciales de las dos primeras palabras
export function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join("");
}
