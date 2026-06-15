const PREGUNTAS = [
    {
        pregunta: '¿Qué es la Polla Mundialista?',
        respuesta: 'Es un juego de pronósticos: compras un Bono Digital de La Retoucherie y, de regalo, recibes intentos para predecir el marcador exacto de los partidos de la Selección Colombia en el Mundial 2026. Si aciertas, ganas premios 🏆.',
    },
    {
        pregunta: '¿Cuántos intentos recibo por mi bono?',
        respuesta: 'Depende del valor del bono que compres: $50.000, $100.000 o $200.000. Mientras más alto el valor, más intentos para pronosticar recibes.',
    },
    {
        pregunta: '¿Hasta cuándo puedo predecir un partido?',
        respuesta: 'Puedes ingresar tu pronóstico hasta el momento exacto en que inicia el partido. Después de eso, la votación para ese partido se cierra automáticamente.',
    },
    {
        pregunta: '¿Qué pasa si no acierto el marcador?',
        respuesta: 'No pierdes tu bono: lo puedes usar normalmente en cualquiera de nuestras sedes para servicios de belleza. Solo no participas por el premio de ese partido.',
    },
    {
        pregunta: '¿Cómo y cuándo recibo mi premio si gano?',
        respuesta: 'Los pronósticos exactos más rápidos se llevan los premios del Botín Mundialista. Te contactaremos por WhatsApp o correo para coordinar la entrega.',
    },
    {
        pregunta: '¿Mi bono sigue funcionando si los equipos avanzan de ronda?',
        respuesta: 'Sí. Cuando agregues tus equipos favoritos podrás agendar en tu calendario los partidos de octavos, cuartos, semifinal y final — se siguen sumando automáticamente con GanaConRetoucherie.',
    },
];

// Preguntas frecuentes para que el usuario entienda rápido la dinámica del evento.
export default function FAQ() {
    return (
        <div className="w-full max-w-md px-6 mt-10 relative z-10">
            <h2 className="text-center text-zinc-900 dark:text-white font-black text-xl mb-4">
                ❓ Preguntas frecuentes
            </h2>
            <div className="flex flex-col gap-2">
                {PREGUNTAS.map((item) => (
                    <details
                        key={item.pregunta}
                        className="group rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-sm dark:shadow-none backdrop-blur-lg p-4 [&_summary::-webkit-details-marker]:hidden"
                    >
                        <summary className="flex items-center justify-between gap-2 cursor-pointer list-none text-zinc-900 dark:text-white font-bold text-sm">
                            {item.pregunta}
                            <span className="text-amber-500 dark:text-amber-400 transition-transform group-open:rotate-45 text-lg flex-shrink-0">+</span>
                        </summary>
                        <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-2">{item.respuesta}</p>
                    </details>
                ))}
            </div>
        </div>
    );
}
