import { NavLink } from 'react-router-dom';

const TABS = [
    { to: '/premios', icon: '🎁', label: 'Premios' },
    { to: '/como-participo', icon: '❓', label: 'Cómo participo' },
    { to: '/', icon: '🏠', label: 'Inicio' },
    { to: '/nosotros', icon: '📍', label: 'Nosotros' },
];

// Navegación inferior fija para las 4 secciones principales de la app.
export default function BottomNav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 dark:border-white/10 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-lg">
            <div
                className="max-w-md mx-auto grid grid-cols-4 h-16"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
                {TABS.map((tab) => (
                    <NavLink
                        key={tab.to}
                        to={tab.to}
                        end={tab.to === '/'}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center gap-0.5 text-center px-1 text-[10px] font-semibold leading-tight transition-colors ${
                                isActive ? 'text-amber-500 dark:text-amber-400' : 'text-zinc-500 dark:text-zinc-400'
                            }`
                        }
                    >
                        <span className="text-xl leading-none">{tab.icon}</span>
                        {tab.label}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
