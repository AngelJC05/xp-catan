import { Card, ListGroup } from 'react-bootstrap';
import { ICONO_CARTA_DESARROLLO, ICONO_PIEZA, ICONO_RECURSO } from '../common/iconos';
import { PIEZA, type Recurso } from '../common/jugador';

type Coste = { recurso: Recurso; cantidad?: number };
type Fila = { icono: string; nombre: string; costes: Coste[] };

const FILAS: Fila[] = [
  { icono: ICONO_PIEZA[PIEZA.CAMINO], nombre: 'Carretera',
    costes: [{ recurso: 'madera' }, { recurso: 'ladrillo' }] },
  { icono: ICONO_PIEZA[PIEZA.ASENTAMIENTO], nombre: 'Poblado',
    costes: [{ recurso: 'madera' }, { recurso: 'trigo' }, { recurso: 'lana' }, { recurso: 'ladrillo' }] },
  { icono: ICONO_PIEZA[PIEZA.CIUDAD], nombre: 'Ciudad',
    costes: [{ recurso: 'trigo', cantidad: 2 }, { recurso: 'mineral', cantidad: 3 }] },
  { icono: ICONO_CARTA_DESARROLLO, nombre: 'Carta de desarrollo',
    costes: [{ recurso: 'trigo' }, { recurso: 'lana' }, { recurso: 'mineral' }] },
];

function TablaCostes() {
  return (
    <Card className="h-100 w-100 overflow-hidden d-flex flex-column">
      <Card.Header as="h2" className="text-center fs-5 shrink-0 py-1">
        Tabla de costes
      </Card.Header>
      <ListGroup variant="flush" className="flex-fill overflow-hidden d-flex flex-column">
        {FILAS.map(({ icono, nombre, costes }) => (
          <ListGroup.Item
            key={nombre}
            className="d-flex align-items-center flex-fill overflow-hidden min-w-0 py-0 px-1">
            <img src={icono} alt={nombre} width={32} height={32} />
            <span className="flex-grow-1 text-truncate ms-1">{nombre}</span>
            {costes.map(({ recurso, cantidad }) => (
              <span key={recurso} className="d-flex align-items-center">
                {cantidad && <span className="ms-1">{cantidad}</span>}
                <img src={ICONO_RECURSO[recurso]} alt="" width={32} height={32} />
              </span>
            ))}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card>
  );
}

export default TablaCostes;