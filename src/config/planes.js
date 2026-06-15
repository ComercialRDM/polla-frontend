export const PLANES = [
    { valor: 50000, saldoBono: 65000, intentos: 1, etiqueta: '1 intento' },
    { valor: 100000, saldoBono: 130000, intentos: 2, etiqueta: '2 intentos', destacado: 'popular' },
    { valor: 200000, saldoBono: 270000, intentos: 5, etiqueta: '5 intentos', destacado: 'premium' },
];

// 1 cupo de pronóstico = $50.000 de recarga (1 partido distinto por cupo)
export const CUPO_VALOR = 50000;

// Rango permitido para montos personalizados ("Otro monto")
export const MONTO_PERSONALIZADO_MIN = 200000;
export const MONTO_PERSONALIZADO_MAX = 2000000;

// Bonificación del bono de servicio para montos personalizados (~30% extra)
const BONIFICACION_PERSONALIZADA = 1.3;

export function calcularCupos(valor) {
    return Math.floor(Number(valor) / CUPO_VALOR);
}

export function calcularSaldoBono(valor) {
    return Math.round(Number(valor) * BONIFICACION_PERSONALIZADA);
}

export function formatoPesos(valor) {
    return `$${Number(valor).toLocaleString('es-CO')}`;
}
