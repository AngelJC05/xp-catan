import { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

interface Props {
  etiqueta: string;
  fin: number | null;
  ahora: () => number;
}

const SEGUNDOS_URGENTE = 10;
const ACTUALIZAR_CADA_MS = 250;
const POSICION = { position: 'absolute', top: 8, right: 8, zIndex: 1 } as const;

function segundosRestantes(fin: number, ahora: () => number) {
  return Math.max(0, Math.ceil((fin - ahora()) / 1000));
}

function Cronometro({ etiqueta, fin, ahora }: Props) {
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    if (fin === null) return;
    const finActual = fin;

    function actualizar() {
      setSegundos(segundosRestantes(finActual, ahora));
    }

    actualizar();
    const intervalo = setInterval(actualizar, ACTUALIZAR_CADA_MS);

    return () => clearInterval(intervalo);
  }, [fin, ahora]);

  if (fin === null) return null;

  const urgente = segundos <= SEGUNDOS_URGENTE;

  return (
    <Paper elevation={3} sx={{ ...POSICION, px: 2, py: 1, textAlign: 'center' }}>
      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
        {etiqueta}
      </Typography>
      <Typography
        variant="h6"
        sx={{ color: urgente ? 'error.main' : 'text.primary', fontWeight: urgente ? 'bold' : 'normal' }}
      >
        {segundos} seg
      </Typography>
    </Paper>
  );
}

export default Cronometro;
