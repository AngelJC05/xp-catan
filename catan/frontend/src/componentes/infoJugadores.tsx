import type { Jugadores } from '../common/jugador';
import { totalCartas, totalRecursos, enRiesgoDeDescarte, colorDeJugador } from '../common/jugador';

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
    <div className="d-flex gap-1 w-100 h-100">
      {lista.map((id) => {
        const j = jugadores[id];
        if (!j) return null;

        const yo = id === miSessionId;

        return (
          <div
            key={id}
            style={{ backgroundColor: colorDeJugador(lista, id) }}
            className="flex-fill min-w-0 overflow-hidden p-1 px-2 rounded-3 d-flex flex-column justify-content-center text-white border-0"
          >
            <div className="d-flex align-items-center gap-1 min-w-0">
              <span className="flex-grow-1 text-truncate text-white fw-semibold">
                {yo && '(Yo) '}{j.nombre}
              </span>
              <span className="fw-bold flex-shrink-0 text-white">{j.puntuacion}/10</span>
            </div>
            <div className="d-flex justify-content-between text-white">
              <span title="Cartas de desarrollo en la mano, usables mas inusables">
                {totalCartas(j)} cartas
              </span>
              <span
                title="Caballeros jugados. Decide el ejercito mas grande"
                className={id === ejercitoMasGrande ? 'text-warning fw-bold' : 'text-white'}
              >
                {j.caballerosJugados} caballeros
              </span>
              <span
                title="Largo de su camino mas largo. Con 5 o mas puede tener el titulo"
                className={id === caminoMasLargo ? 'text-warning fw-bold' : 'text-white'}
              >
                Camino: {j.longitudCamino}
              </span>
              <span
                title="Cartas de recurso en la mano"
                className={enRiesgoDeDescarte(j) ? 'text-warning fw-bold' : 'text-white'}
              >
                {totalRecursos(j)} recursos
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default InfoJugadores;