import Alert, { type AlertProps } from '@mui/material/Alert';
import Button from '@mui/material/Button';

interface Props {
  caballero: null | 'eligiendo' | number;
  onCancelarCaballero: () => void;
  nombreGanador: string | null;
  enFaseCarreteras: boolean;
  esMiTurno: boolean;
  carreterasGratis: number;
  nombreJugadorEnTurno: string;
}

const POSICION = { position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 1 } as const;

function Aviso({ severity, action, children }: Pick<AlertProps, 'severity' | 'action' | 'children'>) {
  return <Alert severity={severity} sx={POSICION} action={action}>{children}</Alert>;
}

function AvisosTablero({
  caballero, onCancelarCaballero, nombreGanador, enFaseCarreteras, esMiTurno, carreterasGratis, nombreJugadorEnTurno,
}: Props) {
  return (
    <>
      {caballero !== null && (
        <Aviso
          severity="info"
          action={caballero === 'eligiendo' && (
            <Button color="inherit" size="small" onClick={onCancelarCaballero}>Cancelar</Button>
          )}
        >
          {caballero === 'eligiendo'
            ? 'Caballero: elige a qué hexágono mover al ladrón.'
            : 'Usando caballero…'}
        </Aviso>
      )}
      {nombreGanador !== null && (
        <Aviso severity="success">
          Partida finalizada: ganó <strong>{nombreGanador}</strong>. Usa "Salir" para dejar la sala.
        </Aviso>
      )}
      {enFaseCarreteras && (
        <Aviso severity="warning">
          {esMiTurno
            ? `Construcción de carreteras: elige una arista para colocar un camino gratis (te quedan ${carreterasGratis}). El resto de acciones está bloqueado.`
            : `${nombreJugadorEnTurno} está usando Construcción de carreteras.`}
        </Aviso>
      )}
    </>
  );
}

export default AvisosTablero;
