import { useEffect, useState } from 'react';
import { obtenerPozo } from '../api';

const BASE = { primero: 2000000, segundo: 1000000, tercero: 500000 };
const CAP  = { primero: 5000000, segundo: 2000000, tercero: 1000000 };
const UMBRAL_DINAMICO = 10000000;

function formatCOP(valor) {
    return `$${Number(valor).toLocaleString('es-CO')}`;
}

function WreathRing({ color }) {
    return (
        <svg viewBox="0 0 96 96" className="absolute inset-0 w-full h-full pointer-events-none">
            <g fill={color} opacity="0.9">
                <ellipse cx="17" cy="22" rx="4.5" ry="9" transform="rotate(-48 17 22)" />
                <ellipse cx="10" cy="38" rx="4.5" ry="9" transform="rotate(-22 10 38)" />
                <ellipse cx="11" cy="56" rx="4.5" ry="9" transform="rotate(8 11 56)" />
                <ellipse cx="21" cy="70" rx="4.5" ry="9" transform="rotate(34 21 70)" />
            </g>
            <g fill={color} opacity="0.9">
                <ellipse cx="79" cy="22" rx="4.5" ry="9" transform="rotate(48 79 22)" />
                <ellipse cx="86" cy="38" rx="4.5" ry="9" transform="rotate(22 86 38)" />
                <ellipse cx="85" cy="56" rx="4.5" ry="9" transform="rotate(-8 85 56)" />
                <ellipse cx="75" cy="70" rx="4.5" ry="9" transform="rotate(-34 75 70)" />
            </g>
        </svg>
    );
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
    const pctUmbral = Math.min((totalFact / UMBRAL_DINAMICO) * 100, 100);
    const superaUmbral = totalFact >= UMBRAL_DINAMICO;

    if (compact) {
        const MEDALLAS = [
            {
                puesto: '1°',
                valor: primero,
                cap: CAP.primero,
                wreathColor: '#B8860B',
                medalGrad: 'radial-gradient(circle at 35% 32%, #FDE047, #D97706)',
                medalShadow: '0 4px 16px rgba(251,191,36,0.55)',
                amountHex: '#92400E',
                capHex: '#B45309',
                podiumTop: '#FDE68A',
                podiumBot: '#F59E0B',
                starHex: '#FCD116',
            },
            {
                puesto: '2°',
                valor: segundo,
                cap: CAP.segundo,
                wreathColor: '#8B97A6',
                medalGrad: 'radial-gradient(circle at 35% 32%, #E5E7EB, #6B7280)',
                medalShadow: '0 4px 12px rgba(156,163,175,0.45)',
                amountHex: '#4B5563',
                capHex: '#9CA3AF',
                podiumTop: '#E5E7EB',
                podiumBot: '#9CA3AF',
                starHex: '#9CA3AF',
            },
            {
                puesto: '3°',
                valor: tercero,
                cap: CAP.tercero,
                wreathColor: '#92400E',
                medalGrad: 'radial-gradient(circle at 35% 32%, #FDBA74, #B45309)',
                medalShadow: '0 4px 12px rgba(180,83,9,0.45)',
                amountHex: '#9A3412',
                capHex: '#C2410C',
                podiumTop: '#FED7AA',
                podiumBot: '#EA580C',
                starHex: '#F97316',
            },
        ];

        return (
            <div
                className="rounded-2xl bg-white overflow-hidden"
                style={{ border: '1px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
            >
                {/* Header */}
                <div className="text-center pt-3 pb-1 px-4">
                    <div className="text-xl leading-none">🏆</div>
                    <p className="font-black text-zinc-900 text-[13px] uppercase tracking-wider mt-0.5 leading-tight">
                        Premio en vivo
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #FCD116)' }} />
                        <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-[0.14em] whitespace-nowrap">
                            Crece con cada bono
                        </p>
                        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, #FCD116)' }} />
                    </div>
                </div>

                {/* Three medal columns */}
                <div className="flex justify-around items-start px-2 pb-3 pt-1">
                    {MEDALLAS.map(({ puesto, valor, cap, wreathColor, medalGrad, medalShadow, amountHex, capHex, podiumTop, podiumBot, starHex }) => (
                        <div key={puesto} className="flex flex-col items-center" style={{ width: '30%' }}>
                            {/* Wreath + medal circle */}
                            <div className="relative flex items-center justify-center" style={{ width: 64, height: 72 }}>
                                <WreathRing color={wreathColor} />
                                <div
                                    className="relative z-10 flex items-center justify-center rounded-full"
                                    style={{
                                        width: 40, height: 40,
                                        background: medalGrad,
                                        boxShadow: medalShadow,
                                    }}
                                >
                                    <span className="text-white font-black text-sm drop-shadow-sm leading-none">{puesto}</span>
                                </div>
                            </div>

                            {/* Podium base (3D effect) */}
                            <div className="w-full px-1 -mt-1.5">
                                <div
                                    className="rounded-t-lg h-5"
                                    style={{
                                        background: `linear-gradient(to bottom, ${podiumTop}, ${podiumBot})`,
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.18)',
                                    }}
                                />
                                <div
                                    className="rounded-b-md h-2.5 mx-2"
                                    style={{
                                        background: `linear-gradient(to bottom, ${podiumBot}, ${podiumBot}99)`,
                                    }}
                                />
                            </div>

                            {/* Amount */}
                            <p
                                className="font-black text-sm mt-2 leading-tight tabular-nums"
                                style={{ color: amountHex }}
                            >
                                {formatCOP(valor)}
                            </p>
                            <p
                                className="text-[9px] font-semibold uppercase tracking-wide mt-0.5 leading-tight"
                                style={{ color: capHex }}
                            >
                                hasta {formatCOP(cap)}
                            </p>

                            {/* Star divider */}
                            <div className="flex items-center gap-1 mt-1.5">
                                <div className="h-px w-5" style={{ background: `linear-gradient(to left, ${starHex}90, transparent)` }} />
                                <span className="text-[8px]" style={{ color: starHex }}>★</span>
                                <div className="h-px w-5" style={{ background: `linear-gradient(to right, ${starHex}90, transparent)` }} />
                            </div>
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
