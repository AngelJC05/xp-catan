export interface DatosPartida {
  creador: string;
  fase: number;
  fasePreconstruccion: number;
  faseJuego: number;
  direccionPreconstruccion: number;
  turnoActual: string;
  ordenJugadores: string[];
  jugadoresParaRobar: string[];
  jugadoresParaDescartar: Record<string, number>;
  cartaJugable: boolean;
  ganador: string;
  ejercitoMasGrande: string;
  caminoMasLargo: string;
  carreterasGratis: number;
  ofertaIntercambio: Oferta;
}

/* schemas/OfertaIntercambio.ts — un jugador propone cambiar recursos y los
   demas votan. */
export interface Oferta {
  jugador: string;
  recursoOfrecido: string;
  cantidadOfrecida: number;
  recursoSolicitado: string;
  cantidadSolicitada: number;
  respuestas: Record<string, number>;
}