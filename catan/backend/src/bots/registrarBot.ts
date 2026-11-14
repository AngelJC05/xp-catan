import type { Client } from "colyseus";
import type { CatanRoom } from "../rooms/CatanRoom.js";
import { Jugador } from "../schemas/Jugador.js";
import { actualizarCupoBots } from "./actualizarCupoBots.js";
import { NOMBRES_BOT } from "./nombresBot.js";

//? Devuelve el primer sessionId bot-1, bot-2... que no este en uso
function crearSessionIdBot(sala: CatanRoom): string {
    let numero = 1;
    while (sala.jugadores.has(`bot-${numero}`)) numero++;
    return `bot-${numero}`;
}

//? Elige al azar un nombre de la lista que ningun jugador de la sala este usando
function elegirNombreBot(sala: CatanRoom, sessionId: string): string {
    const usados = new Set([...sala.jugadores.values()].map((jugador) => jugador.nombre));
    const disponibles = NOMBRES_BOT.filter((nombre) => !usados.has(nombre));

    //* Si se acabaron los nombres, se usa el numero del bot
    if (disponibles.length === 0) return `Bot${sessionId.replace("bot-", "")}`;

    return disponibles[Math.floor(Math.random() * disponibles.length)];
}

//? Registra un bot en la sala y devuelve su cliente falso
export function registrarBot(sala: CatanRoom): Client {
    const sessionId = crearSessionIdBot(sala);

    const bot = new Jugador(elegirNombreBot(sala, sessionId));
    bot.esBot = true;
    sala.jugadores.set(sessionId, bot);
    sala.partida.ordenJugadores.push(sessionId);
    actualizarCupoBots(sala);

    //* Los bots no leen lo se le envia
    return { sessionId, send: () => {} } as unknown as Client;
}
