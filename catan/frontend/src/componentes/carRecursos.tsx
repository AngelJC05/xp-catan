import { Card } from 'react-bootstrap';
import type { Jugador } from '../common/jugador';
import { RECURSOS } from '../common/jugador';
import { ICONO_RECURSO, ICONO_RECURSOS } from '../common/iconos';
import ContadorIcono from './ContadorIcono';
import Icono from './Icono';

interface Props {
  miJugador?: Jugador;
}

const conMayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

function CarRecursos({ miJugador }: Props) {
  return (
    <Card className="h-100 w-100 overflow-y-auto overflow-x-hidden d-flex flex-column">
      <h3 className="text-center fs-6 fw-bold border-bottom mb-0 py-1">
        <Icono ruta={ICONO_RECURSOS} className="me-1" />Mis recursos
      </h3>

      {miJugador ? (
        <div className="d-flex flex-column justify-content-center flex-fill p-2">
          {/* Cuadricula de 3 columnas, igual que la banca */}
          <div className="row row-cols-3 g-2">
            {RECURSOS.map((recurso) => (
              <div key={recurso} className="col d-flex justify-content-center">
                <ContadorIcono
                  icono={ICONO_RECURSO[recurso]}
                  cantidad={miJugador.recursos[recurso]}
                  descripcion={`${conMayuscula(recurso)} que tienes`}
                  tam={28}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-muted text-center my-auto">sin jugador</p>
      )}
    </Card>
  );
}

export default CarRecursos;
