// Se usa sessionStorage (igual que sesionGuardada.ts) para que el nombre
// sobreviva a una recarga y cada pestaña siga siendo un jugador distinto.
const CLAVE = "catan:nombre";

export function leerNombreJugador(): string {
  try {
    return sessionStorage.getItem(CLAVE) ?? "";
  } catch {
    return "";
  }
}

export function guardarNombreJugador(nombre: string) {
  try {
    sessionStorage.setItem(CLAVE, nombre);
  } catch {
    // Sin almacenamiento se vuelve a pedir el nombre al recargar.
  }
}

export const LARGO_MINIMO_NOMBRE = 2;
export const LARGO_MAXIMO_NOMBRE = 20;

// Devuelve el mensaje de error, o null si el nombre es válido.
export function validarNombreJugador(nombre: string): string | null {
  const limpio = nombre.trim();

  if (!limpio) return "Escribe un nombre para continuar.";
  if (limpio.length < LARGO_MINIMO_NOMBRE) {
    return `El nombre debe tener al menos ${LARGO_MINIMO_NOMBRE} caracteres.`;
  }
  if (limpio.length > LARGO_MAXIMO_NOMBRE) {
    return `El nombre no puede superar los ${LARGO_MAXIMO_NOMBRE} caracteres.`;
  }

  return null;
}
