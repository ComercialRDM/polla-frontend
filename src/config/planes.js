export const PLANES = [
    { valor: 50000, saldoBono: 70000, intentos: 1, etiqueta: '1 intento' },
    { valor: 100000, saldoBono: 130000, intentos: 2, etiqueta: '2 intentos' },
    { valor: 200000, saldoBono: 250000, intentos: 4, etiqueta: '4 intentos' },
];

export function formatoPesos(valor) {
    return `$${Number(valor).toLocaleString('es-CO')}`;
}
