export const PLANES = [
    { valor: 50000, saldoBono: 65000, intentos: 1, etiqueta: '1 intento' },
    { valor: 100000, saldoBono: 130000, intentos: 2, etiqueta: '2 intentos', destacado: 'popular' },
    { valor: 200000, saldoBono: 270000, intentos: 5, etiqueta: '5 intentos', destacado: 'premium' },
];

export function formatoPesos(valor) {
    return `$${Number(valor).toLocaleString('es-CO')}`;
}
