//* chat
export { manejarChat } from "./chat/chat.js";

//* partida
export { manejarIniciarPartida } from "./partida/iniciarPartida.js";

//* construccion
export { manejarColocarAsentamiento } from "./construccion/colocarAsentamiento.js";
export { manejarColocarCamino } from "./construccion/colocarCamino.js";
export { manejarColocarCiudad } from "./construccion/colocarCiudad.js";

//* dados
export { manejarLanzarDados } from "./dados/lanzarDados.js";

//* turno
export { manejarPasarTurno } from "./turno/pasarTurno.js";

//* comercio
export { manejarIntercambiarBanca } from "./comercio/intercambiarBanca.js";
export { manejarOfrecerIntercambio } from "./comercio/ofrecerIntercambio.js";
export { manejarResponderIntercambio } from "./comercio/responderIntercambio.js";

//* ladron
export { manejarMoverLadron } from "./ladron/moverLadron.js";
export { manejarRobarJugador } from "./ladron/robarJugador.js";

//* descarte
export { manejarDescartarRecursos } from "./descarte/descartarRecursos.js";

//* cartas
export { manejarComprarCarta } from "./cartas/comprarCarta.js";
export { manejarCartaCaballero } from "./cartas/cartaCaballero.js";
export { manejarCartaAbundancia } from "./cartas/cartaAbundancia.js";
export { manejarCartaMonopolio } from "./cartas/cartaMonopolio.js";
export { manejarCartaCarreteras } from "./cartas/cartaCarreteras.js";
export { manejarCaminoGratis } from "./cartas/caminoGratis.js";

//* sala
export { manejarCreacion } from "./sala/crearSala.js";
export { manejarUnirse } from "./sala/unirseASala.js";
export { manejarSalida } from "./sala/salirDeSala.js";
export { manejarCaidaConexion } from "./sala/perderConexion.js";
export { manejarReconexion } from "./sala/reconectar.js";
export { manejarDestruccion } from "./sala/destruirSala.js";
