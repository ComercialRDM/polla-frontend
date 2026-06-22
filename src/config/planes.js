export const PLANES = [
    { valor: 10000, saldoBono: 15000, intentos: 1, etiqueta: '1 cupo' },
    { valor: 25000, saldoBono: 35000, intentos: 2, etiqueta: '2 cupos', destacado: 'popular' },
    { valor: 50000, saldoBono: 80000, intentos: 3, etiqueta: '3 cupos' },
];

// 1 cupo de pronóstico = $25.000 de recarga
export const CUPO_VALOR = 25000;

// Rango permitido para montos personalizados ("Otro monto")
export const MONTO_PERSONALIZADO_MIN = 25000;
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
