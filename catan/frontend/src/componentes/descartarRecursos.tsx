import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { RECURSOS, type Recurso, type Recursos } from '../common/jugador';
import { ICONO_RECURSO } from '../common/iconos';

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
        <Stack spacing={1} sx={{ mt: 2 }}>
          {RECURSOS.map((recurso) => {
            const disponibles = recursos?.[recurso] ?? 0;
            return (
              <Button
                key={recurso}
                type="button"
                variant="outlined"
                color="inherit"
                disabled={!esSuTurnoDeDescartar || enviando || disponibles < 1}
                onClick={() => onDescartar(recurso)}
                aria-label={`Descartar ${recurso}, disponibles: ${disponibles}`}
                sx={{ justifyContent: 'space-between', textTransform: 'capitalize' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src={ICONO_RECURSO[recurso]} alt="" width={28} height={28} />
                  {recurso}
                </span>
                <span>{disponibles}</span>
              </Button>
            );
          })}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default DescartarRecursos;
