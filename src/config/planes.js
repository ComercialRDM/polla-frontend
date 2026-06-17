export const PLANES = [
    { valor: 25000,   saldoBono: 30000,   intentos: 1,  etiqueta: '1 cupo' },
    { valor: 50000,   saldoBono: 70000,   intentos: 2,  etiqueta: '2 cupos' },
    { valor: 100000,  saldoBono: 130000,  intentos: 4,  etiqueta: '4 cupos', destacado: 'popular' },
    { valor: 200000,  saldoBono: 250000,  intentos: 8,  etiqueta: '8 cupos', destacado: 'premium' },
    { valor: 500000,  saldoBono: 650000,  intentos: 20, etiqueta: '20 cupos' },
    { valor: 1000000, saldoBono: 1500000, intentos: 40, etiqueta: '40 cupos' },
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
