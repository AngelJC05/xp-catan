import type { Jugadores } from '../common/jugador';
import { colorDelJugador } from '../common/jugador';

interface Props {
  sessionIdTurno: string;
  jugadores: Jugadores;
}

function InfoTurno({ sessionIdTurno, jugadores }: Props) {
  const nombre = jugadores[sessionIdTurno]?.nombre;
  const color = colorDelJugador(jugadores, sessionIdTurno);

  return (
    <div
      className="flex-fill w-100 rounded overflow-hidden text-white
                 d-flex flex-column justify-content-center align-items-center"
      style={{ backgroundColor: color }}
      role="status"
      aria-live="polite"
    >
      <span className="small">Turno de</span>
      <span className="fw-bold text-truncate mw-100 px-2">{nombre ?? '—'}</span>
    </div>
  );
}

export default InfoTurno;