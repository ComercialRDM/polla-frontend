export default function TrustBadges({ compact = false }) {
    return (
        <div className={`flex flex-col items-center gap-2 ${compact ? '' : 'py-2'}`}>
            <div className="flex items-center flex-wrap justify-center gap-2">

                {/* SSL Seguro */}
                <span className="inline-flex items-center bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40 px-2 py-1 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 22" height="18" aria-label="SSL Seguro">
                        <rect x="1" y="10" width="13" height="10" rx="2" fill="#16A34A"/>
                        <path d="M2.5 10V7a5 5 0 0 1 10 0v3" fill="none" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round"/>
                        <text x="40" y="16" fontFamily="Arial,Helvetica,sans-serif" fontWeight="800" fontSize="11" fill="#16A34A" textAnchor="middle" letterSpacing="0.5">SEGURO</text>
                    </svg>
                </span>

                {/* Wompi */}
                <span className="inline-flex items-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 px-2 py-1 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 22" height="20" aria-label="Wompi">
                        <text x="31" y="17" fontFamily="Arial,Helvetica,sans-serif" fontWeight="700" fontSize="16" fill="#7C3AED" textAnchor="middle">wompi</text>
                    </svg>
                </span>

                {/* PSE */}
                <span className="inline-flex items-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 px-2 py-1 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 22" height="20" aria-label="PSE">
                        <rect width="44" height="22" rx="3" fill="#CC0000"/>
                        <text x="22" y="16" fontFamily="Arial,Helvetica,sans-serif" fontWeight="800" fontSize="12" fill="white" textAnchor="middle" letterSpacing="0.8">PSE</text>
                    </svg>
                </span>

                {/* Visa */}
                <span className="inline-flex items-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 px-2 py-1 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 240" height="18" aria-label="Visa">
                        <rect width="750" height="240" rx="20" fill="#1434CB"/>
                        <text x="375" y="188" fontFamily="Arial,Helvetica,sans-serif" fontStyle="italic" fontWeight="900" fontSize="190" fill="white" textAnchor="middle">VISA</text>
                    </svg>
                </span>

                {/* Mastercard */}
                <span className="inline-flex items-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 px-2 py-1 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 24" height="20" aria-label="Mastercard">
                        <circle cx="14" cy="12" r="11" fill="#EB001B"/>
                        <circle cx="24" cy="12" r="11" fill="#F79E1B"/>
                        <path d="M19,2.2 A11,11 0 0,1 19,21.8 A11,11 0 0,0 19,2.2Z" fill="#FF5F00"/>
                    </svg>
                </span>

            </div>
            {!compact && (
                <p className="text-zinc-500 dark:text-zinc-400 text-[10px] text-center">
                    Pagos procesados por Wompi (Bancolombia) · Transacciones cifradas 256-bit
                </p>
            )}
        </div>
    );
}
