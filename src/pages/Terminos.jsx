import { Link } from 'react-router-dom';

function S({ children }) {
    return <h2 className="text-zinc-900 dark:text-white font-bold text-base mt-4 mb-1">{children}</h2>;
}

function P({ children }) {
    return <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">{children}</p>;
}

function Aviso({ children }) {
    return (
        <div className="rounded-xl border border-amber-400/40 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
            {children}
        </div>
    );
}

export default function Terminos() {
    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 stadium-glow px-6 py-10 flex flex-col items-center">
            <div className="absolute top-0 left-0 right-0 h-2 flex">
                <div className="flex-1 bg-colombia-yellow" />
                <div className="flex-1 bg-colombia-blue" />
                <div className="flex-1 bg-colombia-red" />
            </div>

            <div className="w-full max-w-md mt-6">
                <Link to="/" className="text-zinc-500 dark:text-zinc-400 text-sm hover:text-zinc-900 dark:hover:text-white">&larr; Volver</Link>

                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-4 mb-1">Términos y Condiciones</h1>
                <p className="text-zinc-400 dark:text-zinc-500 text-xs mb-2">Versión 2.0 — 17 de junio de 2026</p>
                <p className="text-zinc-400 dark:text-zinc-500 text-xs mb-6">
                    Operador: <strong className="text-zinc-700 dark:text-zinc-300">RDM MASTER COLOMBIA SAS</strong> · NIT 901.765.354-3<br />
                    Carrera 51 #95-31, Barranquilla · comercial@retoucherie.com.co · +57 310 396 3708
                </p>

                <div className="flex flex-col gap-3">

                    {/* AVISO DESTACADO */}
                    <Aviso>
                        <strong>Esta no es una apuesta ni un juego de azar.</strong> La actividad "Gana con Retoucherie" es
                        una estrategia de fidelización comercial en la que el participante <em>compra un Bono de Servicios</em> en
                        La Retoucherie de Manuela y, como beneficio gratuito adicional, accede a un Concurso de
                        Habilidad cuyos ganadores se determinan por conocimiento futbolístico, no por azar.
                        No está sujeta a la Ley 643 de 2001 ni a la regulación de Coljuegos.
                    </Aviso>

                    {/* 1 */}
                    <S>1. Naturaleza de la Actividad</S>
                    <P>
                        <strong>1.1 Actividad comercial principal — Bono de Servicios.</strong> La operación económica consiste
                        en la compra, por parte del cliente (en adelante "el Participante"), de un Bono de Servicios digital
                        (en adelante "el Bono"), redimible exclusivamente en servicios de sastrería y/o estética prestados
                        presencialmente en las sedes de La Retoucherie de Manuela en Barranquilla.
                    </P>
                    <P>
                        <strong>1.2 Actividad de fidelización — acceso gratuito al Concurso.</strong> Como estrategia de
                        fidelización y marketing, al adquirir el Bono el Operador otorga al Participante, sin costo adicional,
                        acceso a un Concurso de Habilidad deportiva descrito en la Sección 4. Este acceso gratuito no tiene
                        valor comercial independiente ni constituye contraprestación distinta a la compra del Bono.
                    </P>
                    <P>
                        <strong>1.3 No es juego de suerte y azar.</strong> Los ganadores del Concurso son determinados
                        exclusivamente por mérito: el conocimiento futbolístico, la capacidad analítica y el criterio del
                        Participante al predecir marcadores. No existe sorteo, generador aleatorio ni ningún elemento
                        fortuito que determine el resultado. Por ello, la actividad no encuadra en la definición de "juego de
                        suerte y azar" de la Ley 643 de 2001 y no requiere autorización de Coljuegos.
                    </P>
                    <P>
                        <strong>1.4 Cobertura geográfica.</strong> El Bono puede comprarse desde cualquier lugar del mundo
                        a través de www.ganaconretoucherie.com. La redención presencial de los servicios solo es posible en
                        las sedes físicas del Operador en Barranquilla (tres sedes).
                    </P>

                    {/* 2 */}
                    <S>2. Bono de Servicios</S>
                    <P>
                        <strong>2.1 Naturaleza.</strong> El Bono es un título valor nominativo e intransferible (equivalente a
                        una tarjeta de regalo o "gift card") que representa un crédito a favor del Participante, redimible
                        únicamente en servicios.
                    </P>
                    <P>
                        <strong>2.2 Vigencia.</strong> El Bono caduca el <strong>1 de marzo de 2027 a las 6:00 p.m. (hora de
                        Colombia)</strong>. Vencida esta fecha, el saldo remanente caduca automáticamente sin derecho a
                        reembolso, compensación ni sustitución.
                    </P>
                    <P>
                        <strong>2.3 No hay reembolsos.</strong> Una vez adquirido y aprobado el pago, el Bono no es
                        reembolsable en dinero bajo ninguna circunstancia.
                    </P>
                    <P>
                        <strong>2.4 IVA.</strong> De conformidad con el artículo 420 del Estatuto Tributario, la venta del Bono
                        no causa IVA por sí misma. El IVA se genera únicamente cuando el Participante redime el Bono y
                        recibe el servicio, momento en el cual el Operador expedirá la factura correspondiente.
                    </P>

                    {/* 3 */}
                    <S>3. Matriz de Bonos y Cupos de Participación</S>
                    <P>Cada Bono otorga cupos de participación ("cupos") para el Concurso de Habilidad, según la siguiente tabla:</P>

                    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-white/10">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-zinc-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400">
                                <tr>
                                    <th className="p-2">Valor del Bono</th>
                                    <th className="p-2">Saldo en servicios</th>
                                    <th className="p-2">Cupos asignados</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-white/5 text-zinc-700 dark:text-zinc-300">
                                {[
                                    ['$10.000 COP', '$15.000 COP', '1 cupo'],
                                    ['$25.000 COP', '$40.000 COP', '2 cupos'],
                                    ['$50.000 COP', '$80.000 COP', '5 cupos'],
                                ].map(([valor, saldo, cupos]) => (
                                    <tr key={valor}>
                                        <td className="p-2 font-medium">{valor}</td>
                                        <td className="p-2">{saldo}</td>
                                        <td className="p-2 font-bold text-amber-600 dark:text-amber-400">{cupos}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <P>
                        También se aceptan montos personalizados entre $50.000 y $1.000.000 COP, con saldo equivalente
                        al 160% del valor pagado y cupos calculados a razón de 1 cupo por cada $10.000 COP.
                    </P>

                    {/* 4 */}
                    <S>4. Concurso de Habilidad — Pronósticos Deportivos</S>
                    <P>
                        <strong>4.1 Mecánica.</strong> El Concurso consiste en predecir el marcador exacto (goles de cada equipo
                        al final del tiempo reglamentario, incluyendo prórroga pero <em>excluyendo penales</em>) de los partidos
                        del Mundial 2026 habilitados por el Operador. Los cupos determinan cuántos partidos puede pronosticar
                        el Participante; una vez usados, se requiere recargar el Bono.
                    </P>
                    <P>
                        <strong>4.2 Cierre automático.</strong> El sistema bloquea el registro y modificación de pronósticos
                        exactamente <strong>5 minutos antes</strong> del inicio oficial de cada partido (según el reloj del
                        servidor del Operador). No se reconocerán pronósticos tardíos por ninguna causa.
                    </P>
                    <P>
                        <strong>4.3 Un pronóstico por partido.</strong> Cada Participante puede registrar un único pronóstico por
                        partido. No está permitido modificarlo una vez registrado.
                    </P>
                    <P>
                        <strong>4.4 Costo en cupos según la fase del torneo.</strong> El número de cupos descontados al
                        pronosticar depende de la etapa del partido:
                    </P>

                    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-white/10">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-zinc-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400">
                                <tr>
                                    <th className="p-2">Fase</th>
                                    <th className="p-2">Cupos descontados</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-white/5 text-zinc-700 dark:text-zinc-300">
                                {[
                                    ['Fase de Grupos', '1 cupo'],
                                    ['Dieciseisavos de Final', '1 cupo'],
                                    ['Octavos de Final', '1 cupo'],
                                    ['Cuartos de Final', '2 cupos'],
                                    ['Semifinal', '2 cupos'],
                                    ['Gran Final', '4 cupos'],
                                ].map(([fase, costo]) => (
                                    <tr key={fase}>
                                        <td className="p-2">{fase}</td>
                                        <td className="p-2 font-bold text-amber-600 dark:text-amber-400">{costo}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 5 */}
                    <S>5. Sistema de Puntuación por Fases</S>
                    <P>
                        Los puntos se asignan automáticamente al cerrar cada partido, con la siguiente escala
                        según la etapa del torneo:
                    </P>

                    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-white/10">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-zinc-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400">
                                <tr>
                                    <th className="p-2">Fase</th>
                                    <th className="p-2">Marcador exacto</th>
                                    <th className="p-2">Solo tendencia</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-white/5 text-zinc-700 dark:text-zinc-300">
                                {[
                                    ['Grupos',              '100 pts', '50 pts'],
                                    ['Dieciseisavos',       '120 pts', '60 pts'],
                                    ['Octavos de Final',    '200 pts', '100 pts'],
                                    ['Cuartos de Final',    '250 pts', '125 pts'],
                                    ['Semifinal',           '800 pts', '400 pts'],
                                    ['Gran Final',         '2.000 pts','1.000 pts'],
                                ].map(([fase, exacto, tend]) => (
                                    <tr key={fase}>
                                        <td className="p-2">{fase}</td>
                                        <td className="p-2 font-bold text-amber-600 dark:text-amber-400">{exacto}</td>
                                        <td className="p-2">{tend}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <P>
                        <em>Tendencia correcta</em> significa haber acertado el equipo ganador o el empate, sin coincidir con el
                        marcador exacto. Los puntos por tendencia no aplican en fases eliminatorias donde siempre hay un
                        ganador (no hay empate oficial hasta los penales, que no cuentan).
                    </P>

                    {/* 6 */}
                    <S>6. Puntos Adicionales por Fidelización</S>
                    <P>
                        <strong>6.1 Compartir en Instagram Stories.</strong> Al compartir tu pronóstico mediante el botón
                        "Compartir" dentro de la plataforma, recibes <strong>10 puntos</strong> por cada historia publicada
                        (máximo 1 vez por partido). Tope acumulable por este concepto: <strong>200 puntos</strong> totales.
                    </P>
                    <P>
                        <strong>6.2 Programa de Referidos.</strong> Al invitar a alguien con tu enlace personal y esa persona
                        comprar un Bono, recibes <strong>20 puntos</strong>. Tope acumulable: <strong>500 puntos</strong> totales.
                    </P>

                    {/* 7 */}
                    <S>7. Tabla de Premios en Efectivo (Gift Cards)</S>
                    <P>
                        <strong>7.1 Base garantizada.</strong> El Operador garantiza una tabla de premios mínima de
                        <strong> $3.500.000 COP</strong>, distribuido así:
                    </P>

                    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-white/10">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-zinc-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400">
                                <tr>
                                    <th className="p-2">Posición</th>
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
                            </tbody>
                        </table>
                    </div>
                    <P>
                        <strong>7.2 Crecimiento dinámico.</strong> Cuando la facturación total acumulada de Bonos supere
                        <strong> $10.000.000 COP</strong>, el 10 % de cada peso adicional vendido se destinará a la tabla de premios, con la
                        distribución 50% / 30% / 20% para el 1.er, 2.do y 3.er puesto respectivamente, hasta los topes máximos.
                        La tabla de premios actualizada en tiempo real se puede consultar en la sección "Premios" del Sitio.
                    </P>
                    <P>
                        <strong>7.3 Forma de entrega.</strong> Los premios se entregan exclusivamente en <strong>Gift Cards
                        de almacenes de cadena u otros comercios autorizados</strong>, a elección del Operador.
                        No se entrega dinero en efectivo.
                    </P>
                    <P>
                        <strong>7.4 Bono Colombia.</strong> Por cada partido de la Selección Colombia en la Fase de Grupos del
                        Mundial 2026, el Operador destinará <strong>$1.000.000 COP adicionales</strong> al o los Participantes que
                        aciertenelexacto marcador de ese partido. Si hay varios acertantes, el bono se divide en partes iguales.
                        Si nadie acierta el marcador exacto, el Bono Colombia no se otorga para ese partido (sin acumulación).
                    </P>

                    {/* 8 */}
                    <S>8. Criterio de Desempate</S>
                    <P>En caso de empate en puntaje total en la clasificación final:</P>
                    <ol className="list-decimal list-inside text-sm text-zinc-600 dark:text-zinc-300 space-y-1 pl-1">
                        <li>Mayor puntaje obtenido en la <strong>Gran Final</strong> del Mundial.</li>
                        <li>Mayor número de aciertos exactos en las <strong>Semifinales</strong>.</li>
                        <li>Si persiste el empate, el premio correspondiente a esos puestos se <strong>divide en partes iguales</strong> entre los empatados.</li>
                    </ol>

                    {/* 9 */}
                    <S>9. Reclamación y Entrega de Premios</S>
                    <P>
                        El Operador contactará al beneficiario dentro de los <strong>10 días hábiles</strong> siguientes a la
                        confirmación del resultado, vía WhatsApp y/o correo electrónico registrado. El Participante
                        tendrá <strong>20 días calendario</strong> a partir del primer intento de contacto para reclamar su
                        premio en cualquiera de las sedes habilitadas, acreditando su identidad. Vencido este plazo sin
                        reclamación, el Operador podrá disponer libremente del incentivo.
                    </P>
                    <P>
                        Una vez reclamado el premio, el Operador dispondrá de <strong>20 días hábiles contados desde
                        la fecha del evento</strong> para gestionar y hacer entrega de la Gift Card al ganador.
                    </P>
                    <P>
                        Los premios son <strong>intransferibles</strong> y solo pueden ser reclamados por el titular registrado
                        de la cuenta ganadora.
                    </P>

                    {/* 10 */}
                    <S>10. Descalificación y Control de Fraude</S>
                    <P>
                        El Operador podrá descalificar sin previo aviso a los Participantes que: creen múltiples cuentas,
                        usen medios automatizados, manipulen el sistema, suplanten identidad de terceros o realicen
                        cualquier conducta contraria a la transparencia de la Actividad. La descalificación conlleva la
                        pérdida de todos los puntos, cupos y derechos acumulados.
                    </P>

                    {/* 11 */}
                    <S>11. Limitación de Responsabilidad</S>
                    <P>
                        El Operador no es responsable por interrupciones de internet, fallas del dispositivo del Participante,
                        errores de terceros proveedores tecnológicos, cambios en el calendario oficial de la FIFA, ni cualquier
                        otra circunstancia de fuerza mayor. El Operador se reserva el derecho de modificar, suspender o
                        cancelar la Actividad, comunicándolo con la mayor antelación posible a través del Sitio.
                    </P>

                    {/* 12 */}
                    <S>12. Propiedad Intelectual</S>
                    <P>
                        Las marcas, logotipos, textos e imágenes del Sitio son propiedad del Operador o de sus licenciantes
                        y no pueden reproducirse sin autorización escrita previa.
                    </P>

                    {/* 13 */}
                    <S>13. Privacidad y Datos Personales</S>
                    <P>
                        El tratamiento de datos personales de los Participantes se rige por la{' '}
                        <Link to="/privacidad" className="text-amber-500 dark:text-amber-400 underline">
                            Política de Privacidad y Tratamiento de Datos Personales
                        </Link>{' '}
                        publicada en el Sitio, que hace parte integral de estos Términos.
                    </P>

                    {/* 14 */}
                    <S>14. Legislación y Jurisdicción</S>
                    <P>
                        Estos Términos se rigen por las leyes de la República de Colombia. Cualquier controversia se
                        someterá a los jueces y tribunales de Barranquilla, Atlántico, Colombia.
                    </P>

                    {/* 15 */}
                    <S>15. Aceptación</S>
                    <P>
                        Al registrarse en el Sitio y/o adquirir un Bono, el Participante declara ser mayor de 18 años,
                        haber leído íntegramente estos Términos y Condiciones y la{' '}
                        <Link to="/privacidad" className="text-amber-500 dark:text-amber-400 underline">Política de Privacidad</Link>,
                        y aceptarlos en su totalidad.
                    </P>

                    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-white/10">
                        <Link
                            to="/anexo"
                            className="text-amber-500 dark:text-amber-400 underline text-sm"
                        >
                            Ver Anexo 1 — Detalle de Incentivos y Procedimiento de Reclamación →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
