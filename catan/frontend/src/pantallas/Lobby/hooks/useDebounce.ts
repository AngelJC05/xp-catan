import { useEffect, useState } from "react";

// Devuelve el valor solo cuando deja de cambiar durante "espera" milisegundos,
// para no recalcular con cada tecla.
export function useDebounce<T>(valor: T, espera = 300): T {
  const [valorEstable, setValorEstable] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => setValorEstable(valor), espera);
    return () => clearTimeout(temporizador);
  }, [valor, espera]);

  return valorEstable;
}
