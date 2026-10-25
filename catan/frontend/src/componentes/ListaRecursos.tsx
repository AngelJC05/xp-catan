import { RECURSOS } from '../common/jugador';
import { ICONO_RECURSO } from '../common/iconos';
import { describirRecursos } from '../common/partida';
import Icono from './Icono';

interface Props {
  recursos: Record<string, number> | undefined;
}

//? Muestra un lado de una oferta como íconos con su cantidad SVG x Cantidad
function ListaRecursos({ recursos }: Props) {
  const presentes = RECURSOS.filter((recurso) => (recursos?.[recurso] ?? 0) > 0);

  return (
    <span
      role="img"
      aria-label={describirRecursos(recursos)}
      title={describirRecursos(recursos)}
      className="d-inline-flex flex-wrap justify-content-center align-items-center gap-2"
    >
      {presentes.map((recurso) => (
        <span key={recurso} className="d-inline-flex align-items-center gap-1 fw-bold">
          <Icono ruta={ICONO_RECURSO[recurso]} tam={24} />
          x{recursos?.[recurso]}
        </span>
      ))}
    </span>
  );
}

export default ListaRecursos;
