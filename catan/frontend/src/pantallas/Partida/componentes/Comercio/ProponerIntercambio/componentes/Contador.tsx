import { IconButton } from "@mui/material";

interface Props {
  valor: number;
  maximo: number;
  minimo?: number;
  etiqueta?: string;
  deshabilitado?: boolean;
  onCambiar: (valor: number) => void;
}

//? Contador con botones para restar y sumar, limitado entre un mínimo y un máximo
function Contador({ valor, maximo, minimo = 0, etiqueta = '', deshabilitado = false, onCambiar }: Props) {
  return (
    <div className={['d-inline-flex align-items-center gap-1', deshabilitado ? 'opacity-50' : ''].join(' ')}>
      <IconButton
        size="small"
        disabled={deshabilitado || valor <= minimo}
        onClick={() => onCambiar(valor - 1)}
        title={`Restar ${etiqueta}`}
        aria-label={`Restar ${etiqueta}`}
      >
        -
      </IconButton>

      <span className="fw-bold text-center" style={{ minWidth: '2ch' }}>{valor}</span>

      <IconButton
        size="small"
        disabled={deshabilitado || valor >= maximo}
        onClick={() => onCambiar(valor + 1)}
        title={`Sumar ${etiqueta}`}
        aria-label={`Sumar ${etiqueta}`}
      >
        +
      </IconButton>
    </div>
  );
}

export default Contador;
