import { version } from "../../../../package.json";

//? Versión de la portada en formato un poco mas cortito
export const VERSION_PORTADA = version.split(".").slice(0, 2).join(".");
