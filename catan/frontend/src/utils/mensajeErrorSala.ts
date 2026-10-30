import { ERROR_CODIGO_INCORRECTO } from "./validacionSala";

export function mensajeDeError(error: unknown, accion: "crear" | "unirse"): string {
  const texto = error instanceof Error ? error.message : String(error ?? "");

  if (/c[oó]digo de acceso/i.test(texto)) return ERROR_CODIGO_INCORRECTO;

  if (/locked|full|not found|no rooms found/i.test(texto)) {
    return "La sala ya no está disponible: puede que esté llena o que haya cerrado.";
  }

  if (/fetch|network|ECONNREFUSED|Failed/i.test(texto)) {
    return "No se pudo conectar con el servidor. Revisa que el backend esté encendido.";
  }
  
  return accion === "crear" ? "No se pudo crear la sala. Intenta de nuevo." : "No se pudo entrar a la sala.";
}
