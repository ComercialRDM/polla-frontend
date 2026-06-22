// Aviso de urgencia: hay un tope real de 3.000 bonos fijado por el negocio,
// pero no se muestra la cifra exacta vendida/restante para no restarle
// urgencia al mensaje cuando las ventas todavía son pocas.
export default function CuposRestantes() {
    return (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/15 border border-red-300/40 dark:border-red-500/30 px-4 py-2.5 flex items-center gap-2">
            <span className="text-lg flex-shrink-0">🔥</span>
            <p className="text-red-600 dark:text-red-400 text-xs font-bold leading-snug">
                Cupos limitados — asegura tu bono antes de que se agoten.
            </p>
        </div>
    );
}
