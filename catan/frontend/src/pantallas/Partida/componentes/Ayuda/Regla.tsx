import type { ReactNode } from 'react';

// Fila de la guia: iconos a la izquierda y la explicacion a la derecha
export function Regla({ iconos, children }: { iconos: string[]; children: ReactNode }) {
  return (
    <li className="d-flex align-items-center gap-2">
      {/* En pantallas angostas los iconos bajan de linea para dejarle espacio al texto */}
      <span className="d-flex flex-wrap flex-shrink-0" style={{ maxWidth: '35%' }}>
        {iconos.map((ruta, i) => (
          <img key={i} src={ruta} alt="" aria-hidden="true" width={26} height={26} />
        ))}
      </span>
      <span>{children}</span>
    </li>
  );
}

export function Lista({ children }: { children: ReactNode }) {
  return <ul className="list-unstyled d-flex flex-column gap-2 mb-0">{children}</ul>;
}
