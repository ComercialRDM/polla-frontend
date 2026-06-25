// Contenido fuente: reglamento oficial vigente en /terminos y /anexo (v2.0, 17 jun 2026).
// Centralizado aquí para que la landing /como-funciona no duplique cifras a mano.

export const PASOS_PARTICIPAR = [
    {
        icono: 'ShoppingCart',
        titulo: 'Compra tu bono',
        descripcion: 'Elige el monto de tu Bono de Servicios. Cada bono otorga cupos para pronosticar.',
    },
    {
        icono: 'Goal',
        titulo: 'Pronostica el marcador',
        descripcion: 'Predice el resultado exacto de los partidos del Mundial 2026 habilitados.',
    },
    {
        icono: 'Trophy',
        titulo: 'Gana puntos y premios',
        descripcion: 'Acumula puntos por cada acierto y compite por la tabla de premios.',
    },
];

export const FASES_PUNTOS = [
    { fase: 'Grupos', exacto: 100, tendencia: 50, cupos: 1 },
    { fase: 'Dieciseisavos', exacto: 120, tendencia: 60, cupos: 1 },
    { fase: 'Octavos de Final', exacto: 200, tendencia: 100, cupos: 1 },
    { fase: 'Cuartos de Final', exacto: 250, tendencia: 125, cupos: 2 },
    { fase: 'Semifinal', exacto: 800, tendencia: 400, cupos: 2 },
    { fase: 'Gran Final', exacto: 2000, tendencia: 1000, cupos: 4 },
];

export const PUNTOS_EXTRA = [
    {
        icono: 'Share2',
        titulo: 'Comparte en Instagram',
        descripcion: 'Comparte tu pronóstico en Stories (máx. 1 vez por partido).',
        puntos: '+10 pts',
        tope: 'Tope: 200 pts',
    },
    {
        icono: 'UserPlus',
        titulo: 'Invita amigos',
        descripcion: 'Cuando alguien compra un bono con tu enlace personal.',
        puntos: '+20 pts',
        tope: 'Tope: 500 pts',
    },
];

export const PREMIOS_PRINCIPALES = [
    {
        icono: '🥇',
        puesto: '1.er puesto',
        montoBase: 2000000,
        montoMax: 5000000,
        descripcion: 'Mayor puntaje acumulado al cierre del Mundial 2026.',
    },
    {
        icono: '🥈',
        puesto: '2.do puesto',
        montoBase: 1000000,
        montoMax: 2000000,
        descripcion: 'Segundo mayor puntaje acumulado al cierre del torneo.',
    },
    {
        icono: '🥉',
        puesto: '3.er puesto',
        montoBase: 500000,
        montoMax: 1000000,
        descripcion: 'Tercer mayor puntaje acumulado al cierre del torneo.',
    },
];

export const BONO_COLOMBIA = {
    icono: '🇨🇴',
    titulo: 'Bono Colombia',
    monto: 1000000,
    descripcion:
        'Por cada partido de la Selección Colombia en Fase de Grupos: $1.000.000 COP para quienes acierten el marcador exacto. Si son más de 10 acertantes, se sortean 10 ganadores de $100.000 cada uno.',
};

export const PREMIOS_FLASH = {
    icono: '⚡',
    titulo: 'Premios Flash',
    descripcion:
        'Durante el primer tiempo de partidos seleccionados, pronostica gratis sin necesitar bono y gana premios físicos al instante.',
};

export const INFO_IMPORTANTE = [
    {
        icono: 'ShieldCheck',
        titulo: 'Pago seguro',
        descripcion: 'Pagos cifrados procesados por Wompi: tarjetas, PSE y más.',
    },
    {
        icono: 'Banknote',
        titulo: 'Transferencia Bancolombia',
        descripcion: 'También puedes pagar por transferencia directa y subir tu comprobante.',
    },
    {
        icono: 'Clock',
        titulo: 'Vigencia del bono',
        descripcion: 'Tu saldo es válido hasta el 1 de marzo de 2027, 6:00 p.m. Sin reembolsos.',
    },
    {
        icono: 'MapPin',
        titulo: '¿Dónde reclamo?',
        descripcion: 'En cualquiera de nuestras sedes en Barranquilla, presentando tu documento de identidad.',
    },
];

export const FAQ_COMO_FUNCIONA = [
    {
        pregunta: '¿Qué pasa si dos personas empatan?',
        respuesta:
            'Primero gana quien tenga mayor puntaje en la Gran Final. Si persiste el empate, gana quien tenga más aciertos exactos en las Semifinales. Si aun así hay empate: con 10 empatados o menos, el premio se reparte en partes iguales entre todos; con más de 10, se sortean 10 ganadores que se reparten el premio en partes iguales.',
    },
    {
        pregunta: '¿Dónde reclamo mi bono o mi premio?',
        respuesta:
            'Te contactamos por WhatsApp o correo dentro de los 10 días hábiles siguientes a la confirmación del resultado. Tienes 20 días calendario desde ese contacto para reclamar en cualquiera de nuestras sedes en Barranquilla, presentando tu documento de identidad.',
    },
    {
        pregunta: '¿Cuándo vence mi bono?',
        respuesta:
            'El saldo de tu Bono de Servicios vence el 1 de marzo de 2027 a las 6:00 p.m. (hora de Colombia). Pasada esa fecha, el saldo caduca sin derecho a reembolso.',
    },
    {
        pregunta: '¿Cómo gano el Bono Colombia?',
        respuesta:
            'Acertando el marcador exacto de un partido de la Selección Colombia en la Fase de Grupos. Ese partido reparte $1.000.000 COP entre quienes acierten; si son más de 10 acertantes, se sortean 10 ganadores de $100.000 cada uno.',
    },
    {
        pregunta: '¿Cuántos pronósticos puedo hacer?',
        respuesta:
            'Tantos como cupos tenga tu bono. Cada fase descuenta una cantidad distinta de cupos (1 en Grupos, Dieciseisavos y Octavos; 2 en Cuartos y Semifinal; 4 en la Final). Puedes registrar un único pronóstico por partido y no se puede modificar una vez enviado; el sistema cierra 5 minutos antes del inicio.',
    },
    {
        pregunta: '¿Cómo funcionan los Sorteos Flash?',
        respuesta:
            'En partidos seleccionados puedes pronosticar gratis durante el primer tiempo, sin necesidad de comprar un bono. Si aciertas, ganas premios físicos al instante (camiseta, gorra, balón y más), disponible para usuarios con cuenta activa.',
    },
];
