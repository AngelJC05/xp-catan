import type { Jugadores } from '../../../common/jugador';
import { totalCartas, totalRecursos, enRiesgoDeDescarte, colorDelJugador, CARTA, PIEZA } from '../../../common/jugador';
import { COLOR, colorTextoSobre } from '../../../common/colores';
import { ICONO_CARTA, ICONO_CARTA_DESARROLLO, ICONO_PIEZA, ICONO_RECURSOS } from '../../../common/iconos';
import ContadorIcono from './comunes/ContadorIcono';

interface Props {
  jugadores: Jugadores;
  ordenJugadores: string[];
  miSessionId: string;
  ejercitoMasGrande: string;
  caminoMasLargo: string;
}

function InfoJugadores({
  jugadores,
  ordenJugadores,
  miSessionId,
  ejercitoMasGrande,
  caminoMasLargo,
}: Props) {
  const lista = ordenJugadores.length ? ordenJugadores : Object.keys(jugadores);

  return (
    <div className="d-grid gap-1 w-100" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
      {lista.map((id) => {
        const j = jugadores[id];
        if (!j) return null;

        const yo = id === miSessionId;
        const tieneEjercito = id === ejercitoMasGrande;
        const tieneCamino = id === caminoMasLargo;
        const enRiesgo = enRiesgoDeDescarte(j);

        return (
          <div
            key={id}
            className="min-w-0 overflow-hidden rounded-3 border d-flex flex-column bg-white"
          >
            <div
              style={{
                backgroundColor: colorDelJugador(jugadores, id),
                color: colorTextoSobre(j.color ?? COLOR.SIN_COLOR),
              }}
              className="d-flex align-items-center gap-1 min-w-0 px-2"
            >
              <span className="flex-grow-1 text-truncate fw-semibold">
                {yo && '(Yo) '}{j.nombre}
              </span>
              <span className="fw-bold flex-shrink-0">{j.puntuacion}/10</span>
            </div>

            <div className="d-flex flex-wrap justify-content-around align-items-center column-gap-1 px-1 py-1">
              <ContadorIcono
                icono={ICONO_CARTA_DESARROLLO}
                cantidad={totalCartas(j)}
                descripcion="Cartas de desarrollo en la mano, usables más inusables"
                tam={20}
                claseCantidad="fw-normal"
              />
              <ContadorIcono
                icono={ICONO_CARTA[CARTA.CABALLERO]}
                cantidad={j.caballerosJugados}
                descripcion={tieneEjercito
                  ? 'Caballeros jugados. Tiene el ejército más grande'
                  : 'Caballeros jugados. Deciden el ejército más grande'}
                tam={20}
                claseCantidad={tieneEjercito ? 'fw-bold' : 'fw-normal'}
              />
              <ContadorIcono
                icono={ICONO_PIEZA[PIEZA.CAMINO]}
                cantidad={j.longitudCamino}
                descripcion={tieneCamino
                  ? 'Largo de su camino más largo. Tiene el título de camino más largo'
                  : 'Largo de su camino más largo. Con 5 o más puede tener el título'}
                tam={20}
                claseCantidad={tieneCamino ? 'fw-bold' : 'fw-normal'}
              />
              <ContadorIcono
                icono={ICONO_RECURSOS}
                cantidad={totalRecursos(j)}
                descripcion={enRiesgo
                  ? 'Cartas de recurso en la mano. Con más de 7, si sale un 7 descarta la mitad'
                  : 'Cartas de recurso en la mano'}
                tam={20}
                claseCantidad={enRiesgo ? 'fw-bold text-danger' : 'fw-normal'}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default InfoJugadores;
