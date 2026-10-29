import { Card } from 'react-bootstrap';
import { ICONO_CARTA_DESARROLLO, ICONO_PIEZA, ICONO_RECURSO } from '../../../common/iconos';
import { NOMBRE_PIEZA, PIEZA, type Recurso } from '../../../common/jugador';

type Coste = { recurso: Recurso; cantidad?: number };
type Fila = { icono: string; nombre: string; costes: Coste[] };

const FILAS: Fila[] = [
  { icono: ICONO_PIEZA[PIEZA.CAMINO], nombre: NOMBRE_PIEZA[PIEZA.CAMINO],
    costes: [{ recurso: 'madera' }, { recurso: 'ladrillo' }] },
  { icono: ICONO_PIEZA[PIEZA.ASENTAMIENTO], nombre: NOMBRE_PIEZA[PIEZA.ASENTAMIENTO],
    costes: [{ recurso: 'madera' }, { recurso: 'trigo' }, { recurso: 'lana' }, { recurso: 'ladrillo' }] },
  { icono: ICONO_PIEZA[PIEZA.CIUDAD], nombre: NOMBRE_PIEZA[PIEZA.CIUDAD],
    costes: [{ recurso: 'trigo', cantidad: 2 }, { recurso: 'mineral', cantidad: 3 }] },
  { icono: ICONO_CARTA_DESARROLLO, nombre: 'Carta de desarrollo',
    costes: [{ recurso: 'trigo' }, { recurso: 'lana' }, { recurso: 'mineral' }] },
];

function TablaCostes() {
  return (
    <Card className="h-100 w-100 overflow-y-auto overflow-x-hidden d-flex flex-column">
      <h3 className="text-center fs-6 fw-bold border-bottom mb-0 py-1">Costes</h3>

      <div className="d-flex flex-column justify-content-around flex-fill p-1">
        {FILAS.map(({ icono, nombre, costes }) => (
          <div key={nombre} className="d-flex align-items-center gap-1" title={nombre}>
            <img src={icono} alt={nombre} width={22} height={22} />
            <span className="text-body-secondary">:</span>
            {costes.map(({ recurso, cantidad }) => (
              <span key={recurso} className="d-flex align-items-center">
                {cantidad && <small>{cantidad}</small>}
                <img src={ICONO_RECURSO[recurso]} alt={recurso} width={20} height={20} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

export default TablaCostes;
