export default function TrustBadges({ compact = false }) {
    return (
        <div className={`flex flex-col items-center gap-2 ${compact ? '' : 'py-2'}`}>
            <div className="flex items-center flex-wrap justify-center gap-2">

                {/* SSL Seguro */}
                <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-md">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                    </svg>
                    SSL Seguro
                </span>

                {/* Wompi */}
                <span className="inline-flex items-center gap-1 bg-[#e6faf8] dark:bg-[#00b3a4]/10 border border-[#00b3a4]/40 text-[10px] font-bold px-2 py-1 rounded-md">
                    <svg className="w-8 h-3.5" viewBox="0 0 80 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <text x="0" y="20" fontFamily="Arial" fontWeight="bold" fontSize="20" fill="#00b3a4">wompi</text>
                    </svg>
                </span>

                {/* PSE */}
                <span className="inline-flex items-center gap-1 bg-[#e6f4ea] dark:bg-[#00a650]/10 border border-[#00a650]/40 text-[10px] font-bold px-2 py-1 rounded-md">
                    <svg className="w-8 h-3.5" viewBox="0 0 56 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <text x="0" y="18" fontFamily="Arial" fontWeight="bold" fontSize="18" fill="#00a650">PSE</text>
                    </svg>
                </span>

                {/* Visa */}
                <span className="inline-flex items-center bg-[#1a1f71] border border-[#1a1f71]/30 px-2 py-1 rounded-md">
                    <svg className="w-8 h-3.5" viewBox="0 0 80 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <text x="0" y="22" fontFamily="Arial" fontWeight="bold" fontSize="24" fontStyle="italic" fill="#ffffff" letterSpacing="-1">VISA</text>
                    </svg>
                </span>

                {/* Mastercard */}
                <span className="inline-flex items-center gap-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 px-2 py-1 rounded-md">
                    <svg className="w-8 h-4" viewBox="0 0 52 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="14" r="12" fill="#EB001B"/>
                        <circle cx="36" cy="14" r="12" fill="#F79E1B"/>
                        <path d="M26 5.5A12 12 0 0 1 30.9 14 12 12 0 0 1 26 22.5 12 12 0 0 1 21.1 14 12 12 0 0 1 26 5.5z" fill="#FF5F00"/>
                    </svg>
                </span>

            </div>
            {!compact && (
                <p className="text-zinc-400 dark:text-zinc-500 text-[10px] text-center">
                    Pagos procesados por Wompi (Bancolombia) · Transacciones cifradas 256-bit
                </p>
            )}
        </div>
    );
}
