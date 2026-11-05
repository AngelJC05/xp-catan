import type { RelojSala } from "../../src/timers/Temporizador.js";

export interface Programado {
  accion: () => void;
  milisegundos: number;
  cancelado: boolean;
}

//? Funcion que devuelve un reloj falso que guarda lo que se programa y deja decidir cuando vence cada cosa
export function armarReloj() {
  const programados: Programado[] = [];

  const reloj: RelojSala = {
    setTimeout: (accion, milisegundos) => {
      const programado: Programado = { accion, milisegundos, cancelado: false };
      programados.push(programado);
      return { 
        clear: () => { programado.cancelado = true; } 
      };
    }
  };

  //* Simula que se cumplio el tiempo de lo que se programo, si no esta cancelado
  function vencer(indice: number) {
    const programado = programados[indice];
    if (!programado.cancelado) programado.accion();
  }

  return { reloj, programados, vencer };
}
