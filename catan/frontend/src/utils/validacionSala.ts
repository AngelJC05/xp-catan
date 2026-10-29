export const LARGO_MINIMO_ALIAS = 4;
export const LARGO_MAXIMO_ALIAS = 20;
export const LARGO_MINIMO_CODIGO = 4;
export const LARGO_MAXIMO_CODIGO = 8;

// Navegacion devuelve este texto cuando el backend rechaza el código;
// Lobby lo reconoce para pedirlo (o volver a pedirlo).
export const ERROR_CODIGO_INCORRECTO = "El código de acceso es incorrecto.";

// \p{L} acepta letras con tilde y la ñ, \p{N} los dígitos.
const SOLO_LETRAS_NUMEROS_ESPACIOS = /^[\p{L}\p{N} ]+$/u;
const SOLO_LETRAS_NUMEROS = /^[\p{L}\p{N}]+$/u;

// Devuelve el mensaje de error, o null si el alias es válido.
// El alias se valida ya recortado: los espacios de los extremos no cuentan.
export function validarAlias(alias: string): string | null {
  const limpio = alias.trim();

  if (!limpio) return "Escribe un nombre para la sala.";
  if (limpio.length < LARGO_MINIMO_ALIAS) {
    return `El nombre de la sala debe tener al menos ${LARGO_MINIMO_ALIAS} caracteres.`;
  }
  if (limpio.length > LARGO_MAXIMO_ALIAS) {
    return `El nombre de la sala no puede superar los ${LARGO_MAXIMO_ALIAS} caracteres.`;
  }
  if (!SOLO_LETRAS_NUMEROS_ESPACIOS.test(limpio)) {
    return "Usa solo letras, números y espacios.";
  }

  return null;
}

// Devuelve el mensaje de error, o null si el código es válido.
export function validarCodigoAcceso(codigo: string): string | null {
  if (!codigo) return "Escribe un código de acceso.";
  if (/\s/.test(codigo)) return "El código no puede tener espacios.";
  if (codigo.length < LARGO_MINIMO_CODIGO) {
    return `El código debe tener al menos ${LARGO_MINIMO_CODIGO} caracteres.`;
  }
  if (codigo.length > LARGO_MAXIMO_CODIGO) {
    return `El código no puede superar los ${LARGO_MAXIMO_CODIGO} caracteres.`;
  }
  if (!SOLO_LETRAS_NUMEROS.test(codigo)) return "Usa solo letras y números.";

  return null;
}

// Alias sugerido a partir del nombre del jugador. Si el nombre tiene
// caracteres que el alias no admite, se quitan; si no queda algo válido,
// se deja vacío para que el jugador lo escriba.
export function aliasSugerido(nombreJugador: string): string {
  const base = `Sala de ${nombreJugador}`
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, LARGO_MAXIMO_ALIAS)
    .trim();
  return validarAlias(base) ? "" : base;
}
