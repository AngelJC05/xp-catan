import type { Recursos } from '../../../../common/jugador';
import { PIEZA } from '../../../../common/jugador';
import { ICONO_PIEZA } from '../../../../common/iconos';
import Icono from '../../../../componentes/Icono';

// Estos nombres se envían al backend. No usamos las etiquetas visibles para
// evitar que un cambio de texto rompa el protocolo entre cliente y servidor.
export type TipoConstruccion = 'camino' | 'poblado' | 'ciudad';

export interface ObjetivoConstruccion {
  h: number;
  d: number;
  p: number;
}

export interface SolicitudConstruccion {
  tipo: TipoConstruccion;
  objetivo: ObjetivoConstruccion;
}

interface OpcionConstruccion {
  tipo: TipoConstruccion;
  etiqueta: string;
  icono: string;
  ayuda: string;
  costo: Partial<Recursos>;
}

// Los mismos iconos de la tabla de costes.
const OPCIONES: OpcionConstruccion[] = [
  { tipo: 'camino', etiqueta: 'Camino', icono: ICONO_PIEZA[PIEZA.CAMINO], ayuda: 'Selecciona una arista del tablero', costo: { madera: 1, ladrillo: 1 } },
  { tipo: 'poblado', etiqueta: 'Poblado', icono: ICONO_PIEZA[PIEZA.ASENTAMIENTO], ayuda: 'Selecciona un vértice vacío del tablero', costo: { madera: 1, ladrillo: 1, lana: 1, trigo: 1 } },
  { tipo: 'ciudad', etiqueta: 'Ciudad', icono: ICONO_PIEZA[PIEZA.CIUDAD], ayuda: 'Selecciona uno de tus poblados', costo: { trigo: 2, mineral: 3 } },
];

interface Props {
  recursos: Recursos;
  esMiTurno: boolean;
  puedeConstruir: boolean;
  tipoPermitido?: TipoConstruccion | null;
  seleccion: TipoConstruccion | null;
  onSeleccionar: (tipo: TipoConstruccion | null) => void;
}

// El botón se desactiva antes de seleccionar, pero el servidor vuelve a
// comprobar los recursos para evitar que el cliente pueda falsificarlos.
function puedePagar(recursos: Recursos, costo: Partial<Recursos>) {
  return Object.entries(costo).every(([recurso, cantidad]) => {
    const clave = recurso as keyof Recursos;
    return recursos[clave] >= cantidad;
  });
}

function Construir({ recursos, esMiTurno, puedeConstruir, tipoPermitido = null, seleccion, onSeleccionar }: Props) {
  return (
    <section
      className="h-100 d-flex flex-column gap-2 p-2 overflow-y-auto bg-white border rounded-3"
      aria-labelledby="construir-titulo"
    >
      <div className="d-flex align-items-center justify-content-between gap-2">
        <h2 id="construir-titulo" className="fs-6 fw-bold mb-0">Construir</h2>
        <span className="small fw-bold text-body-secondary">{esMiTurno ? 'Tu turno' : 'Espera tu turno'}</span>
      </div>

      <div className="row row-cols-1 row-cols-sm-3 g-2">
        {OPCIONES.map((opcion) => {
        const habilitada = puedeConstruir && (tipoPermitido
            ? opcion.tipo === tipoPermitido
            : puedePagar(recursos, opcion.costo));
          const activa = seleccion === opcion.tipo;
          const ayuda = habilitada ? opcion.ayuda
            : puedeConstruir && !tipoPermitido ? 'Recursos insuficientes' : 'No disponible ahora';

          return (
            <div key={opcion.tipo} className="col">
              <button
                type="button"
                className={`btn btn-light border border-2 w-100 py-3 d-flex flex-column align-items-center gap-1 ${
                  activa ? 'border-primary bg-primary-subtle' : ''
                }`}
                disabled={!habilitada}
                aria-pressed={activa}
                title={`${opcion.etiqueta}: ${ayuda}`}
                onClick={() => onSeleccionar(activa ? null : opcion.tipo)}
              >
                <Icono ruta={opcion.icono} tam={40} />
                <span className="visually-hidden">{opcion.etiqueta}</span>
              </button>
            </div>
          );
        })}
      </div>

      {seleccion && (
        <p className="small text-primary-emphasis mb-0" role="status">
          Seleccionaste <b>{OPCIONES.find((opcion) => opcion.tipo === seleccion)?.etiqueta}</b>.
          Ahora elige el lugar en el tablero.
        </p>
      )}
    </section>
  );
}

export default Construir;