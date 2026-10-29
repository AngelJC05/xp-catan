// Guarda lo necesario para volver a la sala si se recarga la pestaña.
// Se usa sessionStorage (no localStorage) porque es propio de cada pestaña:
// así dos pestañas abiertas siguen siendo dos jugadores distintos y una no
// le "roba" el asiento a la otra al recargar.

const CLAVE = "catan:sesion";

// Datos de la sala que el cliente no puede leer del estado del servidor
// (el alias y la privacidad viven en la metadata del listado).
export interface InfoSala {
  alias: string;
  privada: boolean;
  // Solo lo conoce quien creó la sala o quien entró escribiéndolo.
  codigoAcceso?: string;
}

export interface SesionGuardada extends InfoSala {
  // room.reconnectionToken, con formato "roomId:token".
  token: string;
}

// sessionStorage puede lanzar (modo privado, almacenamiento bloqueado):
// en ese caso simplemente no hay reconexión, pero la app no se rompe.
export function leerSesion(): SesionGuardada | null {
  try {
    const texto = sessionStorage.getItem(CLAVE);
    if (!texto) return null;
    const sesion = JSON.parse(texto) as Partial<SesionGuardada>;
    if (typeof sesion.token !== "string" || !sesion.token.includes(":")) return null;
    return {
      token: sesion.token,
      alias: typeof sesion.alias === "string" ? sesion.alias : "",
      privada: sesion.privada === true,
      codigoAcceso: typeof sesion.codigoAcceso === "string" ? sesion.codigoAcceso : undefined,
    };
  } catch {
    return null;
  }
}

export function guardarSesion(sesion: SesionGuardada) {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(sesion));
  } catch {
    // Sin almacenamiento no hay reconexión; el juego sigue funcionando.
  }
}

// El servidor puede entregar un token nuevo tras una reconexión automática.
export function actualizarToken(token: string) {
  const actual = leerSesion();
  if (actual) guardarSesion({ ...actual, token });
}

export function borrarSesion() {
  try {
    sessionStorage.removeItem(CLAVE);
  } catch {
    // Nada que limpiar.
  }
}
