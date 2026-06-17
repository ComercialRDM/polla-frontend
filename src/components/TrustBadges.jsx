import sslImg from '../assets/ssl secure.jpg';
import wompiImg from '../assets/Wompi_Logo.jpg';
import pseImg from '../assets/boton-pse.png';
import visaImg from '../assets/visa_logo.jpg';
import mastercardImg from '../assets/Mastercard-Logo-PNG-HD.png';

export default function TrustBadges({ compact = false }) {
    return (
        <div className={`flex flex-col items-center gap-2 ${compact ? '' : 'py-2'}`}>
            <div className="flex items-center flex-wrap justify-center gap-2">

                <span className="inline-flex items-center bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40 px-2 py-1 rounded-md">
                    <img src={sslImg} alt="SSL Seguro" className="h-5 w-auto object-contain" />
                </span>

                <span className="inline-flex items-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 px-2 py-1 rounded-md">
                    <img src={wompiImg} alt="Wompi" className="h-5 w-auto object-contain" />
                </span>

                <span className="inline-flex items-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 px-2 py-1 rounded-md">
                    <img src={pseImg} alt="PSE" className="h-5 w-auto object-contain" />
                </span>

                <span className="inline-flex items-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 px-2 py-1 rounded-md">
                    <img src={visaImg} alt="Visa" className="h-5 w-auto object-contain" />
                </span>

                <span className="inline-flex items-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 px-2 py-1 rounded-md">
                    <img src={mastercardImg} alt="Mastercard" className="h-5 w-auto object-contain" />
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
