//* Colores iguales a componentes/tablero.css, el 6 y el 8 van en rojo como en el tablero
const FICHAS_ISLA = [
  { cx: 120, cy: 70, color: "#6ab04c", numero: 8 },
  { cx: 200, cy: 70, color: "#c96b4a", numero: 5 },
  { cx: 280, cy: 70, color: "#f6e58d", numero: 10 },
  { cx: 80, cy: 140, color: "#a5d6a7", numero: 3 },
  { cx: 160, cy: 140, color: "#9aa0a6", numero: 6 },
  { cx: 240, cy: 140, color: "#e8c97a", numero: null },
  { cx: 320, cy: 140, color: "#6ab04c", numero: 11 },
];

export default function HexIsla() {
  //? Ilustración original inspirada en las fichas del juego, no es arte oficial de Catan
  const puntosHex = (cx: number, cy: number) => {
    const radio = 45;
    const puntos: string[] = [];

    for (let esquina = 0; esquina < 6; esquina++) {
      const grados = 60 * esquina - 30;
      const radianes = (grados * Math.PI) / 180;
      const x = cx + radio * Math.cos(radianes);
      const y = cy + radio * Math.sin(radianes);
      puntos.push(`${x},${y}`);
    }

    return puntos.join(" ");
  };

  return (
    <svg viewBox="0 0 400 220" className="home__hex-arte" aria-hidden="true">
      {FICHAS_ISLA.map((ficha) => (
        <g key={`${ficha.cx}-${ficha.cy}`}>
          <polygon points={puntosHex(ficha.cx, ficha.cy)} fill={ficha.color} stroke="#f3ede0" strokeWidth={4} />
          {ficha.numero !== null ? (
            <>
              <circle cx={ficha.cx} cy={ficha.cy} r={15} fill="#f6efdd" stroke="#00000022" strokeWidth={1.5} />
              <text
                x={ficha.cx}
                y={ficha.cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={17}
                fontWeight={600}
                fill={ficha.numero === 6 || ficha.numero === 8 ? "#b3261e" : "#2a2a2a"}
              >
                {ficha.numero}
              </text>
            </>
          ) : (
            //* El ladrón empieza en el desierto
            <g>
              <ellipse cx={ficha.cx} cy={ficha.cy + 14} rx={11} ry={5} fill="#333" />
              <ellipse cx={ficha.cx} cy={ficha.cy + 2} rx={8} ry={12} fill="#333" />
              <circle cx={ficha.cx} cy={ficha.cy - 13} r={7} fill="#333" />
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}
