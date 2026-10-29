import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Icono from '../../../componentes/Icono';
import { ICONO_UI } from '../../../common/iconos';

interface Props {
  onSalir: () => void;
}

function SalirPartida({ onSalir }: Props) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        type="button"
        className="btn btn-light btn-sm border text-danger fw-bold d-flex align-items-center gap-1"
        onClick={() => setAbierto(true)}
      >
        <Icono ruta={ICONO_UI.atras} tam={16} />
        Salir
      </button>

      <Dialog open={abierto} onClose={() => setAbierto(false)} fullWidth maxWidth="xs">
        <DialogTitle>¿Salir de la partida?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Si sales ahora dejarás la sala y la partida seguirá sin ti.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={() => setAbierto(false)}>Cancelar</Button>
          <Button type="button" variant="contained" color="error" onClick={onSalir}>Salir</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default SalirPartida;
