import type { Recursos } from '../../../common/jugador';

export interface Banca {
  // Lo que le queda a la banca de cada recurso. Empieza en 19 de cada uno.
  recursos: Recursos;

  /* El mazo de cartas de desarrollo que queda por comprar. Es un arreglo, no
     un mapa: cada elemento es una carta. Lo que se muestra en pantalla es
     cuantas quedan, o sea banca.cartas.length. */
  cartas: number[];
}