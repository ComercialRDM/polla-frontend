export const PLANES = [
    { valor: 10000, saldoBono: 15000, intentos: 1, etiqueta: '1 cupo' },
    { valor: 25000, saldoBono: 40000, intentos: 2, etiqueta: '2 cupos' },
    { valor: 50000, saldoBono: 80000, intentos: 5, etiqueta: '5 cupos', destacado: 'popular' },
];

// Usado solo para el monedero (dinero disponible informativo). Los cupos
// reales de cada compra quedan fijos en el plan (PLANES) al momento de pagar.
export const CUPO_VALOR = 25000;

// Para montos personalizados ("Otro monto"): 1 intento por cada $10.000,
// misma proporción que el plan más económico ($10.000 = 1 intento).
export const CUPO_VALOR_PERSONALIZADO = 10000;

// Rango permitido para montos personalizados ("Otro monto"). Deben ser
// múltiplos exactos de $1.000.
export const MONTO_PERSONALIZADO_MIN = 50000;
export const MONTO_PERSONALIZADO_MAX = 1000000;
export const MULTIPLO_PERSONALIZADO = 1000;

// Bonificación del bono de servicio para montos personalizados (60% extra)
const BONIFICACION_PERSONALIZADA = 1.6;

export function calcularCupos(valor) {
    return Math.floor(Number(valor) / CUPO_VALOR_PERSONALIZADO);
}

export function calcularSaldoBono(valor) {
    return Math.round(Number(valor) * BONIFICACION_PERSONALIZADA);
}

export function formatoPesos(valor) {
    return `$${Number(valor).toLocaleString('es-CO')}`;
}

// Espejo exacto de COSTO_CUPO_FASE en polla-backend/src/routes/polla.js — debe
// coincidir siempre, porque acá solo se usa para PREVISUALIZAR el monto antes
// de pagar; el cobro real de cupos lo valida el backend en POST /polla/votar.
export const COSTO_CUPO_FASE = {
    grupos: 1, dieciseisavos: 1, octavos: 1,
    cuartos: 2, semifinal: 2, final: 4,
};

// Suma el costo en cupos de cada predicción pendiente (según la fase de su
// partido) y lo convierte al monto personalizado equivalente, respetando el
// mínimo de "Otro monto" ya existente.
export function calcularMontoPorPredicciones(predicciones, partidos) {
    const cupos = predicciones.reduce((acc, pred) => {
        const partido = partidos.find((p) => p.id === pred.partido_id);
        const costo = COSTO_CUPO_FASE[partido?.fase] ?? 1;
        return acc + costo;
    }, 0);
    const monto = Math.max(cupos * CUPO_VALOR_PERSONALIZADO, MONTO_PERSONALIZADO_MIN);
    return { cupos, monto };
}
