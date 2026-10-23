import { Badge, Button, Card, ListGroup } from 'react-bootstrap';
import type { Cartas, Jugador } from '../common/jugador';
import { CARTA, NOMBRE_CARTA } from '../common/jugador';
import { ICONO_CARTA } from '../common/iconos';

const CARTAS: (keyof Cartas)[] = [
  CARTA.CABALLERO,
  CARTA.PUNTOS_VICTORIA,
  CARTA.CARRETERAS,
  CARTA.ABUNDANCIA,
  CARTA.MONOPOLIO,
];

interface Props {
  miJugador?: Jugador;
  puedeComprar: boolean;
  comprando: boolean;
  onComprar: () => void;
  // Abre el menu para elegir que carta usar (componentes/UsarCarta.tsx).
  puedeUsarCarta: boolean;
  onUsarCarta: () => void;
}

function CarDesarrollo({ miJugador, puedeComprar, comprando, onComprar, puedeUsarCarta, onUsarCarta }: Props) {
  return (
    <Card className="h-100 w-100 overflow-hidden d-flex flex-column">
      <h3 className="text-center fs-6 fw-bold border-bottom mb-0 py-1">Mis cartas</h3>
      {miJugador ? (
        <>
          <ListGroup variant="flush" className="flex-fill overflow-y-auto" style={{ minHeight: 0 }}>
            {CARTAS.map((clave) => {
              const usables = miJugador.cartas_usables[clave];
              const nuevas = miJugador.cartas_inusables[clave];
              const esPuntoVictoria = clave === CARTA.PUNTOS_VICTORIA;
              return (
                <ListGroup.Item
                  key={clave}
                  title={esPuntoVictoria
                    ? 'Su efecto es inmediato y no se puede jugar'
                    : NOMBRE_CARTA[clave]}
                  className="d-flex align-items-center gap-2 py-0"
                >
                  <img src={ICONO_CARTA[clave]} alt={NOMBRE_CARTA[clave]} width={24} height={24} />
                  <span className="flex-grow-1 text-truncate">{NOMBRE_CARTA[clave]}</span>
                  {!esPuntoVictoria && nuevas > 0 && (
                    <Badge
                      bg="secondary"
                      title="Compradas este turno: se podrán usar hasta tu siguiente turno"
                    >
                      +{nuevas}
                    </Badge>
                  )}
                  <span className="fw-bold">{esPuntoVictoria ? usables + nuevas : usables}</span>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
          <div className="d-flex flex-shrink-0 gap-1">
            <Button
              variant="outline-primary"
              size="sm"
              disabled={!puedeComprar || comprando}
              onClick={onComprar}
              title="Costo: 1 trigo, 1 lana y 1 mineral"
              className="flex-fill m-0"
            >
              {comprando ? 'Comprando…' : 'Comprar carta'}
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={!puedeUsarCarta}
              onClick={onUsarCarta}
              title="Solo una carta por turno, en la fase de acciones"
              className="flex-fill m-0"
            >
              Usar carta
            </Button>
          </div>
        </>
      ) : (
        <p className="text-muted text-center my-auto">sin jugador</p>
      )}
    </Card>
  );
}

export default CarDesarrollo;
