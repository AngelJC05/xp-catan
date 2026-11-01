import { useState, type KeyboardEvent } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Icono from '../../../../componentes/Icono';
import { ICONO_UI } from '../../../../common/iconos';
import { PAGINAS } from './paginas';

//* Boton de ayuda y la guia del juego en paginas cortas, como un mini libro

function Ayuda() {
  const [abierto, setAbierto] = useState(false);
  // La pagina se recuerda al cerrar, para seguir donde se quedo
  const [pagina, setPagina] = useState(0);

  const ultima = PAGINAS.length - 1;
  const { titulo, icono, contenido } = PAGINAS[pagina];

  const irA = (nueva: number) => setPagina(Math.min(Math.max(nueva, 0), ultima));

  // Las flechas del teclado tambien cambian de pagina
  const alPresionarTecla = (evento: KeyboardEvent) => {
    if (evento.key === 'ArrowRight') irA(pagina + 1);
    if (evento.key === 'ArrowLeft') irA(pagina - 1);
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-light btn-sm border fw-bold d-flex align-items-center gap-1"
        style={{ color: '#176977' }}
        onClick={() => setAbierto(true)}
      >
        <Icono ruta={ICONO_UI.ayuda} tam={16} />
        Ayuda
      </button>

      <Dialog
        open={abierto}
        onClose={() => setAbierto(false)}
        onKeyDown={alPresionarTecla}
        fullWidth
        maxWidth="sm"
        aria-labelledby="ayuda-titulo"
      >
        <DialogTitle id="ayuda-titulo" className="d-flex align-items-center gap-2">
          <Icono ruta={icono} tam={24} />
          <span className="flex-grow-1">{titulo}</span>
          <span className="fs-6 text-body-secondary fw-normal" aria-live="polite">
            {pagina + 1} / {PAGINAS.length}
          </span>
        </DialogTitle>

        {/* Alto de la pagina mas larga, para que los botones no brinquen al cambiar */}
        <DialogContent dividers style={{ minHeight: 350 }}>
          {contenido}
        </DialogContent>

        {/* Un punto por pagina para saltar directo a cualquiera */}
        <nav className="d-flex justify-content-center gap-2 pt-2" aria-label="Páginas de la guía">
          {PAGINAS.map((p, i) => (
            <button
              key={p.titulo}
              type="button"
              className="border-0 rounded-circle p-0"
              style={{
                width: 10,
                height: 10,
                backgroundColor: i === pagina ? '#176977' : '#ccd8da',
              }}
              title={p.titulo}
              aria-label={`Ir a ${p.titulo}`}
              aria-current={i === pagina ? 'page' : undefined}
              onClick={() => irA(i)}
            />
          ))}
        </nav>

        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Button
            type="button"
            onClick={() => irA(pagina - 1)}
            disabled={pagina === 0}
            startIcon={<Icono ruta={ICONO_UI.atras} tam={16} />}
          >
            Anterior
          </Button>
          <Button type="button" onClick={() => setAbierto(false)}>Cerrar</Button>
          <Button
            type="button"
            variant="contained"
            onClick={() => irA(pagina + 1)}
            disabled={pagina === ultima}
            endIcon={<Icono ruta={ICONO_UI.adelante} tam={16} />}
          >
            Siguiente
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Ayuda;
