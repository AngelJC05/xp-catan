import type { ObjetivoConstruccion, TipoConstruccion } from '../Construir/Construir';
import type { Coordenada, DatosTablero } from '../../tipos/tablero';
import { NOMBRE_PUERTO } from '../../tipos/tablero';
import type { Jugadores } from '../../../../common/jugador';
import { colorDelJugador } from '../../../../common/jugador';
import "./Tablero.css"

// Lado del hexagono.
const S = 60;

/* Las dos figuras salen de public/svg/piezas/asentamiento.svg y public/svg/piezas/ciudad.svg.
   Van copiadas aqui, y no importadas, porque Vite no permite importar nada
   de public/, y porque asi se pueden pintar del color del jugador. El viewBox
   de esos archivos es de 24x24, de ahi la escala. Si cambia el dibujo en el
   svg, hay que volver a copiar el path. */
function PiezaVertice(
  { tipo, x, y, lado, color }:
  { tipo: number; x: number; y: number; lado: number; color: string },
) {
  const pintura = { fill: color, stroke: '#172A2D', strokeWidth: 1.2 };
  return (
    <g
      transform={`translate(${x - lado / 2} ${y - lado / 2}) scale(${lado / 24})`}
      pointerEvents="none"
    >
      {tipo === 2 ? (
        <>
          <path d="M3 21.6V8.6L7.8 3.4l4.8 5.2v13Z" {...pintura} />
          <rect x="13.8" y="11.4" width="7.4" height="10.2" rx="0.6" {...pintura} />
        </>
      ) : (
        <path d="M12 4 21 12.2v7.8H3v-7.8Z" {...pintura} />
      )}
    </g>
  );
}

//* Funcion para transoformar una coordenada axial a un punto cartesiano
function centro(h: number, d: number): [number, number] {
  return [
    S * Math.sqrt(3) * (h + d / 2),   //* => Coordenada X 
    -S * 1.5 * d];                    //* => Coordenada Y
}

// Devuelve las 6 esquinas en orden: 0 N, 1 NE, 2 SE, 3 S, 4 SO, 5 NO 
function esquinas(h: number, d: number): [number, number][] {
  const [cx, cy] = centro(h, d);
  const m = (S * Math.sqrt(3)) / 2;
  return [
    [cx, cy - S], 
    [cx + m, cy - S / 2], 
    [cx + m, cy + S / 2],
    [cx, cy + S], 
    [cx - m, cy + S / 2], 
    [cx - m, cy - S / 2],
  ];
}

// Cada hexagono es dueño de 2 esquinas: p = 0 la del sur, p = 1 la del suroeste.
function puntoVertice(h: number, d: number, p: number): [number, number] {
  return esquinas(h, d)[p === 0 ? 3 : 4];
}

/* Cada hexagono es dueño de 3 lados: p = 0 el SE-S, p = 1 el S-SO, p = 2 el SO-NO.
   Que son las esquinas 2-3, 3-4 y 4-5, o sea p+2 y p+3. */
function segmentoArista(h: number, d: number, p: number): [number, number][] {
  const e = esquinas(h, d);
  return [e[p + 2], e[p + 3]];
}

// Los puertos referencian a sus vertices por la clave del mapa ("-3,3,0").
function puntoDeClave(clave: string): [number, number] {
  const [h, d, p] = clave.split(',').map(Number);
  return puntoVertice(h, d, p);
}

interface Props {
  datos: DatosTablero;
  // Para pintar cada pieza del color de su dueño.
  jugadores?: Jugadores;
  // Solo para resaltar los poblados de el jugador para costruir la Ciudad
  miSessionId?: string;
  tipoConstruccion?: TipoConstruccion | null;
  objetivoSeleccionado?: ObjetivoConstruccion | null;
  onSeleccionarObjetivo?: (objetivo: ObjetivoConstruccion) => void;
  // true cuando el jugador debe elegir a que hexagono mover al ladron.
  moviendoLadron?: boolean;
  onSeleccionarHexagonoLadron?: (hexagono: Coordenada) => void;
}

