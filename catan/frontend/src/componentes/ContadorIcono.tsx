import Icono from './Icono';

interface Props {
  icono: string;
  cantidad: number;
  // Qué representa la cantidad: se muestra al pasar el mouse y lo leen los lectores de pantalla.
  descripcion: string;
  tam?: number;
}

//* Icono con una cantidad al lado, para las listas de existencias del juego

function ContadorIcono({ icono, cantidad, descripcion, tam = 22 }: Props) {
  return (
    <div className="d-flex align-items-center gap-1" title={descripcion}>
      <Icono ruta={icono} tam={tam} />
      <span className="fw-bold">{cantidad}</span>
      <span className="visually-hidden">{descripcion}</span>
    </div>
  );
}

export default ContadorIcono;
