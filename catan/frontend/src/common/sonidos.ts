const RUTAS = {
  dados: '/sounds/dice_roll.ogg',
} as const;

export type NombreSonido = keyof typeof RUTAS;

const sonidosCargados: Partial<Record<NombreSonido, HTMLAudioElement>> = {};

export function reproducirSonido(nombre: NombreSonido): void {
  const audio = (sonidosCargados[nombre] ??= new Audio(RUTAS[nombre]));

  audio.currentTime = 0;

  audio.play().catch(() => {});
}
