import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";

interface Props {
  mensaje: string | null;
  onCerrar: () => void;
}

function DialogoError({ mensaje, onCerrar }: Props) {
  return (
    <Dialog open={mensaje !== null} onClose={onCerrar} fullWidth maxWidth="xs">
      <DialogTitle className="d-flex align-items-center justify-content-between">
        No se pudo realizar la acción
        <IconButton aria-label="Cerrar" size="small" onClick={onCerrar}>✕</IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{mensaje}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button type="button" variant="contained" onClick={onCerrar} autoFocus>Entendido</Button>
      </DialogActions>
    </Dialog>
  );
}

export default DialogoError;
