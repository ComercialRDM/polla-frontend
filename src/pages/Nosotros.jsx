import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

const WHATSAPP_NUMERO = '573103963708';
const INSTAGRAM_USUARIO = '@retoucherie_col';

const SEDES = [
    { ciudad: 'Barranquilla', nombre: 'Cc Buenavista', direccion: 'Sótano 2, local 17', telefono: '6053131966' },
    { ciudad: 'Barranquilla', nombre: 'Cc Viva Barranquilla', direccion: 'Sótano 1', telefono: '6053093750' },
    { ciudad: 'Barranquilla', nombre: 'Cc Aranjuez', direccion: 'Calle 82 #53', telefono: '6052022021' },
    { ciudad: 'Cartagena', nombre: 'Cc Caribe Plaza', direccion: 'Sótano 1', telefono: '6056515251' },
];

export default function Nosotros() {
    return (
        <div className="min-h-screen flex flex-col items-center bg-white dark:bg-zinc-950 stadium-glow pb-28">
            <div className="w-full flex">
                <div className="flex-1 bg-colombia-yellow h-2" />
                <div className="flex-1 bg-colombia-blue h-2" />
                <div className="flex-1 bg-colombia-red h-2" />
            </div>

            <div className="w-full max-w-md px-6 mt-8 relative z-10">
                <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-sm dark:shadow-none backdrop-blur-lg p-6 text-center">
                    <h1 className="text-zinc-900 dark:text-white font-black text-xl mb-2">📍 Quiénes somos</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">
                        La Retoucherie es un centro de belleza y bienestar con sedes en Barranquilla y Cartagena.
                        Esta Polla Mundialista es nuestro regalo para celebrar el Mundial 2026 junto a nuestros clientes.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-left">
                        {SEDES.map((sede) => (
                            <div key={sede.nombre} className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-3">
                                <p className="text-zinc-900 dark:text-white font-bold text-xs">{sede.nombre}</p>
                                <p className="text-zinc-500 dark:text-zinc-400 text-xs">{sede.ciudad} · {sede.direccion}</p>
                                <p className="text-zinc-500 dark:text-zinc-400 text-xs">📞 {sede.telefono}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a
                            href={`https://instagram.com/${INSTAGRAM_USUARIO.replace('@', '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block py-2.5 px-4 rounded-xl font-bold text-sm text-center text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/15 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors"
                        >
                            📷 {INSTAGRAM_USUARIO}
                        </a>
                        <a
                            href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent('Hola, tengo una pregunta sobre la Polla Mundialista 🙋')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block py-2.5 px-4 rounded-xl font-bold text-sm text-center text-white bg-green-600 hover:bg-green-700 transition-colors"
                        >
                            💬 Escríbenos por WhatsApp
                        </a>
                    </div>
                </div>
            </div>

            <FAQ />

            <Footer />
        </div>
    );
}
