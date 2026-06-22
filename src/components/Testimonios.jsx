import ricardoImg from '../assets/testimonios/ricardo-angulo.jpg';
import andresImg from '../assets/testimonios/andres-villafanez.jpg';
import paoImg from '../assets/testimonios/pao-de-la-espriella.jpg';

const TESTIMONIOS = [
    {
        nombre: 'Ricardo Angulo',
        foto: ricardoImg,
        titulo: '"100% real y seguro"',
        texto: 'Conozco la trayectoria de Retoucherie, así que compré mi bono sin dudarlo. El proceso es transparente y el sorteo es totalmente legal. ¡No te quedes fuera, asegura tu bono hoy mismo!',
        estrellas: 5,
    },
    {
        nombre: 'Andres Villafañez',
        foto: andresImg,
        titulo: '"Compré en 2 minutos"',
        texto: 'Me encantó lo rápido y fácil que es participar desde el celular. Todo el proceso es digital y súper confiable. ¿Qué esperas? ¡Haz clic aquí y compra el tuyo antes de que se agoten!',
        estrellas: 5,
    },
    {
        nombre: 'Pao de la Espriella',
        foto: paoImg,
        titulo: '"¡Cumplen con lo que prometen!"',
        texto: 'Al principio tenía dudas, pero transmiten todo en vivo y entregan los premios de verdad. Es una oportunidad increíble. ¡Anímate a participar y compra tu bono ahora!',
        estrellas: 5,
    },
];

// Prueba social con clientes reales (foto + nombre + comentario), distinta de
// ResumenPublico (que muestra actividad agregada/anónima del juego).
export default function Testimonios() {
    return (
        <div className="w-full max-w-md px-4 mt-1">
            <div className="flex flex-col gap-3">
                {TESTIMONIOS.map((t) => (
                    <div
                        key={t.nombre}
                        className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-sm dark:shadow-none backdrop-blur-lg p-4 flex gap-3"
                    >
                        <img
                            src={t.foto}
                            alt={t.nombre}
                            className="w-14 h-14 rounded-full object-cover flex-shrink-0 border border-zinc-200 dark:border-white/10"
                        />
                        <div className="min-w-0">
                            <p className="text-amber-500 text-sm leading-none mb-1">
                                {'⭐'.repeat(t.estrellas)}
                            </p>
                            <p className="text-zinc-900 dark:text-white font-bold text-sm">{t.titulo}</p>
                            <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">{t.texto}</p>
                            <p className="text-zinc-400 dark:text-zinc-500 text-xs font-semibold mt-2">— {t.nombre}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
