import { useState, useEffect } from 'react';

const TABS = [
    { id: 'premios', icon: '🎁', label: 'Premios' },
    { id: 'como-participo', icon: '❓', label: 'Cómo participo' },
    { id: 'inicio', icon: '⚽', label: 'Inicio' },
    { id: 'nosotros', icon: '📍', label: 'Nosotros' },
];

export default function BottomNav() {
    const [activeId, setActiveId] = useState('inicio');

    useEffect(() => {
        const observers = TABS.map(({ id }) => {
            const el = document.getElementById(id);
            if (!el) return null;
            const obs = new IntersectionObserver(
                ([entry]) => { if (entry.isIntersecting) setActiveId(id); },
                { rootMargin: '-20% 0px -70% 0px' }
            );
            obs.observe(el);
            return obs;
        });
        return () => observers.forEach(o => o?.disconnect());
    }, []);

    function scrollTo(id) {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setActiveId(id);
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950 border-t-2 border-[#FCD116]">
            <div
                className="max-w-md mx-auto grid grid-cols-4 h-16"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
                {TABS.map((tab) => {
                    const isActive = activeId === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => scrollTo(tab.id)}
                            className="flex flex-col items-center justify-center gap-0.5 text-center px-1 transition-colors"
                        >
                            <span className="text-xl leading-none">{tab.icon}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wide leading-tight ${isActive ? 'text-[#FCD116]' : 'text-zinc-500'}`}>
                                {tab.label}
                            </span>
                            {isActive && <span className="w-4 h-0.5 bg-[#FCD116] rounded-full" />}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
