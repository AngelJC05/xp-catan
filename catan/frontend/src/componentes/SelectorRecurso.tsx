import type { Recurso } from '../common/jugador';
import { RECURSOS } from '../common/jugador';
import { ICONO_RECURSO } from '../common/iconos';
import Icono from './Icono';

interface Props {
  titulo?: string;
  // Cuantas veces se elige cada recurso
  elegidos: Partial<Record<Recurso, number>>;
  cantidad?: (recurso: Recurso) => number;
  deshabilitado?: (recurso: Recurso) => boolean;
  onPulsar: (recurso: Recurso) => void;
  // Cartas por fila; sin indicarlo van todas en una sola fila
  porFila?: number;
}

//* Fila con una carta pequeña por recurso. No decide las reglas de la elección,
//* solo muestra lo elegido y avisa cuando se pulsa una carta

function SelectorRecurso({ titulo, elegidos, cantidad, deshabilitado, onPulsar, porFila }: Props) {
  const tamFila = porFila ?? RECURSOS.length;
  const filas: Recurso[][] = [];
  for (let i = 0; i < RECURSOS.length; i += tamFila) {
    filas.push(RECURSOS.slice(i, i + tamFila));
  }

  return (
    <div>
      {titulo && <div className="text-center fw-bold mb-1">{titulo}</div>}
      <div className="d-flex flex-column gap-2">
        {filas.map((fila) => (
          <div key={fila.join('-')} className="d-flex justify-content-center gap-2">
            {fila.map((recurso) => {
              const veces = elegidos[recurso] ?? 0;
              return (
                <button
                  key={recurso}
                  type="button"
                  aria-pressed={veces > 0}
                  title={recurso}
                  disabled={deshabilitado?.(recurso)}
                  onClick={() => onPulsar(recurso)}
                  className={`btn btn-light border border-2 p-1 position-relative d-flex flex-column align-items-center ${
                    veces > 0 ? 'border-primary bg-primary-subtle' : ''
                  }`}
                >
                  <Icono ruta={ICONO_RECURSO[recurso]} tam={36} />
                  {cantidad && <small className="text-body-secondary">{cantidad(recurso)}</small>}
                  {veces > 1 && (
                    <span className="badge text-bg-primary position-absolute top-0 end-0">x{veces}</span>
                  )}
                  <span className="visually-hidden">{recurso}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SelectorRecurso;
