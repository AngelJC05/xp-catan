import Stack from '@mui/material/Stack';
import Cronometro from './Cronometro';

interface RelojMostrado {
  nombre: string;
  etiqueta: string;
  fin: number;
}

interface Props {
  relojes: RelojMostrado[];
  ahora: () => number;
}

const POSICION = { position: 'absolute', top: 8, right: 8, zIndex: 1 } as const;

// Muestra los cronometros activos uno debajo del otro en la esquina del tablero
function PilaCronometros({ relojes, ahora }: Props) {
  if (relojes.length === 0) return null;

  return (
    <Stack spacing={1} sx={POSICION}>
      {/* El nombre como key mantiene la cuenta de cada reloj cuando aparece o se va otro */}
      {relojes.map((reloj) => (
        <Cronometro key={reloj.nombre} etiqueta={reloj.etiqueta} fin={reloj.fin} ahora={ahora} enLinea />
      ))}
    </Stack>
  );
}

export default PilaCronometros;
