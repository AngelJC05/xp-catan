import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import type { Recurso, Recursos } from '../../../../common/jugador';
import SelectorRecurso from '../comunes/SelectorRecurso';

interface Props {
  abierto: boolean;
  puedeIntercambiar: boolean;
  enviando: boolean;
  recursosJugador: Recursos;
  recursosBanca: Recursos;
  onAbrir: () => void;
  onCerrar: () => void;
  onConfirmar: (entregado: Recurso, recibido: Recurso) => void;
}

function IntercambioBanca({
  abierto, puedeIntercambiar, enviando, recursosJugador, recursosBanca,
  onAbrir, onCerrar, onConfirmar,
}: Props) {
  const [entregado, setEntregado] = useState<Recurso | null>(null);
  const [recibido, setRecibido] = useState<Recurso | null>(null);

  function abrir() {
    setEntregado(null);
    setRecibido(null);
    onAbrir();
  }

  // funcion que recibe un recurso actual y uno con el cual comparar, si son iguales devuelve null o si son distintos el recurso comparado
  const alternar = (actual: Recurso | null, recurso: Recurso) => (actual === recurso ? null : recurso);

  const puedeConfirmar = puedeIntercambiar && !enviando
    && entregado !== null && recibido !== null;

  return (
    <>
      <Button type="button" variant="outlined" size="small" fullWidth
        disabled={!puedeIntercambiar} onClick={abrir}>
        Banca
      </Button>

      <Dialog open={abierto} onClose={enviando ? undefined : onCerrar} fullWidth maxWidth="xs">
        <DialogTitle>Intercambio con la banca</DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Elige qué recurso entregas y cuál recibes. La banca calcula si necesitas
            2, 3 o 4 según tus puertos.
          </DialogContentText>

          <Stack spacing={2} sx={{ pt: 1 }}>
            <SelectorRecurso
              titulo="DOY"
              elegidos={entregado ? { [entregado]: 1 } : {}}
              cantidad={(recurso) => recursosJugador[recurso]}
              deshabilitado={(recurso) => enviando || recursosJugador[recurso] === 0 || recurso === recibido}
              onPulsar={(recurso) => setEntregado(alternar(entregado, recurso))}
            />
            <SelectorRecurso
              titulo="QUIERO"
              elegidos={recibido ? { [recibido]: 1 } : {}}
              cantidad={(recurso) => recursosBanca[recurso]}
              deshabilitado={(recurso) => enviando || recursosBanca[recurso] === 0 || recurso === entregado}
              onPulsar={(recurso) => setRecibido(alternar(recibido, recurso))}
            />
          </Stack>
        </DialogContent>
        
        <DialogActions>
          <Button type="button" onClick={onCerrar} disabled={enviando}>Cancelar</Button>
          <Button type="button" variant="contained" disabled={!puedeConfirmar}
            onClick={() => {
              if (entregado && recibido && puedeConfirmar) onConfirmar(entregado, recibido);
            }}>
            {enviando ? 'Intercambiando…' : 'Intercambiar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default IntercambioBanca;
