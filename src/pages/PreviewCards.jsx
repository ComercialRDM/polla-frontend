/**
 * PÁGINA TEMPORAL DE PREVIEW — borrar después de elegir estilo.
 * Visitar en: http://localhost:5173/preview-cards
 */
import { formatoPesos } from '../config/planes';

const plan = { valor: 50000, saldoBono: 80000, intentos: 5, etiqueta: '5 cupos' };
const bono = plan.saldoBono - plan.valor;

function CardContent() {
    return (
        <>
            <span className="absolute -top-3 left-6 text-[10px] font-black uppercase px-3 py-1 rounded-full bg-amber-400 text-zinc-950">
                ⭐ Favorito
            </span>
            <p className="font-black text-zinc-950 dark:text-white text-lg leading-tight mt-1">
                {plan.etiqueta}
            </p>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-3">
                Polla Mundialista
            </p>
            <p className="font-display text-3xl text-zinc-950 dark:text-white">{formatoPesos(plan.valor)}</p>
            <span className="inline-flex items-center gap-1 self-start mt-3 px-3 py-1 rounded-full bg-green-100 dark:bg-green-400/10 text-green-700 dark:text-green-400 text-xs font-black uppercase tracking-wide">
                +{formatoPesos(bono)} gratis
            </span>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2 mb-5">
                Recibes <strong className="text-zinc-700 dark:text-zinc-200">{formatoPesos(plan.saldoBono)}</strong> en servicios
            </p>
            <span className="mt-auto w-full flex items-center justify-between gap-2">
                <span className="text-sm text-zinc-600 dark:text-zinc-300 font-semibold">Comprar este bono</span>
                <span className="shrink-0 inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[#FCD116] text-zinc-950 font-black text-sm">
                    Comprar →
                </span>
            </span>
        </>
    );
}

const variantes = [
    {
        id: 'actual',
        label: 'Actual (referencia)',
        desc: 'Como está hoy en la página.',
        className: 'border-2 border-amber-400 bg-amber-50 dark:bg-amber-400/5 shadow-lg shadow-amber-400/10',
    },
    {
        id: 'A',
        label: 'Opción A — Shadow multicapa',
        desc: 'Profundidad con sombras apiladas. Estilo premium tipo Stripe/Apple. Sutil y elegante.',
        className:
            'border-2 border-amber-400 bg-amber-50 dark:bg-amber-400/5 ' +
            'shadow-[0_1px_2px_rgba(0,0,0,0.07),0_4px_12px_rgba(0,0,0,0.09),0_20px_48px_rgba(0,0,0,0.08)] ' +
            'dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_4px_12px_rgba(0,0,0,0.5),0_20px_48px_rgba(0,0,0,0.6)]',
    },
    {
        id: 'B',
        label: 'Opción B — Borde inferior grueso',
        desc: 'Simula grosor físico de la tarjeta. El efecto más parecido a la imagen del portátil.',
        className:
            'border-2 border-amber-400 border-b-[6px] border-b-amber-600 bg-amber-50 dark:bg-amber-400/5',
    },
    {
        id: 'C',
        label: 'Opción C — Sombra desplazada',
        desc: 'Sombra corrida hacia abajo-derecha. Estilo clásico de tarjeta física, más llamativo.',
        className:
            'border-2 border-amber-400 bg-amber-50 dark:bg-amber-400/5 ' +
            'shadow-[6px_10px_0px_rgba(0,0,0,0.10),0_2px_4px_rgba(0,0,0,0.06)] ' +
            'dark:shadow-[6px_10px_0px_rgba(0,0,0,0.55),0_2px_4px_rgba(0,0,0,0.4)]',
    },
    {
        id: 'AB',
        label: 'Combinación A + B',
        desc: 'Shadow multicapa + borde inferior grueso. Máximo efecto premium con profundidad real.',
        className:
            'border-2 border-amber-400 border-b-[6px] border-b-amber-600 bg-amber-50 dark:bg-amber-400/5 ' +
            'shadow-[0_1px_2px_rgba(0,0,0,0.07),0_4px_12px_rgba(0,0,0,0.09),0_20px_48px_rgba(0,0,0,0.08)] ' +
            'dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_4px_12px_rgba(0,0,0,0.5),0_20px_48px_rgba(0,0,0,0.6)]',
    },
];

export default function PreviewCards() {
    return (
        <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 px-6 py-16">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-black text-zinc-950 dark:text-white text-center mb-2">
                    Preview de estilos — tarjetas 3D
                </h1>
                <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm mb-14">
                    Página temporal · <a href="/" className="underline">Volver al inicio</a>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    {variantes.map((v) => (
                        <div key={v.id} className="flex flex-col gap-3">
                            <div className="relative flex flex-col rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 min-h-[280px] select-none" style={{ position: 'relative' }}>
                                <div className={`absolute inset-0 rounded-3xl ${v.className}`} />
                                <div className="relative z-10 flex flex-col h-full">
                                    <CardContent />
                                </div>
                            </div>
                            <div className="px-1">
                                <p className="font-bold text-zinc-900 dark:text-white text-sm">{v.label}</p>
                                <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5 leading-relaxed">{v.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-center text-zinc-400 dark:text-zinc-600 text-xs mt-16">
                    Esta página es solo para comparar — no está en producción. Dile a Claude cuál te gusta y lo aplica en &lt;2 min.
                </p>
            </div>
        </div>
    );
}
