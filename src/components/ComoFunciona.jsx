const PASOS = [
    { icono: '⚽', titulo: 'Elige tu marcador', descripcion: 'Predice el resultado exacto.' },
    { icono: '🎟️', titulo: 'Compra tu bono', descripcion: 'Válido en servicios de arreglos de prendas de vestir hasta el 1 de marzo de 2027.' },
    { icono: '🏆', titulo: 'Gana si aciertas', descripcion: 'Gana hasta $1.000.000 si aciertas el marcador. Si hay empate, se reparte entre el número de ganadores.' },
];

export default function ComoFunciona() {
    return (
        <div className="w-full">
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
