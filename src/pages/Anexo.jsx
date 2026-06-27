import { Link } from 'react-router-dom';

function S({ children }) {
    return <h2 className="text-zinc-900 dark:text-white font-bold text-base mt-4 mb-1">{children}</h2>;
}

function P({ children }) {
    return <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">{children}</p>;
}

export default function Anexo() {
    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 stadium-glow px-6 py-10 flex flex-col items-center">
            <div className="absolute top-0 left-0 right-0 h-2 flex">
                <div className="flex-1 bg-colombia-yellow" />
                <div className="flex-1 bg-colombia-blue" />
                <div className="flex-1 bg-colombia-red" />
            </div>

            <div className="w-full max-w-md mt-6">
                <Link to="/terminos" className="text-zinc-500 dark:text-zinc-400 text-sm hover:text-zinc-900 dark:hover:text-white">
                    &larr; Volver a Términos y Condiciones
                </Link>

                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-4 mb-1">
                    Anexo 1 — Incentivos y Procedimiento de Reclamación
                </h1>
                <p className="text-zinc-400 dark:text-zinc-500 text-xs mb-6">
                    Versión 2.0 — 17 de junio de 2026 · Hace parte integral de los{' '}
                    <Link to="/terminos" className="text-amber-500 dark:text-amber-400 underline">Términos y Condiciones</Link>
                </p>

                <div className="flex flex-col gap-3">

                    <S>1. Partidos habilitados</S>
                    <P>
                        El Operador habilita partidos del Mundial FIFA 2026 a su discreción a través del panel de
                        administración. Los partidos disponibles, sus fechas y horas (en hora de Colombia, UTC-5) se
                        publican en la sección "Mis pronósticos" dentro del Sitio. El Operador no garantiza la
                        disponibilidad de todos los partidos del torneo.
                    </P>

                    <S>2. Tabla de puntos por fase</S>

                    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-white/10">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-zinc-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400">
                                <tr>
                                    <th className="p-2">Fase del torneo</th>
                                    <th className="p-2">Marcador exacto</th>
                                    <th className="p-2">Tendencia correcta</th>
                                    <th className="p-2">Cupos requeridos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-white/5 text-zinc-700 dark:text-zinc-300">
                                {[
                                    ['Grupos',              '100', '50',    '1'],
                                    ['Dieciseisavos',       '120', '60',    '1'],
                                    ['Octavos de Final',    '200', '100',   '1'],
                                    ['Cuartos de Final',    '250', '125',   '2'],
                                    ['Semifinal',           '800', '400',   '2'],
                                    ['Gran Final',         '2.000','1.000', '4'],
                                ].map(([fase, exacto, tend, cupos]) => (
                                    <tr key={fase}>
                                        <td className="p-2">{fase}</td>
                                        <td className="p-2 font-bold text-amber-600 dark:text-amber-400">{exacto} pts</td>
                                        <td className="p-2">{tend} pts</td>
                                        <td className="p-2 font-medium">{cupos}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <P>
                        <em>Tendencia correcta</em>: acertar el ganador o el empate al finalizar el tiempo reglamentario más
                        prórroga (sin contar penales), sin coincidir exactamente con el marcador. En fases eliminatorias, si el
                        partido termina en empate y se define por penales, el resultado oficial para efectos del concurso es el
                        marcador al final de la prórroga, no el resultado de la tanda de penales.
                    </P>

                    <S>3. Puntos adicionales por fidelización</S>

                    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-white/10">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-zinc-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400">
                                <tr>
                                    <th className="p-2">Concepto</th>
                                    <th className="p-2">Puntos</th>
                                    <th className="p-2">Tope máximo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-white/5 text-zinc-700 dark:text-zinc-300">
                                <tr>
                                    <td className="p-2">Compartir pronóstico en Instagram Stories (máx. 1 vez por partido)</td>
                                    <td className="p-2 font-bold text-amber-600 dark:text-amber-400">+20 pts</td>
                                    <td className="p-2">500 pts totales</td>
                                </tr>
                                <tr>
                                    <td className="p-2">Referido que compra un Bono con tu enlace personal</td>
                                    <td className="p-2 font-bold text-amber-600 dark:text-amber-400">+20 pts</td>
                                    <td className="p-2">500 pts totales</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <S>4. Tabla de premios</S>

                    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-white/10">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-zinc-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400">
                                <tr>
                                    <th className="p-2">Puesto</th>
                                    <th className="p-2">Premio base</th>
                                    <th className="p-2">Premio máximo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-white/5 text-zinc-700 dark:text-zinc-300">
                                <tr>
                                    <td className="p-2">🥇 1.er puesto</td>
                                    <td className="p-2 font-bold text-amber-600 dark:text-amber-400">$2.000.000 COP</td>
                                    <td className="p-2">$5.000.000 COP</td>
                                </tr>
                                <tr>
                                    <td className="p-2">🥈 2.do puesto</td>
                                    <td className="p-2 font-bold">$1.000.000 COP</td>
                                    <td className="p-2">$2.000.000 COP</td>
                                </tr>
                                <tr>
                                    <td className="p-2">🥉 3.er puesto</td>
                                    <td className="p-2 font-bold">$500.000 COP</td>
                                    <td className="p-2">$1.000.000 COP</td>
                                </tr>
                                <tr>
                                    <td className="p-2">🇨🇴 Bono Colombia (por partido grupo)</td>
                                    <td className="p-2 font-bold text-yellow-600 dark:text-yellow-400">$1.000.000 COP</td>
                                    <td className="p-2">Dividido entre acertantes exactos (si son más de 10, se sortean 10 ganadores de $100.000 c/u)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <P>
                        Cuando la facturación total supere $10.000.000 COP, el 10% del exceso se distribuye automáticamente
                        a la tabla de premios (50% / 30% / 20% para 1.er, 2.do y 3.er puesto) hasta los topes máximos indicados.
                        Los premios se entregan en <strong>Gift Cards</strong>, no en efectivo.
                    </P>

                    <S>5. Criterio de desempate</S>
                    <ol className="list-decimal list-inside text-sm text-zinc-600 dark:text-zinc-300 space-y-1 pl-1">
                        <li>Mayor puntaje obtenido en la <strong>Gran Final</strong> del Mundial 2026.</li>
                        <li>Mayor número de pronósticos exactos en las <strong>Semifinales</strong>.</li>
                        <li>
                            Si el empate persiste: con <strong>10 empatados o menos</strong>, el premio de los puestos empatados se
                            <strong> divide en partes iguales</strong> entre todos. Con <strong>más de 10 empatados</strong>, se
                            realiza un <strong>sorteo</strong> y se eligen <strong>10 ganadores</strong>, que reparten el premio en
                            partes iguales entre sí.
                        </li>
                    </ol>

                    <S>6. Procedimiento de reclamación y entrega</S>
                    <P>
                        Dentro de los <strong>10 días hábiles</strong> siguientes a la confirmación del resultado, el Operador
                        contactará al beneficiario por WhatsApp y/o correo electrónico registrado. El Participante contará con
                        <strong> 20 días calendario</strong> desde ese primer contacto para presentarse en cualquiera de las
                        sedes habilitadas en Barranquilla, exhibir su documento de identidad y reclamar su premio.
                    </P>
                    <P>
                        Una vez reclamado el premio, el Operador dispondrá de <strong>20 días hábiles contados desde
                        la fecha del evento</strong> para gestionar y hacer entrega de la Gift Card al ganador.
                    </P>
                    <P>
                        Vencido el plazo de reclamación sin presentación del ganador, el Operador queda liberado de la
                        obligación sin derecho a compensación posterior. Los premios son <strong>intransferibles</strong> y
                        solo pueden ser reclamados por el titular registrado de la cuenta ganadora.
                    </P>

                    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-white/10">
                        <Link to="/terminos" className="text-amber-500 dark:text-amber-400 underline text-sm">
                            ← Volver a Términos y Condiciones
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
