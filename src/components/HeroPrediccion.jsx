import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerPartidos } from '../api';
import { partidosFuturos } from '../utils/partidos';
import { guardarDatosComprador, obtenerDatosComprador } from '../utils/datosComprador';
import { guardarMarcadorPendiente } from '../utils/marcadorPendiente';
import Bandera from './Bandera';
import CountdownPartido from './CountdownPartido';
import PozoPremios from './PozoPremios';
import imagenColombiaCongo from '../assets/partido-colombia-vs-congo.jpg';

const esColombia = (p) =>
    p && (p.equipo_local.toLowerCase() === 'colombia' || p.equipo_visitante.toLowerCase() === 'colombia');

// Gráfica promocional específica para este partido (no genérica): solo se
// muestra cuando el partido destacado es justo Colombia vs RD Congo.
const esColombiaVsCongo = (p) =>
    p && (p.equipo_local.toLowerCase().includes('congo') || p.equipo_visitante.toLowerCase().includes('congo'))
      && esColombia(p);

// Hero principal: captura marcador + datos de contacto ANTES de pagar. Al
// enviar, guarda la predicción en localStorage (marcadorPendiente.js) y los
// datos de contacto (datosComprador.js, ya usado por Comprar.jsx) y navega a
// /comprar?partido=X — Gracias.jsx confirma el pronóstico automáticamente
// apenas Wompi aprueba el pago, usando el endpoint de voto ya existente.
export default function HeroPrediccion() {
    const navigate = useNavigate();
    const [partido, setPartido] = useState(null);
    const [local, setLocal] = useState('');
    const [visitante, setVisitante] = useState('');
    const [form, setForm] = useState(() => obtenerDatosComprador());
    const [error, setError] = useState('');

    useEffect(() => {
        obtenerPartidos()
            .then((data) => {
                if (!data?.success || !data.partidos.length) return;
                const futuros = partidosFuturos(data.partidos, 20);
                const colombia = futuros.find(esColombia);
                setPartido(colombia ?? futuros[0] ?? null);
            })
            .catch(() => {});
    }, []);

    function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!partido) {
            setError('No hay partidos disponibles en este momento.');
            return;
        }
        if (local === '' || visitante === '') {
            setError('Ingresa el marcador completo.');
            return;
        }
        if (!form.nombre?.trim()) {
            setError('Ingresa tu nombre completo.');
            return;
        }
        if (!form.correo?.trim()) {
            setError('Ingresa tu correo electrónico.');
            return;
        }
        if (!form.celular?.trim()) {
            setError('Ingresa tu número de WhatsApp.');
            return;
        }

        guardarDatosComprador(form);
        guardarMarcadorPendiente({ partido_id: partido.id, local: Number(local), visitante: Number(visitante) });
        navigate(`/comprar?partido=${partido.id}`);
    }

    if (!partido) return null;

    return (
        <div className="w-full max-w-md px-4 mt-4 flex flex-col gap-3">
            {esColombiaVsCongo(partido) && (
                <img
                    src={imagenColombiaCongo}
                    alt="¿Aciertas el marcador? Colombia vs RD Congo, 23 de junio 9:00 PM, gana hasta $1.000.000"
                    className="w-full rounded-2xl shadow-lg"
                />
            )}
            <div className="rounded-2xl border-2 border-[#FCD116] bg-zinc-950 p-5 shadow-[0_0_30px_rgba(252,209,22,0.25)]">
                <p className="text-center text-[#FCD116] font-black text-lg leading-tight mb-3">
                    🏆 Acierta el marcador{esColombia(partido) ? ' y gana hasta $1.000.000' : ' y gana premios'}
                </p>

                <div className="flex items-center justify-center gap-2 mb-1 text-white font-bold text-base">
                    <Bandera equipo={partido.equipo_local} className="w-7 h-7" /> {partido.equipo_local}
                    <span className="text-zinc-500 text-sm">vs</span>
                    <Bandera equipo={partido.equipo_visitante} className="w-7 h-7" /> {partido.equipo_visitante}
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4">
                    <div className="flex items-center justify-center gap-3">
                        <input
                            type="number"
                            inputMode="numeric"
                            min="0"
                            max="20"
                            value={local}
                            onChange={(e) => setLocal(e.target.value)}
                            aria-label={`Goles de ${partido.equipo_local}`}
                            className="w-16 text-center text-2xl font-black rounded-xl border-2 border-amber-400 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <span className="text-white font-black text-xl">-</span>
                        <input
                            type="number"
                            inputMode="numeric"
                            min="0"
                            max="20"
                            value={visitante}
                            onChange={(e) => setVisitante(e.target.value)}
                            aria-label={`Goles de ${partido.equipo_visitante}`}
                            className="w-16 text-center text-2xl font-black rounded-xl border-2 border-amber-400 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    <input
                        type="text"
                        placeholder="Nombre completo"
                        value={form.nombre || ''}
                        onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                        className="w-full rounded-lg bg-white dark:bg-zinc-900 border border-white/10 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={form.correo || ''}
                        onChange={(e) => setForm((f) => ({ ...f, correo: e.target.value }))}
                        className="w-full rounded-lg bg-white dark:bg-zinc-900 border border-white/10 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <input
                        type="tel"
                        placeholder="WhatsApp"
                        value={form.celular || ''}
                        onChange={(e) => setForm((f) => ({ ...f, celular: e.target.value }))}
                        className="w-full rounded-lg bg-white dark:bg-zinc-900 border border-white/10 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />

                    {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                    <button
                        type="submit"
                        className="w-full py-4 rounded-xl font-black text-zinc-950 text-lg bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform"
                    >
                        QUIERO PARTICIPAR
                    </button>
                </form>
            </div>

            <CountdownPartido partido={partido} />
            <PozoPremios compact />
        </div>
    );
}
