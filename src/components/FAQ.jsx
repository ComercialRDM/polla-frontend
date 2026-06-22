const PREGUNTAS = [
    {
        pregunta: '¿Qué pasa si varias personas aciertan?',
        respuesta: 'El premio se divide en partes iguales entre todos los que acertaron el marcador exacto.',
    },
    {
        pregunta: '¿Debo acertar el marcador exacto?',
        respuesta: 'Sí, el marcador debe ser exactamente igual al resultado final del partido.',
    },
    {
        pregunta: '¿Cuándo anuncian los ganadores?',
        respuesta: 'Se confirman apenas cierra el partido, normalmente dentro de las 24 horas siguientes. Después te contactamos por WhatsApp o correo para coordinar la entrega.',
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
