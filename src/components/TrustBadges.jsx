import wompiImg from '../assets/wompi_opt.png';
import pseImg from '../assets/pse_opt.png';
import sslImg from '../assets/ssl_opt.png';

export default function TrustBadges({ compact = false }) {
    return (
        <div className={`flex flex-col items-center gap-2 ${compact ? '' : 'py-2'}`}>
            <div className="flex items-center flex-wrap justify-center gap-2">

                {/* SSL Seguro */}
                <span className="inline-flex items-center bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40 px-2 py-1 rounded-md">
                    <img src={sslImg} alt="SSL Seguro" className="h-8 w-auto object-contain" width="40" height="40" />
                </span>

                {/* Wompi */}
                <span className="inline-flex items-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 px-2 py-1 rounded-md">
                    <img src={wompiImg} alt="Wompi" className="h-8 w-auto object-contain" width="71" height="40" />
                </span>

                {/* PSE */}
                <span className="inline-flex items-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 px-2 py-1 rounded-md">
                    <img src={pseImg} alt="PSE" className="h-8 w-auto object-contain" width="79" height="48" />
                </span>

                {/* Visa — SVG inline (fiel al logo) */}
                <span className="inline-flex items-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 px-2 py-1 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 240" height="24" aria-label="Visa">
                        <rect width="750" height="240" rx="20" fill="#1434CB"/>
                        <text x="375" y="188" fontFamily="Arial,Helvetica,sans-serif" fontStyle="italic" fontWeight="900" fontSize="190" fill="white" textAnchor="middle">VISA</text>
                    </svg>
                </span>

                {/* Mastercard — SVG inline */}
                <span className="inline-flex items-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 px-2 py-1 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 24" height="28" aria-label="Mastercard">
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
