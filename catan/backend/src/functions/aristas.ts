//? Funciones para moverse por el tablero entre caminos (aristas) y vertices usando sus claves "h,d,p"

//* Devuelve clave de los 2 vertices que une una carretera
export function extremosDeArista(clave: string): [string, string] {
    const [h, d, p] = clave.split(",").map(Number);
    if (p === 0) return [`${h},${d},0`, `${h + 1},${d},1`];
    if (p === 1) return [`${h},${d},0`, `${h},${d},1`];
    return [`${h},${d},1`, `${h - 1},${d + 1},0`];
}

//* Devuelve las claves de las carreteras que tocan un vertice
export function aristasDelVertice(clave: string): string[] {
    const [h, d, p] = clave.split(",").map(Number);
    if (p === 0) return [`${h},${d},0`, `${h},${d},1`, `${h + 1},${d - 1},2`];
    return [`${h},${d},1`, `${h},${d},2`, `${h - 1},${d},0`];
}
