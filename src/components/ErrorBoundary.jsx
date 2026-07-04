import { Component } from 'react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { crashed: false, message: '' };
    }

    static getDerivedStateFromError(err) {
        return { crashed: true, message: err?.message ?? 'Error desconocido' };
    }

    componentDidCatch(err, info) {
        console.error('[ErrorBoundary]', err, info?.componentStack);
    }

    render() {
        if (!this.state.crashed) return this.props.children;

        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 text-center gap-5">
                <span className="text-5xl">⚠️</span>
                <div>
                    <p className="text-white font-bold text-lg mb-1">Algo salió mal</p>
                    <p className="text-zinc-400 text-sm mb-4">
                        Ocurrió un error inesperado. Intenta recargar la página.
                    </p>
                    <p className="text-zinc-600 text-xs font-mono">{this.state.message}</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 rounded-xl font-black text-zinc-950 bg-[#FCD116] text-sm"
                >
                    Recargar
                </button>
            </div>
        );
    }
}
