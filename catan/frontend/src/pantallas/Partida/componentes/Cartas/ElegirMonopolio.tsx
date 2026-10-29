import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import type { Recurso, Recursos } from '../../../../common/jugador';
import SelectorRecurso from '../../../../componentes/SelectorRecurso';

/* Mismo diseno que ElegirAbundancia.tsx (cartas de SelectorRecurso), pero con
   un solo recurso: todos los demas jugadores le dan al que juega la carta todo
   lo que tengan de ese recurso. */

interface Props {
  abierto: boolean;
  enviando: boolean;
  misRecursos: Recursos;
  onCerrar: () => void;
  onConfirmar: (recurso: Recurso) => void;
}

function ElegirMonopolio({ abierto, enviando, misRecursos, onCerrar, onConfirmar }: Props) {
  const [recurso, setRecurso] = useState<Recurso | null>(null);

  const puedeConfirmar = !enviando && recurso !== null;

  return (
    <Dialog open={abierto} onClose={enviando ? undefined : onCerrar} fullWidth maxWidth="xs">
      <DialogTitle>Carta de monopolio</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Elige un recurso: todos los demás jugadores te darán todo lo que tengan de ese recurso.
        </DialogContentText>
        <SelectorRecurso
          elegidos={recurso ? { [recurso]: 1 } : {}}
          cantidad={(r) => misRecursos[r]}
          deshabilitado={(r) => enviando || (recurso !== null && r !== recurso)}
          onPulsar={(r) => setRecurso(r)}
        />
      </DialogContent>
      <DialogActions>
        <Button type="button" onClick={() => setRecurso(null)} disabled={enviando || recurso === null}>
          Limpiar
        </Button>
        <Button type="button" onClick={onCerrar} disabled={enviando}>Cancelar</Button>
        <Button type="button" variant="contained" disabled={!puedeConfirmar}
          onClick={() => {
            if (recurso && puedeConfirmar) onConfirmar(recurso);
          }}>
          {enviando ? 'Pidiendo…' : 'Pedir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ElegirMonopolio;
