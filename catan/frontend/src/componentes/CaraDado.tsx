interface Props {
  // null dibuja el dado vacío, para cuando todavía no hay tirada.
  valor: number | null;
  etiqueta: string;
  className?: string;
}

// Abreviaturas de Top, Middle y Bottom: Left y Right
const TL = [25, 25], TR = [75, 25];
const ML = [25, 50], C = [50, 50], MR = [75, 50];
const BL = [25, 75], BR = [75, 75];

const PUNTOS: Record<number, number[][]> = {
  1: [C],
  2: [TL, BR],
  3: [TL, C, BR],
  4: [TL, TR, BL, BR],
  5: [TL, TR, C, BL, BR],
  6: [TL, TR, ML, MR, BL, BR],
};

function CaraDado({ valor, etiqueta, className }: Props) {
  const puntos = valor === null ? [] : PUNTOS[valor] ?? [];

  return (
    <svg
      viewBox="0 0 100 100"
      width={44}
      height={44}
      role="img"
      aria-label={etiqueta}
      className={className}
    >
      <rect
        x="4"
        y="4"
        width="92"
        height="92"
        rx="16"
        fill={valor === null ? 'var(--bs-secondary-bg)' : 'var(--bs-body-bg)'}
        stroke="currentColor"
        strokeWidth="5"
      />

      {puntos.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="9" fill="currentColor" />
      ))}
    </svg>
  );
}

export default CaraDado;
