import { useEffect, useState } from 'react';
import { obtenerPozo } from '../api';

const BASE = { primero: 2000000, segundo: 1000000, tercero: 500000 };
const CAP  = { primero: 5000000, segundo: 2000000, tercero: 1000000 };
const UMBRAL_DINAMICO = 10000000;

function formatCOP(valor) {
    return `$${Number(valor).toLocaleString('es-CO')}`;
}

// Laurel wreath — two branches (left + right), clear gap at top
function WreathRing({ color }) {
    // Long narrow leaf pointing up: tip at radius 46, base at radius 26
    const leaf = 'M50,24 Q57,13 50,4 Q43,13 50,24 Z';
    // Inner highlight to give each leaf a subtle 3D look
    const shine = 'M50,21 Q53,13 50,7 Q47,13 50,21 Z';
    // 5 leaves per branch, gap of ~160° at top
    const left  = [213, 238, 261, 284, 311];
    const right = [147, 122,  99,  76,  49];
    const all   = [...left, ...right];
    return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
            {all.map((a, i) => (
                <g key={i} transform={`rotate(${a},50,50)`}>
                    <path d={leaf} fill={color} opacity="0.9"/>
                    <path d={shine} fill="rgba(255,255,255,0.35)" opacity="0.7"/>
                </g>
            ))}
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
                medalGrad: 'radial-gradient(circle at 38% 32%, #FDE68A, #F59E0B, #B45309)',
                medalShadow: '0 4px 16px rgba(234,179,8,0.55)',
                amountHex: '#92400E',
                capHex: '#B45309',
                // podium colors
                discTop: '#FDE68A',
                discBot: '#F59E0B',
                bodyL: '#D97706',
                bodyR: '#FDE68A',
                bodyC: '#F59E0B',
                starHex: '#FCD116',
                lineHex: '#D4AF37',
            },
            {
                puesto: '2°',
                valor: segundo,
                cap: CAP.segundo,
                wreathColor: '#8B97A6',
                medalGrad: 'radial-gradient(circle at 38% 32%, #F3F4F6, #9CA3AF, #4B5563)',
                medalShadow: '0 4px 12px rgba(156,163,175,0.5)',
                amountHex: '#4B5563',
                capHex: '#9CA3AF',
                discTop: '#E5E7EB',
                discBot: '#9CA3AF',
                bodyL: '#6B7280',
                bodyR: '#E5E7EB',
                bodyC: '#9CA3AF',
                starHex: '#9CA3AF',
                lineHex: '#9CA3AF',
            },
            {
                puesto: '3°',
                valor: tercero,
                cap: CAP.tercero,
                wreathColor: '#8B4513',
                medalGrad: 'radial-gradient(circle at 38% 32%, #FED7AA, #F97316, #9A3412)',
                medalShadow: '0 4px 12px rgba(234,88,12,0.45)',
                amountHex: '#9A3412',
                capHex: '#C2410C',
                discTop: '#FED7AA',
                discBot: '#EA580C',
                bodyL: '#C2410C',
                bodyR: '#FED7AA',
                bodyC: '#EA580C',
                starHex: '#F97316',
                lineHex: '#CD7F32',
            },
        ];

        return (
            <div
                className="rounded-2xl bg-white overflow-hidden"
                style={{ border: '1px solid #E9E3D8', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}
            >
                {/* Header */}
                <div className="text-center pt-3 pb-1 px-4">
                    <div className="text-xl leading-none">🏆</div>
                    <p className="font-black text-zinc-900 text-sm uppercase tracking-wider mt-0.5 leading-tight">
                        Premio en vivo
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #D4AF37)' }} />
                        <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-[0.15em] whitespace-nowrap">
                            Crece con cada bono
                        </p>
                        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, #D4AF37)' }} />
                    </div>
                </div>

                {/* Three medal columns */}
                <div className="flex justify-around items-end px-1 pb-3 pt-2">
                    {MEDALLAS.map(({ puesto, valor, cap, wreathColor, medalGrad, medalShadow, amountHex, capHex, discTop, discBot, bodyL, bodyR, bodyC, starHex, lineHex }) => (
                        <div key={puesto} className="flex flex-col items-center" style={{ width: '31%' }}>
                            {/* Wreath + medal circle */}
                            <div className="relative flex items-center justify-center" style={{ width: 72, height: 76 }}>
                                <WreathRing color={wreathColor} />
                                <div
                                    className="relative z-10 flex items-center justify-center rounded-full"
                                    style={{
                                        width: 44, height: 44,
                                        background: medalGrad,
                                        boxShadow: medalShadow,
                                    }}
                                >
                                    <span className="text-white font-black text-sm drop-shadow-sm leading-none">{puesto}</span>
                                </div>
                            </div>

                            {/* 3D Podium — disc + cylinder body + bottom disc */}
                            <div className="w-full px-0.5" style={{ marginTop: -4 }}>
                                {/* Top disc */}
                                <div
                                    className="rounded-full h-3.5 w-full"
                                    style={{
                                        background: `linear-gradient(to bottom, ${discTop}, ${discBot})`,
                                        boxShadow: `0 3px 8px rgba(0,0,0,0.22)`,
                                    }}
                                />
                                {/* Cylinder body */}
                                <div
                                    className="w-11/12 mx-auto"
                                    style={{
                                        height: 22,
                                        background: `linear-gradient(to right, ${bodyL} 0%, ${bodyC} 40%, ${bodyR} 70%, ${bodyC} 100%)`,
                                        boxShadow: `0 6px 14px rgba(0,0,0,0.28)`,
                                    }}
                                />
                                {/* Bottom disc */}
                                <div
                                    className="rounded-b-full h-3 w-11/12 mx-auto"
                                    style={{
                                        background: `linear-gradient(to bottom, ${discBot}, ${bodyL})`,
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
                                className="text-[9px] font-bold uppercase tracking-wide mt-0.5 leading-tight"
                                style={{ color: capHex }}
                            >
                                hasta {formatCOP(cap)}
                            </p>

                            {/* Star divider */}
                            <div className="flex items-center gap-1 mt-1.5">
                                <div className="h-px w-5" style={{ background: `linear-gradient(to left, ${lineHex}80, transparent)` }} />
                                <span className="text-[9px]" style={{ color: starHex }}>★</span>
                                <div className="h-px w-5" style={{ background: `linear-gradient(to right, ${lineHex}80, transparent)` }} />
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
                    {primero >= CAP.primero && <p className="text-amber-500 text-xs mt-0.5 font-bold">MÁXIMO</p>}
                </div>
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-white/10 p-3 text-center">
                    <p className="text-xl mb-1">🥈</p>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-0.5">2do puesto</p>
                    <p className="text-zinc-700 dark:text-zinc-200 font-black text-sm leading-tight">{formatCOP(segundo)}</p>
                    {segundo >= CAP.segundo && <p className="text-zinc-400 text-xs mt-0.5 font-bold">MÁXIMO</p>}
                </div>
                <div className="rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200/60 dark:border-orange-500/20 p-3 text-center">
                    <p className="text-xl mb-1">🥉</p>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-0.5">3er puesto</p>
                    <p className="text-orange-600 dark:text-orange-400 font-black text-sm leading-tight">{formatCOP(tercero)}</p>
                    {tercero >= CAP.tercero && <p className="text-orange-500 text-xs mt-0.5 font-bold">MÁXIMO</p>}
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
