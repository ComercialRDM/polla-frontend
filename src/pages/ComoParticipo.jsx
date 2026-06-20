const PASOS = [
    { emoji: '💳', titulo: 'Compra tu Bono Digital', descripcion: 'Elige el plan que más te guste: $50.000, $100.000 o $200.000.' },
    { emoji: '🎁', titulo: 'Recibe tu bono y tus intentos', descripcion: 'Te llega por correo tu Bono Digital y tus intentos para pronosticar.' },
    { emoji: '⚽', titulo: 'Predice el marcador de Colombia', descripcion: 'Antes de que inicie el partido, ingresa tu pronóstico exacto.' },
    { emoji: '🏆', titulo: 'Gana premios si aciertas', descripcion: 'Los pronósticos exactos se llevan premios y usan su bono en La Retoucherie.' },
];

export default function ComoParticipo() {
    return (
        <div className="min-h-screen flex flex-col items-center bg-white dark:bg-zinc-950 stadium-glow pb-28">
            <div className="w-full flex">
                <div className="flex-1 bg-colombia-yellow h-2" />
                <div className="flex-1 bg-colombia-blue h-2" />
                <div className="flex-1 bg-colombia-red h-2" />
            </div>

            <div className="w-full max-w-md px-6 mt-8 relative z-10">
                <h1 className="text-center text-zinc-900 dark:text-white font-black text-xl mb-1">
                    ❓ ¿Cómo funciona?
                </h1>
                <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm mb-4">
                    Así de fácil es participar y ganar premios en la Polla Mundialista.
                </p>

                <div className="flex flex-col gap-3">
                    {PASOS.map((paso, i) => (
                        <div
                            key={paso.titulo}
                            className="flex items-start gap-3 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-sm dark:shadow-none backdrop-blur-lg p-4"
                        >
                            <span className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-[0_0_12px_rgba(234,179,8,0.5)] flex items-center justify-center text-xl font-black text-zinc-950">
                                {i + 1}
                            </span>
                            <div>
                                <p className="text-zinc-900 dark:text-white font-bold text-sm">{paso.emoji} {paso.titulo}</p>
                                <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">{paso.descripcion}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
