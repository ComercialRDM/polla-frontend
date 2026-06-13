import { Link } from 'react-router-dom';

export default function Terminos() {
    return (
        <div className="min-h-screen bg-zinc-950 stadium-glow px-6 py-10 flex flex-col items-center">
            <div className="absolute top-0 left-0 right-0 h-2 flex">
                <div className="flex-1 bg-colombia-yellow" />
                <div className="flex-1 bg-colombia-blue" />
                <div className="flex-1 bg-colombia-red" />
            </div>

            <div className="w-full max-w-md mt-6">
                <Link to="/" className="text-zinc-400 text-sm hover:text-white">&larr; Volver</Link>

                <h1 className="text-2xl font-extrabold text-white mt-4 mb-6">Términos y condiciones</h1>

                <div className="flex flex-col gap-4 text-zinc-300 text-sm">
                    <p>
                        La Polla Mundialista es una promoción de La Retoucherie de Manuela (NIT 901765354) en la que,
                        al comprar un Bono Digital de servicios de belleza, el cliente recibe intentos para predecir
                        el marcador de los partidos de la Selección Colombia en el Mundial 2026.
                    </p>
                    <p>
                        El Bono Digital tiene el saldo indicado al momento de la compra y puede usarse para agendar y
                        pagar servicios en La Retoucherie de Manuela.
                    </p>
                    <p>
                        Los pronósticos deben registrarse antes del inicio del partido correspondiente. Una vez
                        comienza el partido, la votación queda cerrada y no se pueden modificar los pronósticos.
                    </p>
                    <p>
                        Los premios se entregan a quienes acierten el marcador exacto del partido, en orden de
                        registro del pronóstico (el primero en registrar el marcador exacto tiene prioridad).
                    </p>
                    <p>
                        Los pagos por transferencia bancaria son revisados manualmente por el equipo de La Retoucherie
                        de Manuela y aprobados en un tiempo estimado de minutos a horas hábiles.
                    </p>
                    <p>
                        La Retoucherie de Manuela se reserva el derecho de ajustar fechas de partidos, premios y
                        condiciones de la promoción, informando oportunamente a los participantes.
                    </p>
                </div>
            </div>
        </div>
    );
}
