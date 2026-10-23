import { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

interface CampoCopiableProps {
  etiqueta: string;
  valor: string;
  descripcionBoton: string;
  destacado?: boolean;
}

//* Muestra un dato de la sala con un boton para copiarlo al portapapeles

export default function CampoCopiable({
  etiqueta, valor, descripcionBoton, destacado = false,
}: CampoCopiableProps) {
  const [copiado, setCopiado] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (temporizador.current) clearTimeout(temporizador.current);
  }, []);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
      if (temporizador.current) clearTimeout(temporizador.current);
      temporizador.current = setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Si el navegador bloquea el portapapeles, el texto sigue visible
      // y se puede copiar a mano.
    }
  }

  return (
    <div
      className={[
        "d-flex flex-column flex-sm-row align-items-sm-center gap-2 p-3 border rounded text-start",
        destacado ? "border-danger-subtle bg-danger-subtle" : "bg-body-tertiary",
      ].join(" ")}
    >
      <div className="flex-grow-1 text-break">
        <Typography variant="overline" component="div" color="text.secondary">
          {etiqueta}
        </Typography>
        <code className="fs-5 fw-bold text-body">{valor}</code>
      </div>
      <Button
        variant="outlined"
        color={destacado ? "error" : "primary"}
        size="small"
        className="text-nowrap"
        onClick={copiar}
        aria-label={descripcionBoton}
      >
        {copiado ? "✔ ¡Copiado!" : "📋 Copiar"}
      </Button>
    </div>
  );
}
