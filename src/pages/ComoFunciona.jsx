import { useEffect, useMemo, useRef } from 'react';
import { useSeo } from '../hooks/useSeo';
import { FAQ_COMO_FUNCIONA } from '../data/comoFuncionaData';
import HeroComoFunciona from '../components/como-funciona/HeroComoFunciona';
import PasosParticipar from '../components/como-funciona/PasosParticipar';
import PremiosSection from '../components/como-funciona/PremiosSection';
import PuntosFasesSection from '../components/como-funciona/PuntosFasesSection';
import BonosSection from '../components/como-funciona/BonosSection';
import InfoImportanteSection from '../components/como-funciona/InfoImportanteSection';
import FAQComoFunciona from '../components/como-funciona/FAQComoFunciona';
import CTAFinalComoFunciona from '../components/como-funciona/CTAFinalComoFunciona';
import CTAFijoMovil from '../components/como-funciona/CTAFijoMovil';
import Footer from '../components/Footer';

export default function ComoFunciona() {
    const rootRef = useRef(null);

    // El navegador oculta el contenido de un <details> cerrado mediante una
    // regla interna que no se puede pisar con CSS (no es solo display:none).
    // Para que el PDF impreso muestre todas las respuestas del FAQ, las
    // abrimos justo antes de imprimir y restauramos su estado después.
    useEffect(() => {
        function abrirParaImprimir() {
            rootRef.current?.querySelectorAll('details').forEach((d) => {
                d.dataset.cerradoOriginal = d.open ? '' : '1';
                d.open = true;
            });
        }
        function restaurarTrasImprimir() {
            rootRef.current?.querySelectorAll('details').forEach((d) => {
                if (d.dataset.cerradoOriginal === '1') d.open = false;
                delete d.dataset.cerradoOriginal;
            });
        }
        window.addEventListener('beforeprint', abrirParaImprimir);
        window.addEventListener('afterprint', restaurarTrasImprimir);
        return () => {
            window.removeEventListener('beforeprint', abrirParaImprimir);
            window.removeEventListener('afterprint', restaurarTrasImprimir);
        };
    }, []);

    const jsonLd = useMemo(
        () => ({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ_COMO_FUNCIONA.map((item) => ({
                '@type': 'Question',
                name: item.pregunta,
                acceptedAnswer: { '@type': 'Answer', text: item.respuesta },
            })),
        }),
        []
    );

    useSeo({
        title: '¿Cómo funciona la Polla Mundialista? - La Retoucherie de Manuela',
        description:
            'Entiende en 2 minutos cómo comprar tu bono, pronosticar los partidos del Mundial 2026 y ganar premios de hasta $5.000.000 COP con la Polla Mundialista de La Retoucherie.',
        path: '/como-funciona',
        jsonLd,
    });

    return (
        <div ref={rootRef} className="como-funciona-page min-h-screen w-full bg-white dark:bg-zinc-950">
            <main>
                <HeroComoFunciona />
                <PasosParticipar />
                <PremiosSection />
                <PuntosFasesSection />
                <BonosSection />
                <InfoImportanteSection />
                <FAQComoFunciona />
                <CTAFinalComoFunciona />
            </main>
            <div className="flex justify-center bg-zinc-100 dark:bg-zinc-950 print:bg-white">
                <Footer />
            </div>
            <CTAFijoMovil />
        </div>
    );
}
