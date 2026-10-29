import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { RECURSOS, type Recurso, type Recursos } from '../../../../common/jugador';
import SelectorRecurso from '../../../../componentes/SelectorRecurso';

/* Mismo diseno que intercambioBanca.tsx (cartas de SelectorRecurso), pero se
   eligen 2 recursos que se reciben gratis de la banca. Cada toque suma 1 y se
   puede pedir el mismo recurso dos veces si la banca tiene al menos 2. */

const MAXIMO = 2;

interface Props {
  abierto: boolean;
  enviando: boolean;
  recursosBanca: Recursos;
  onCerrar: () => void;
  onConfirmar: (recurso1: Recurso, recurso2: Recurso) => void;
}

function ElegirAbundancia({ abierto, enviando, recursosBanca, onCerrar, onConfirmar }: Props) {
  const [elegidos, setElegidos] = useState<Partial<Record<Recurso, number>>>({});

  // Lista con un recurso por cada toque, por ejemplo ['trigo', 'trigo'].
  const lista = RECURSOS.flatMap((recurso) => Array<Recurso>(elegidos[recurso] ?? 0).fill(recurso));
  const puedeConfirmar = !enviando && lista.length === MAXIMO;

  function pulsar(recurso: Recurso) {
    setElegidos((anterior) => ({ ...anterior, [recurso]: (anterior[recurso] ?? 0) + 1 }));
  }

  function cerrar() {
    setElegidos({});
    onCerrar();
  }

  return (
    <Dialog open={abierto} onClose={enviando ? undefined : cerrar} fullWidth maxWidth="xs">
      <DialogTitle>Carta de abundancia</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Elige 2 recursos que quieres recibir gratis de la banca. Pueden ser iguales.
        </DialogContentText>
        <SelectorRecurso
          elegidos={elegidos}
          cantidad={(recurso) => recursosBanca[recurso]}
          deshabilitado={(recurso) => enviando || lista.length >= MAXIMO
            || recursosBanca[recurso] <= (elegidos[recurso] ?? 0)}
          onPulsar={pulsar}
        />
      </DialogContent>
      <DialogActions>
        <Button type="button" onClick={() => setElegidos({})} disabled={enviando || lista.length === 0}>
          Limpiar
        </Button>
        <Button type="button" onClick={cerrar} disabled={enviando}>Cancelar</Button>
        <Button type="button" variant="contained" disabled={!puedeConfirmar}
          onClick={() => {
            if (puedeConfirmar) onConfirmar(lista[0], lista[1]);
          }}>
          {enviando ? 'Recibiendo…' : 'Recibir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ElegirAbundancia;
