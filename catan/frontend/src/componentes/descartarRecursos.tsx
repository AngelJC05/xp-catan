import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import type { Recurso, Recursos } from '../common/jugador';
import SelectorRecurso from './SelectorRecurso';

interface Props {
  pendientes: number;
  recursos?: Recursos;
  esSuTurnoDeDescartar: boolean;
  enviando: boolean;
  onDescartar: (recurso: Recurso) => void;
}

function DescartarRecursos({
  pendientes, recursos, esSuTurnoDeDescartar, enviando, onDescartar,
}: Props) {
  const disponibles = (recurso: Recurso) => recursos?.[recurso] ?? 0;

  return (
    <Dialog open={pendientes > 0} fullWidth maxWidth="xs" aria-labelledby="descartar-titulo">
      <DialogTitle id="descartar-titulo">Descartar recursos</DialogTitle>
      <DialogContent>
        <Typography role="status">
          Te falta descartar {pendientes} {pendientes === 1 ? 'recurso' : 'recursos'}.
        </Typography>
        {!esSuTurnoDeDescartar && (
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Espera a que el jugador anterior termine de descartar.
          </Typography>
        )}
        {/* Cada carta pulsada descarta uno de ese recurso, sin confirmacion */}
        <div className="mt-3">
          <SelectorRecurso
            elegidos={{}}
            porFila={3}
            cantidad={disponibles}
            deshabilitado={(recurso) => !esSuTurnoDeDescartar || enviando || disponibles(recurso) < 1}
            onPulsar={onDescartar}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DescartarRecursos;
