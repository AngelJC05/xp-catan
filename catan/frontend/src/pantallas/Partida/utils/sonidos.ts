const RUTAS = {
  dados: '/sounds/dice_roll.ogg',
  asentamiento: '/sounds/asentamiento.ogg',
  ciudad: '/sounds/ciudad.ogg',
  camino: '/sounds/camino.ogg',
  comprarCarta: '/sounds/comprarCarta.ogg',
  ladron: '/sounds/ladron.ogg',
  monopolio: '/sounds/monopolio.ogg',
  abundancia: '/sounds/abundancia.ogg',
  victoria: '/sounds/victoria.mp3',
} as const;

export type NombreSonido = keyof typeof RUTAS;

const sonidosCargados: Partial<Record<NombreSonido, HTMLAudioElement>> = {};

export function reproducirSonido(nombre: NombreSonido): void {
  const audio = (sonidosCargados[nombre] ??= new Audio(RUTAS[nombre]));

  audio.currentTime = 0;

  audio.play().catch(() => {});
}

// Para un sonido que se este reproduciendo, util para los largos como la victoria.
export function detenerSonido(nombre: NombreSonido): void {
  const audio = sonidosCargados[nombre];
  if (!audio) return;

  audio.pause();
  audio.currentTime = 0;
}
