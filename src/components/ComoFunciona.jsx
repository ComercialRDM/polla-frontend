const PASOS = [
    { icono: '⚽', titulo: 'Elige tu marcador', descripcion: 'Predice el resultado exacto.' },
    { icono: '🎟️', titulo: 'Compra tu bono', descripcion: 'Conserva su valor en servicios.' },
    { icono: '🏆', titulo: 'Gana si aciertas', descripcion: 'Participa por el premio.' },
];

export default function ComoFunciona() {
    return (
        <div className="w-full max-w-md px-4 mt-8">
            <h2 className="text-center font-display text-xl text-zinc-900 dark:text-white uppercase tracking-wide mb-4">
                ¿Cómo funciona?
            </h2>
            <div className="grid grid-cols-3 gap-2 text-center">
                {PASOS.map((paso) => (
                    <div key={paso.titulo} className="flex flex-col items-center">
                        <span className="text-4xl mb-2">{paso.icono}</span>
                        <p className="text-zinc-900 dark:text-white font-bold text-xs leading-tight">{paso.titulo}</p>
                        <p className="text-zinc-500 dark:text-zinc-400 text-[10px] mt-1">{paso.descripcion}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
