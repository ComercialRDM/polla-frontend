import { Link } from 'react-router-dom';

export default function Anexo() {
    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 stadium-glow px-6 py-10 flex flex-col items-center">
            <div className="absolute top-0 left-0 right-0 h-2 flex">
                <div className="flex-1 bg-colombia-yellow" />
                <div className="flex-1 bg-colombia-blue" />
                <div className="flex-1 bg-colombia-red" />
            </div>

            <div className="w-full max-w-md mt-6">
                <Link to="/terminos" className="text-zinc-500 dark:text-zinc-400 text-sm hover:text-zinc-900 dark:hover:text-white">&larr; Volver a Términos y Condiciones</Link>

                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-4 mb-1">
                    Anexo 1 — Calendario de Partidos e Incentivos Comerciales
                </h1>
                <p className="text-zinc-400 dark:text-zinc-500 text-xs mb-6">Versión 1.0 — 15 de junio de 2026</p>

                <div className="flex flex-col gap-4 text-zinc-600 dark:text-zinc-300 text-sm">
                    <p>
                        Este Anexo hace parte integral de los{' '}
                        <Link to="/terminos" className="text-amber-500 dark:text-amber-400 underline">Términos y Condiciones</Link> de la
                        actividad comercial "Gana con Retoucherie", operada por RDM MASTER COLOMBIA SAS
                        (NIT 901.765.354-3).
                    </p>

                    <h2 className="text-zinc-900 dark:text-white font-bold text-base mt-2">1. Calendario de partidos</h2>
                    <p>
                        El calendario de partidos de la Selección Colombia habilitados para el Concurso de Habilidad,
                        así como sus fechas y horas de inicio (kick-off), se publican y administran de forma dinámica
                        desde el panel de administración del Sitio y son visibles para los Participantes en la sección
                        "Polla" antes del inicio de cada partido.
                    </p>

                    <h2 className="text-zinc-900 dark:text-white font-bold text-base mt-2">2. Tabla de incentivos comerciales</h2>
                    <table className="w-full text-left text-xs border border-zinc-200 dark:border-white/10 rounded-lg overflow-hidden">
                        <thead className="bg-zinc-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400">
                            <tr>
                                <th className="p-2">Concepto</th>
                                <th className="p-2">Incentivo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-white/10">
                            <tr>
                                <td className="p-2">Marcador exacto acertado (partido de fase regular)</td>
                                <td className="p-2">100 puntos</td>
                            </tr>
                            <tr>
                                <td className="p-2">Marcador exacto acertado (semifinal o final)</td>
                                <td className="p-2">500 puntos</td>
                            </tr>
                            <tr>
                                <td className="p-2">Referido registrado con tu enlace personal</td>
                                <td className="p-2">20 puntos</td>
                            </tr>
                            <tr>
                                <td className="p-2">Premio por partido (a discreción del Operador)</td>
                                <td className="p-2">
                                    Artículo de la línea Selección Colombia (camiseta, gorra, gafas o balón) o Bono de
                                    Servicio equivalente
                                </td>
                            </tr>
                            <tr>
                                <td className="p-2">1er lugar clasificación general (mayor puntaje acumulado)</td>
                                <td className="p-2">
                                    Bono de Servicio de $1.000.000 COP, ampliable a discreción del Operador hasta un
                                    máximo de $2.500.000 COP
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <p>
                        En caso de empate en puntaje dentro de la clasificación general, aplica la regla de desempate
                        cronológico descrita en la Sección 3.3 de los Términos y Condiciones: tiene prioridad el
                        Participante que primero haya registrado el pronóstico que generó el puntaje en disputa.
                    </p>

                    <h2 className="text-zinc-900 dark:text-white font-bold text-base mt-2">3. Procedimiento de reclamación de incentivos</h2>
                    <p>
                        Una vez finalizado el partido o el Mundial, según corresponda, y verificado el Participante
                        ganador, el Operador intentará contactarlo a través de los datos de contacto registrados en el
                        Sitio (WhatsApp y/o correo electrónico) dentro de los{' '}
                        <strong>10 días hábiles</strong> siguientes a la confirmación del resultado.
                    </p>
                    <p>
                        El Participante beneficiario contará con <strong>20 días calendario</strong>, contados a partir
                        del primer intento de contacto del Operador, para reclamar su incentivo, acercándose a
                        cualquiera de las sedes habilitadas en Barranquilla o Cartagena y acreditando su identidad como
                        titular de la cuenta registrante. Vencido este plazo sin que el incentivo haya sido reclamado,
                        el Operador podrá disponer libremente del mismo, sin que ello genere derecho a reclamación o
                        compensación posterior.
                    </p>
                    <p>
                        Los incentivos son intransferibles y solo podrán ser reclamados por la persona titular de la
                        cuenta que registró el pronóstico o resultado ganador.
                    </p>
                </div>
            </div>
        </div>
    );
}