function esElObjetivo(
  objetivo: ObjetivoConstruccion | null | undefined,
  h: number,
  d: number,
  p: number,
) {
  return objetivo?.h === h && objetivo.d === d && objetivo.p === p;
}

function Tablero({
  datos,
  jugadores = {},
  miSessionId = '',
  tipoConstruccion = null,
  objetivoSeleccionado,
  onSeleccionarObjetivo,
  moviendoLadron = false,
  onSeleccionarHexagonoLadron,
}: Props) {

  return (
    <svg
      className="tbSvg"
      viewBox={`${-5.7 * S} ${-5.5 * S} ${11.4 * S} ${11 * S}`}
    >

      {/* puertos primero, para que el muelle quede por detras del hexagono */}
      {Object.entries(datos.puertos).map(([clave, puerto]) => {
        const a = puntoDeClave(puerto.vertice1);
        const b = puntoDeClave(puerto.vertice2);
        // El cartel se separa del centro del tablero, hacia afuera.
        const mx = (a[0] + b[0]) / 2;
        const my = (a[1] + b[1]) / 2;
        const largo = Math.hypot(mx, my) || 1;
        const px = mx + (mx / largo) * S * 0.8;
        const py = my + (my / largo) * S * 0.62;
        return (
          <g key={clave} className="tbPuerto">
            <line x1={a[0]} y1={a[1]} x2={px} y2={py} className="tbMuelle" />
            <line x1={b[0]} y1={b[1]} x2={px} y2={py} className="tbMuelle" />
            <rect x={px - S * 0.5} y={py - S * 0.19} width={S * 1} height={S * 0.38}
                  rx={S * 0.09} className="tbPuertoCaja" />
            <text x={px} y={py} className="tbPuertoTexto">{NOMBRE_PUERTO[puerto.tipo]}</text>
          </g>
        );
      })}

      {/* hexagonos */}
      {Object.entries(datos.hexagonos).map(([clave, hex]) => (
        <polygon
          key={clave}
          className={`tbHex tbTerreno-${hex.terreno}`}
          points={esquinas(hex.h, hex.d).join(' ')}
        />
      ))}

      {/* aristas: los caminos */}
      {Object.entries(datos.aristas).map(([clave, arista]) => {
        if (arista.propietario === '') return null;
        const [a, b] = segmentoArista(arista.h, arista.d, arista.p);
        return (
          <line
            key={`borde${clave}`}
            className="tbArista tbAristaBorde"
            x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}
          />
        );
      })}
      {Object.entries(datos.aristas).map(([clave, arista]) => {
        const [a, b] = segmentoArista(arista.h, arista.d, arista.p);
        const puedeSeleccionar = tipoConstruccion === 'camino' && arista.propietario === '';
        const seleccionado = puedeSeleccionar && esElObjetivo(objetivoSeleccionado, arista.h, arista.d, arista.p);
        const objetivo = { h: arista.h, d: arista.d, p: arista.p };
        return (
          <line
            key={clave}
            className={[
              arista.propietario === '' ? 'tbArista' : 'tbArista tbAristaOcupada',
              puedeSeleccionar ? 'tbObjetivoConstruccion' : '',
              seleccionado ? 'tbObjetivoSeleccionado' : '',
            ].filter(Boolean).join(' ')}
            stroke={arista.propietario === ''
              ? '#00000018'
              : colorDelJugador(jugadores, arista.propietario)}
            x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}
            role={puedeSeleccionar ? 'button' : undefined}
            tabIndex={puedeSeleccionar ? 0 : undefined}
            aria-label={puedeSeleccionar ? `Construir camino en ${arista.h}, ${arista.d}, ${arista.p}` : undefined}
            onClick={puedeSeleccionar ? () => onSeleccionarObjetivo?.(objetivo) : undefined}
            onKeyDown={puedeSeleccionar ? (evento) => {
              if (evento.key === 'Enter' || evento.key === ' ') {
                evento.preventDefault();
                onSeleccionarObjetivo?.(objetivo);
              }
            } : undefined}
          />
        );
      })}

      {/* fichas de numero y ladron */}
      {Object.entries(datos.hexagonos).map(([clave, hex]) => {
        const [cx, cy] = centro(hex.h, hex.d);
        const rojo = hex.numero === 6 || hex.numero === 8;
        return (
          <g key={`f${clave}`}>
            {hex.numero > 0 && (
              <g className={rojo ? 'tbFicha tbFichaRoja' : 'tbFicha'}>
                <circle cx={cx} cy={cy} r={S * 0.31} className="tbFichaFondo" />
                <text x={cx} y={cy} className="tbFichaNumero">{hex.numero}</text>
              </g>
            )}
            {hex.esLadron && (
              <g className="tbLadron">
                <ellipse cx={cx} cy={cy + S * 0.18} rx={S * 0.2} ry={S * 0.16} />
                <circle cx={cx} cy={cy - S * 0.1} r={S * 0.13} />
              </g>
            )}
          </g>
        );
      })}

      {/* Mover al ladron: un circulo en el centro de cada hexagono para elegirlo.
          No se dibuja donde esta el ladron ahora (esLadron), porque el
          backend no deja dejarlo en el mismo hexagono. */}
      {moviendoLadron && Object.entries(datos.hexagonos).map(([clave, hex]) => {
        if (hex.esLadron) return null;
        const [cx, cy] = centro(hex.h, hex.d);
        const hexagono = { h: hex.h, d: hex.d };
        return (
          <circle
            key={`l${clave}`}
            className="tbObjetivoLadron"
            cx={cx} cy={cy} r={S * 0.42}
            role="button"
            tabIndex={0}
            aria-label={`Mover al ladrón a ${hex.h}, ${hex.d}`}
            onClick={() => onSeleccionarHexagonoLadron?.(hexagono)}
            onKeyDown={(evento) => {
              if (evento.key === 'Enter' || evento.key === ' ') {
                evento.preventDefault();
                onSeleccionarHexagonoLadron?.(hexagono);
              }
            }}
          />
        );
      })}

      {Object.entries(datos.vertices).map(([clave, vertice]) => {
        const [x, y] = puntoVertice(vertice.h, vertice.d, vertice.p);
        const puedeSeleccionar =
          (tipoConstruccion === 'poblado' && vertice.constuccion === 0) ||
          (tipoConstruccion === 'ciudad'
            && vertice.constuccion === 1
            && vertice.propietario === miSessionId);
        const seleccionado = puedeSeleccionar && esElObjetivo(objetivoSeleccionado, vertice.h, vertice.d, vertice.p);
        const objetivo = { h: vertice.h, d: vertice.d, p: vertice.p };
        // El circulo sigue siendo el area de clic; la pieza se dibuja encima.
        const lado = S * 0.4;
        return (
          <g key={clave}>
            {vertice.constuccion !== 0 && (
              <PiezaVertice
                tipo={vertice.constuccion}
                x={x} y={y} lado={lado}
                color={colorDelJugador(jugadores, vertice.propietario)}
              />
            )}
            <circle
              className={[
                vertice.constuccion === 0 ? 'tbVertice' : 'tbVertice tbVerticeOcupado',
                puedeSeleccionar ? 'tbObjetivoConstruccion' : '',
                seleccionado ? 'tbObjetivoSeleccionado' : '',
              ].filter(Boolean).join(' ')}
              cx={x} cy={y} r={S * 0.085}
              role={puedeSeleccionar ? 'button' : undefined}
              tabIndex={puedeSeleccionar ? 0 : undefined}
              aria-label={puedeSeleccionar ? `Construir ${tipoConstruccion} en ${vertice.h}, ${vertice.d}, ${vertice.p}` : undefined}
              onClick={puedeSeleccionar ? () => onSeleccionarObjetivo?.(objetivo) : undefined}
              onKeyDown={puedeSeleccionar ? (evento) => {
                if (evento.key === 'Enter' || evento.key === ' ') {
                  evento.preventDefault();
                  onSeleccionarObjetivo?.(objetivo);
                }
              } : undefined}
            />
          </g>
        );
      })}
    </svg>
  );
}

export default Tablero;
