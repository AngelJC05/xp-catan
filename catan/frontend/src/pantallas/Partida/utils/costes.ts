import { ICONO_CARTA_DESARROLLO, ICONO_PIEZA } from '../../../common/iconos';
import { NOMBRE_PIEZA, PIEZA, type Recurso } from '../../../common/jugador';

// Lo que cuesta cada pieza y la carta de desarrollo. Lo usan la tabla de
// costos y la guia de ayuda.
type Fila = { icono: string; nombre: string; costes: Recurso[] };

export const FILAS: Fila[] = [
  { icono: ICONO_PIEZA[PIEZA.CAMINO], nombre: NOMBRE_PIEZA[PIEZA.CAMINO],
    costes: ['madera', 'ladrillo'] },
  { icono: ICONO_PIEZA[PIEZA.ASENTAMIENTO], nombre: NOMBRE_PIEZA[PIEZA.ASENTAMIENTO],
    costes: ['madera', 'trigo', 'lana', 'ladrillo'] },
  { icono: ICONO_PIEZA[PIEZA.CIUDAD], nombre: NOMBRE_PIEZA[PIEZA.CIUDAD],
    costes: ['trigo', 'trigo', 'mineral', 'mineral', 'mineral'] },
  { icono: ICONO_CARTA_DESARROLLO, nombre: 'Carta de desarrollo',
    costes: ['trigo', 'lana', 'mineral'] },
];
