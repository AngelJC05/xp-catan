//? Funcion para validar que un mensaje no esté vacío y no supere los 100 caracteres
export function validarMensajeChat(mensaje: string) : string | null {
    //* Al mensaje se le recortan los espacios al inicio y al final
    mensaje = mensaje.trim();
    
    //* Un mensaje vacio se retorna como null
    if(mensaje.length === 0) return null;

    //* Si el mensaje tiene mas de 100 caracteres se recorta a 100
    if(mensaje.length > 100){
        mensaje = mensaje.slice(0, 100);
    }

    return mensaje;
}