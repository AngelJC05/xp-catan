interface Props {
  ruta: string;
  tam?: number;
  className?: string;
}

// Icono decorativo: el texto que lo acompaña ya dice lo mismo.
function Icono({ ruta, tam = 18, className }: Props) {
  return (
    <img
      src={ruta}
      alt=""
      aria-hidden="true"
      width={tam}
      height={tam}
      className={['align-text-bottom', className].filter(Boolean).join(' ')}
    />
  );
}

export default Icono;
