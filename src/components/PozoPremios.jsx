import { useEffect, useState } from 'react';
import { obtenerPozo } from '../api';

const BASE = { primero: 2000000, segundo: 1000000, tercero: 500000 };
const CAP  = { primero: 5000000, segundo: 2000000, tercero: 1000000 };
const UMBRAL_DINAMICO = 10000000;

function formatCOP(valor) {
    return `$${Number(valor).toLocaleString('es-CO')}`;
}

export default function PozoPremios({ compact = false }) {
    const [pozo, setPozo] = useState(null);

    useEffect(() => {
        obtenerPozo().then((data) => {
            if (data?.success) setPozo(data);
        }).catch(() => {});

        const id = setInterval(() => {
            obtenerPozo().then((data) => {
                if (data?.success) setPozo(data);
            }).catch(() => {});
        }, 30000);
        return () => clearInterval(id);
    }, []);

    const primero = pozo?.primero ?? BASE.primero;
    const segundo = pozo?.segundo ?? BASE.segundo;
    const tercero = pozo?.tercero ?? BASE.tercero;
    const totalFact = Number(pozo?.total_fact ?? 0);

    // Progreso hacia el umbral dinámico (o hacia el cap del 1er puesto)
    const pctUmbral = Math.min((totalFact / UMBRAL_DINAMICO) * 100, 100);
    const superaUmbral = totalFact >= UMBRAL_DINAMICO;

    if (compact) {
        const MEDALLAS = [
            {
                puesto: '1°',
                valor: primero,
                cap: CAP.primero,
                circulo: 'bg-gradient-to-b from-yellow-300 to-amber-500 shadow-[0_2px_8px_rgba(251,191,36,0.5)]',
                texto: 'text-amber-400',
                cap_texto: 'text-amber-500/70',
            },
            {
                puesto: '2°',
                valor: segundo,
                cap: CAP.segundo,
                circulo: 'bg-gradient-to-b from-zinc-300 to-zinc-500 shadow-[0_2px_6px_rgba(160,160,160,0.4)]',
                texto: 'text-zinc-300 dark:text-zinc-200',
                cap_texto: 'text-zinc-400/70',
            },
            {
                puesto: '3°',
                valor: tercero,
                cap: CAP.tercero,
                circulo: 'bg-gradient-to-b from-orange-400 to-orange-700 shadow-[0_2px_6px_rgba(194,120,40,0.4)]',
                texto: 'text-orange-400',
                cap_texto: 'text-orange-400/70',
            },
        ];
        return (
            <div className="rounded-2xl border border-amber-400/30 bg-white dark:bg-slate-900/60 shadow-sm dark:shadow-[0_0_15px_rgba(234,179,8,0.15)] backdrop-blur-lg px-4 pt-3 pb-3">
                <div className="flex items-center justify-center gap-1.5 mb-3">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                    </span>
                    <p className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Premio en vivo · crece con cada bono</p>
                </div>
                <div className="flex justify-around gap-1">
                    {MEDALLAS.map(({ puesto, valor, cap, circulo, texto, cap_texto }) => (
                        <div key={puesto} className="flex flex-col items-center gap-1">
                            <div className={`w-8 h-8 rounded-full ${circulo} flex items-center justify-center`}>
                                <span className="text-white font-black text-sm leading-none drop-shadow">{puesto}</span>
                            </div>
                            <p className={`${texto} font-black text-sm leading-tight tabular-nums`}>{formatCOP(valor)}</p>
                            <p className={`${cap_texto} text-[9px] font-semibold leading-tight tabular-nums`}>hasta {formatCOP(cap)}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-amber-400/30 bg-white dark:bg-slate-900/60 shadow-sm dark:shadow-[0_0_20px_rgba(234,179,8,0.2)] backdrop-blur-lg p-5 mb-6">
            <div className="text-center mb-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider mb-1">Tabla de premios en tiempo real</p>
                <p className="text-zinc-400 dark:text-zinc-500 text-xs">Se actualiza con cada bono vendido</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-300/40 dark:border-amber-500/30 p-3 text-center">
                    <p className="text-xl mb-1">🥇</p>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-0.5">1er puesto</p>
                    <p className="text-amber-600 dark:text-amber-400 font-black text-sm leading-tight">{formatCOP(primero)}</p>
                    {primero >= CAP.primero && (
                        <p className="text-amber-500 text-xs mt-0.5 font-bold">MÁXIMO</p>
                    )}
                </div>
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-white/10 p-3 text-center">
                    <p className="text-xl mb-1">🥈</p>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-0.5">2do puesto</p>
                    <p className="text-zinc-700 dark:text-zinc-200 font-black text-sm leading-tight">{formatCOP(segundo)}</p>
                    {segundo >= CAP.segundo && (
                        <p className="text-zinc-400 text-xs mt-0.5 font-bold">MÁXIMO</p>
                    )}
                </div>
                <div className="rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200/60 dark:border-orange-500/20 p-3 text-center">
                    <p className="text-xl mb-1">🥉</p>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-0.5">3er puesto</p>
                    <p className="text-orange-600 dark:text-orange-400 font-black text-sm leading-tight">{formatCOP(tercero)}</p>
                    {tercero >= CAP.tercero && (
                        <p className="text-orange-500 text-xs mt-0.5 font-bold">MÁXIMO</p>
                    )}
                </div>
            </div>

            {!superaUmbral && (
                <div className="mb-3">
                    <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                        <span>Facturado: {formatCOP(totalFact)}</span>
                        <span>Meta +10%: {formatCOP(UMBRAL_DINAMICO)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
                            style={{ width: `${pctUmbral}%` }}
                        />
                    </div>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 text-center">
                        Al superar {formatCOP(UMBRAL_DINAMICO)} en ventas, el 10% de cada peso adicional engrosa la tabla de premios
                    </p>
                </div>
            )}

            {superaUmbral && (
                <p className="text-center text-xs text-amber-500 font-semibold mb-2">
                    La tabla de premios ya está en modo dinámico — crece con cada bono vendido
                </p>
            )}

            <p className="text-center text-zinc-400 dark:text-zinc-500 text-xs">
                Vigentes hasta el fin del Mundial 2026 · Premios en Gift Cards
            </p>
        </div>
    );
}
