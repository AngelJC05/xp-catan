import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

//* Asiento libre de la sala de espera: borde punteado y un "?" en lugar de las iniciales

export default function AsientoVacio() {
  return (
    <li className="col-6 col-sm-3">
      <Card variant="outlined" className="h-100" sx={{ borderStyle: "dashed" }}>
        <CardContent className="d-flex flex-column align-items-center gap-2 p-3">
          <Avatar sx={{ width: 52, height: 52 }}>?</Avatar>
          <span className="small text-body-secondary">Esperando…</span>
        </CardContent>
      </Card>
    </li>
  );
}
