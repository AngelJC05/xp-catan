import type { ReactNode } from 'react';
import {
  ICONO_CARTA, ICONO_CARTA_DESARROLLO, ICONO_PIEZA, ICONO_RECURSO, ICONO_RECURSOS, ICONO_UI,
} from '../../../../common/iconos';
import { CARTA, NOMBRE_CARTA, PIEZA, RECURSOS } from '../../../../common/jugador';
import { FILAS } from '../../utils/costes';
import { Lista, Regla } from './Regla';

/* Paginas de la guia de ayuda. El texto vive aparte de la ventana para que,
   si cambia una regla en el backend, solo haya que tocar este archivo. */

export interface PaginaAyuda {
  titulo: string;
  icono: string;
  contenido: ReactNode;
}

const TODOS_LOS_RECURSOS = RECURSOS.map((recurso) => ICONO_RECURSO[recurso]);

export const PAGINAS: PaginaAyuda[] = [
  {
    titulo: 'Objetivo',
    icono: ICONO_UI.trofeo,
    contenido: (
      <>
        <p>Gana quien llegue primero a <strong>10 puntos</strong>. Los puntos se consiguen así:</p>
        <Lista>
          <Regla iconos={[ICONO_PIEZA[PIEZA.ASENTAMIENTO]]}>Cada asentamiento: 1 punto.</Regla>
          <Regla iconos={[ICONO_PIEZA[PIEZA.CIUDAD]]}>Cada ciudad: 2 puntos.</Regla>
          <Regla iconos={[ICONO_CARTA[CARTA.PUNTOS_VICTORIA]]}>Cada carta de punto de victoria: 1 punto.</Regla>
          <Regla iconos={[ICONO_UI.trofeo]}>Los títulos de Camino más largo y Ejército más grande: 2 puntos cada uno.</Regla>
        </Lista>
      </>
    ),
  },
  {
    titulo: 'Inicio de la partida',
    icono: ICONO_PIEZA[PIEZA.ASENTAMIENTO],
    contenido: (
      <Lista>
        <Regla iconos={[ICONO_PIEZA[PIEZA.ASENTAMIENTO], ICONO_PIEZA[PIEZA.CAMINO]]}>
          Antes de jugar, cada jugador coloca gratis 2 asentamientos, cada uno con un camino pegado.
        </Regla>
        <Regla iconos={[ICONO_UI.adelante, ICONO_UI.atras]}>
          Primero se coloca en orden de turno y después de regreso: quien pone el último
          asentamiento de la ida pone el primero de la vuelta.
        </Regla>
        <Regla iconos={[ICONO_RECURSOS]}>
          Tu segundo asentamiento te da un recurso de cada terreno que lo rodea.
        </Regla>
        <Regla iconos={[ICONO_UI.espera]}>
          Cada pieza tiene un tiempo límite. Si se acaba, el juego la coloca por ti en un lugar al azar.
        </Regla>
      </Lista>
    ),
  },
  {
    titulo: 'Turno y dados',
    icono: ICONO_RECURSOS,
    contenido: (
      <Lista>
        <Regla iconos={TODOS_LOS_RECURSOS}>
          Al empezar tu turno tiras los dados. Cada terreno con ese número da su recurso a
          quien tenga construcciones en sus esquinas: 1 por asentamiento y 2 por ciudad.
        </Regla>
        <Regla iconos={[ICONO_PIEZA[PIEZA.CAMINO], ICONO_UI.aceptarOferta, ICONO_CARTA_DESARROLLO]}>
          Después puedes construir, comerciar y usar cartas, en el orden que quieras, y
          terminas tu turno.
        </Regla>
        <Regla iconos={[ICONO_CARTA[CARTA.CABALLERO]]}>
          Si sale un 7 nadie recibe recursos. Quien tenga más de 7 recursos descarta la
          mitad, y el jugador en turno mueve el ladrón y le roba un recurso a alguien que
          tenga construcciones junto a ese terreno.
        </Regla>
        <Regla iconos={[ICONO_RECURSOS]}>
          El terreno donde está el ladrón no da recursos hasta que lo muevan.
        </Regla>
      </Lista>
    ),
  },
  {
    titulo: 'Construcción',
    icono: ICONO_PIEZA[PIEZA.CIUDAD],
    contenido: (
      <>
        <Lista>
          {FILAS.map(({ icono, nombre, costes }) => (
            <Regla key={nombre} iconos={[icono]}>
              <span className="d-flex align-items-center flex-wrap gap-1">
                {nombre}:
                {costes.map((recurso, i) => (
                  <img key={i} src={ICONO_RECURSO[recurso]} alt={recurso} width={20} height={20} />
                ))}
              </span>
            </Regla>
          ))}
        </Lista>
        <hr />
        <Lista>
          <Regla iconos={[ICONO_PIEZA[PIEZA.CAMINO]]}>Los caminos deben salir de tus caminos o construcciones.</Regla>
          <Regla iconos={[ICONO_PIEZA[PIEZA.ASENTAMIENTO]]}>
            Un asentamiento va conectado a uno de tus caminos y sin otro asentamiento en las esquinas de al lado.
          </Regla>
          <Regla iconos={[ICONO_PIEZA[PIEZA.CIUDAD]]}>La ciudad se construye sobre uno de tus asentamientos.</Regla>
          <Regla iconos={[ICONO_UI.llave]}>Cada jugador tiene 15 caminos, 5 asentamientos y 4 ciudades.</Regla>
        </Lista>
      </>
    ),
  },
  {
    titulo: 'Cartas de desarrollo',
    icono: ICONO_CARTA_DESARROLLO,
    contenido: (
      <>
        <p>Se compran con 1 trigo, 1 lana y 1 mineral. Puede salir cualquiera de estas:</p>
        <Lista>
          <Regla iconos={[ICONO_CARTA[CARTA.CABALLERO]]}>
            <strong>{NOMBRE_CARTA[CARTA.CABALLERO]}:</strong> mueves el ladrón y robas un recurso.
          </Regla>
          <Regla iconos={[ICONO_CARTA[CARTA.PUNTOS_VICTORIA]]}>
            <strong>{NOMBRE_CARTA[CARTA.PUNTOS_VICTORIA]}:</strong> suma 1 punto en cuanto la compras.
          </Regla>
          <Regla iconos={[ICONO_CARTA[CARTA.CARRETERAS]]}>
            <strong>{NOMBRE_CARTA[CARTA.CARRETERAS]}:</strong> construyes 2 caminos gratis.
          </Regla>
          <Regla iconos={[ICONO_CARTA[CARTA.ABUNDANCIA]]}>
            <strong>{NOMBRE_CARTA[CARTA.ABUNDANCIA]}:</strong> tomas 2 recursos de la banca, iguales o distintos.
          </Regla>
          <Regla iconos={[ICONO_CARTA[CARTA.MONOPOLIO]]}>
            <strong>{NOMBRE_CARTA[CARTA.MONOPOLIO]}:</strong> eliges un recurso y todos te dan los que tengan de él.
          </Regla>
        </Lista>
        <p className="mt-3 mb-0">
          Solo puedes usar una carta por turno, y nunca la que compraste en ese mismo turno.
        </p>
      </>
    ),
  },
  {
    titulo: 'Comercio',
    icono: ICONO_UI.aceptarOferta,
    contenido: (
      <Lista>
        <Regla iconos={[ICONO_RECURSO.ladrillo, ICONO_UI.adelante, ICONO_RECURSO.lana]}>
          En tu turno, después de tirar los dados, puedes publicar una oferta para los demás
          jugadores: qué recursos das y cuáles pides.
        </Regla>
        <Regla iconos={[ICONO_UI.aceptarOferta, ICONO_UI.rechazarOferta]}>
          El primero que la acepte hace el cambio contigo. Si todos la rechazan, se cancela.
        </Regla>
        <Regla iconos={[ICONO_RECURSO.madera, ICONO_UI.adelante, ICONO_RECURSO.trigo]}>
          También puedes cambiar con la banca: das 4 recursos iguales y recibes 1 del tipo
          que elijas. Con un puerto te sale más barato.
        </Regla>
      </Lista>
    ),
  },
  {
    titulo: 'Puertos',
    icono: ICONO_RECURSO.lana,
    contenido: (
      <>
        <p>
          Los puertos están en la costa. Si tienes un asentamiento o una ciudad en una
          esquina de un puerto, cambias con la banca más barato. En el tablero los ves
          como etiquetas 3:1 y 2:1.
        </p>
        <Lista>
          <Regla iconos={[ICONO_RECURSOS]}>Puerto genérico: das 3 recursos iguales por 1.</Regla>
          <Regla iconos={[ICONO_RECURSO.lana]}>
            Puerto de un recurso: das 2 de ese recurso por 1. Por ejemplo, un puerto de lana
            te deja cambiar 2 lanas.
          </Regla>
        </Lista>
      </>
    ),
  },
  {
    titulo: 'Títulos de puntos extra',
    icono: ICONO_UI.trofeo,
    contenido: (
      <>
        <Lista>
          <Regla iconos={[ICONO_PIEZA[PIEZA.CAMINO]]}>
            <strong>Camino más largo:</strong> lo obtiene el primero que tenga 5 o más caminos seguidos.
          </Regla>
          <Regla iconos={[ICONO_CARTA[CARTA.CABALLERO]]}>
            <strong>Ejército más grande:</strong> lo obtiene el primero que juegue 3 o más caballeros.
          </Regla>
        </Lista>
        <p className="mt-3 mb-0">
          Cada título vale 2 puntos y solo lo tiene un jugador a la vez. Si alguien te supera,
          te lo quita junto con sus puntos.
        </p>
      </>
    ),
  },
];
