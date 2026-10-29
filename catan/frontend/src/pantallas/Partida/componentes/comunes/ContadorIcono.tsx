import type { ReactNode } from 'react';
import Icono from '../../../../componentes/Icono';

interface Props {
  icono: string;
  cantidad: number;
  descripcion: string;
  tam?: number;
  // Algo extra junto a la cantidad, por ejemplo cuántas cartas se compraron en el turno.
  insignia?: ReactNode;
  // Clases para la cantidad, por ejemplo para resaltarla o marcarla como alerta.
  claseCantidad?: string;
}

//* Icono con una cantidad al lado, para las listas de existencias del juego

function ContadorIcono({ icono, cantidad, descripcion, tam = 22, insignia, claseCantidad = 'fw-bold' }: Props) {
  return (
    <div className="d-flex align-items-center gap-1" title={descripcion}>
      <Icono ruta={icono} tam={tam} />
      <span className={claseCantidad}>{cantidad}</span>
      {insignia}
      <span className="visually-hidden">{descripcion}</span>
    </div>
  );
}

export default ContadorIcono;
