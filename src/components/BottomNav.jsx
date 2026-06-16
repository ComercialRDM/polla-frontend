import { NavLink } from 'react-router-dom';

const TABS = [
    { to: '/premios', icon: '🎁', label: 'Premios' },
    { to: '/como-participo', icon: '❓', label: 'Cómo participo' },
    { to: '/', icon: '⚽', label: 'Inicio' },
    { to: '/nosotros', icon: '📍', label: 'Nosotros' },
];

export default function BottomNav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950 border-t-2 border-[#FCD116]">
            <div
                className="max-w-md mx-auto grid grid-cols-4 h-16"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
                {TABS.map((tab) => (
                    <NavLink
                        key={tab.to}
                        to={tab.to}
                        end={tab.to === '/'}
                        className="flex flex-col items-center justify-center gap-0.5 text-center px-1 transition-colors"
                    >
                        {({ isActive }) => (
                            <>
                                <span className="text-xl leading-none">{tab.icon}</span>
                                <span className={`text-[10px] font-bold uppercase tracking-wide leading-tight ${isActive ? 'text-[#FCD116]' : 'text-zinc-500'}`}>
                                    {tab.label}
                                </span>
                                {isActive && <span className="w-4 h-0.5 bg-[#FCD116] rounded-full" />}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
