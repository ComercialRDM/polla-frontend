// Modelo de elasticidad precio-demanda para el simulador de ingresos del
// panel admin (mirror del backend en src/config/elasticidad.js). Es un
// modelo simplificado/ajustable: a mayor precio del bono, menor tasa de
// conversión estimada de los clics de ManyChat, pero mayor margen por
// transacción. Se recalcula en el navegador para que el slider responda
// en tiempo real sin llamadas al servidor.

// Meta de ingresos y fecha límite del objetivo del Mundial
export const META_INGRESOS = 50000000; // $50.000.000 COP
export const FECHA_META = '2026-07-19';

// Precio de referencia (plan más vendido hoy) y su tasa de conversión observada
export const PRECIO_REFERENCIA = 50000;
export const TASA_CONVERSION_REFERENCIA = 0.08; // 8% de los clics de ManyChat se convierten en compra

// Exponente de elasticidad: >1 = la conversión cae más que proporcionalmente al subir el precio
export const ELASTICIDAD = 1.2;

// Rango y paso del slider del simulador (múltiplos estrictos de $5.000, desde $10.000)
export const PRECIO_SIMULADOR_MIN = 10000;
export const PRECIO_SIMULADOR_MAX = 200000;
export const PRECIO_SIMULADOR_PASO = 5000;

// Tasa de conversión estimada para un precio dado, según el modelo de elasticidad
export function tasaConversion(precio) {
    if (!precio || precio <= 0) return 0;
    const tasa = TASA_CONVERSION_REFERENCIA * Math.pow(PRECIO_REFERENCIA / precio, ELASTICIDAD);
    return Math.min(Math.max(tasa, 0), 1);
}

// Proyección de ingresos al ritmo actual de clics de ManyChat, para un precio dado
export function calcularProyeccion({ precio, clicsDiariosPromedio, ingresosActuales, diasRestantes }) {
    const tasa = tasaConversion(precio);
    const conversionesDiarias = clicsDiariosPromedio * tasa;
    const ingresoDiarioEstimado = conversionesDiarias * precio;
    const ingresoAdicionalProyectado = ingresoDiarioEstimado * diasRestantes;
    const ingresoProyectadoTotal = ingresosActuales + ingresoAdicionalProyectado;
    const faltante = Math.max(META_INGRESOS - ingresoProyectadoTotal, 0);

    return {
        tasaConversion: tasa,
        conversionesDiarias,
        ingresoDiarioEstimado,
        ingresoProyectadoTotal,
        cumpleMeta: ingresoProyectadoTotal >= META_INGRESOS,
        faltante,
    };
}
