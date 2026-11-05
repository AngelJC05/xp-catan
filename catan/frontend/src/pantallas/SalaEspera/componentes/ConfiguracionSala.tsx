import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import {
  PUNTOS_MAXIMOS,
  PUNTOS_MINIMOS,
  TIEMPOS_PERMITIDOS,
  type ConfiguracionSala as Configuracion,
} from "../../../common/configuracionSala";

// Tiempos que el creador puede cambiar (los demás tienen una sola opción)
const TIEMPOS_EDITABLES = [
  { clave: "preconstruccion", etiqueta: "Preconstrucción (por pieza)" },
  { clave: "acciones", etiqueta: "Acciones del turno" },
  { clave: "descarte", etiqueta: "Descarte tras un 7" },
] as const;

interface Props {
  configuracion: Configuracion;
  esCreador: boolean;
  onCambiar: (cambio: Partial<Configuracion>) => void;
}

interface OpcionProps {
  etiqueta: string;
  valor: number;
  marcas: { value: number; label: string }[];
  min: number;
  max: number;
  deshabilitado: boolean;
  onConfirmar: (valor: number) => void;
}

// Slider que solo se queda en las marcas. Mientras se arrastra mueve su propio valor y
// al soltar avisa, así no se manda un mensaje por cada posición que cruza.
function OpcionSlider({ etiqueta, valor, marcas, min, max, deshabilitado, onConfirmar }: OpcionProps) {
  const [local, setLocal] = useState(valor);

  // Si el servidor cambia el valor (otro cliente, o se rechazó el cambio) se vuelve a mostrar
  useEffect(() => setLocal(valor), [valor]);

  return (
    <div className="w-100 text-start">
      <Typography variant="body2" id={`opcion-${etiqueta}`}>{etiqueta}</Typography>
      <div className="px-3">
        <Slider
          aria-labelledby={`opcion-${etiqueta}`}
          value={local}
          min={min}
          max={max}
          step={null}
          marks={marcas}
          disabled={deshabilitado}
          onChange={(_, nuevo) => setLocal(nuevo as number)}
          onChangeCommitted={(_, nuevo) => onConfirmar(nuevo as number)}
        />
      </div>
    </div>
  );
}

//* Opciones que el creador elige en la sala de espera; los demás las ven sin poder cambiarlas
function ConfiguracionSala({ configuracion, esCreador, onCambiar }: Props) {
  const marcasPuntos = Array.from({ length: PUNTOS_MAXIMOS - PUNTOS_MINIMOS + 1 }, (_, i) => {
    const puntos = PUNTOS_MINIMOS + i;
    return { value: puntos, label: String(puntos) };
  });

  return (
    <div className="w-100 d-flex flex-column gap-2">
      <Typography variant="subtitle1" className="fw-semibold">Configuración de la partida</Typography>

      <OpcionSlider
        etiqueta="Puntos para ganar"
        valor={configuracion.puntos}
        marcas={marcasPuntos}
        min={PUNTOS_MINIMOS}
        max={PUNTOS_MAXIMOS}
        deshabilitado={!esCreador}
        onConfirmar={(puntos) => onCambiar({ puntos })}
      />
      <Alert severity="info" className="text-start py-0">
        Con más jugadores conviene pedir menos puntos, sobre todo si no van a negociar entre ustedes.
      </Alert>

      {TIEMPOS_EDITABLES.map(({ clave, etiqueta }) => {
        const opciones = TIEMPOS_PERMITIDOS[clave];
        const posicion = Math.max(0, opciones.findIndex((segundos) => segundos === configuracion[clave]));
        return (
          <OpcionSlider
            key={clave}
            etiqueta={etiqueta}
            valor={posicion}
            marcas={opciones.map((segundos, i) => ({ value: i, label: `${segundos} s` }))}
            min={0}
            max={opciones.length - 1}
            deshabilitado={!esCreador}
            onConfirmar={(i) => onCambiar({ [clave]: opciones[i] })}
          />
        );
      })}
    </div>
  );
}

export default ConfiguracionSala;
