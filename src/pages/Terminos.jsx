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

                <h1 className="text-2xl font-extrabold text-white mt-4 mb-1">Términos y Condiciones</h1>
                <p className="text-zinc-500 text-xs mb-6">Versión 1.0 — 15 de junio de 2026</p>

                <div className="flex flex-col gap-4 text-zinc-300 text-sm">
                    <p>
                        El presente documento regula el acceso y uso del sitio web www.ganaconretoucherie.com
                        (en adelante, "el Sitio") y de la actividad comercial "Gana con Retoucherie" (en adelante,
                        "la Actividad"), operada por <strong>RDM MASTER COLOMBIA SAS</strong>, identificada con
                        NIT 901.765.354-3, con domicilio en Carrera 51 #95-31, Barranquilla, Atlántico, Colombia
                        (en adelante, "el Operador" o "La Retoucherie de Manuela"). Contacto:
                        comercial@retoucherie.com.co y WhatsApp +57 310 396 3708.
                    </p>

                    <h2 className="text-white font-bold text-base mt-2">1. Naturaleza de la Actividad Comercial</h2>
                    <p>
                        <strong>1.1 Bono de Servicio.</strong> La operación comercial principal y onerosa consiste en
                        la adquisición, por parte del cliente (en adelante, "el Participante"), de un Bono de Servicio
                        digital (en adelante, "el Bono"), el cual representa el 100% del valor pagado y es redimible
                        exclusivamente por servicios de sastrería y/o belleza prestados por La Retoucherie de Manuela.
                    </p>
                    <p>
                        <strong>1.2 Obsequio publicitario.</strong> Como estrategia de fidelización y publicidad, al
                        adquirir el Bono, el Operador otorga gratuitamente al Participante el acceso a un Concurso de
                        Habilidad de pronósticos deportivos (descrito en la Sección 3), sin que dicho acceso tenga
                        costo adicional, valor comercial individual ni constituya una contraprestación distinta a la
                        compra del Bono.
                    </p>
                    <p>
                        <strong>1.3 Vigencia del Bono.</strong> El Bono tiene una vigencia que vence el{' '}
                        <strong>1 de marzo de 2027 a las 6:00 p.m. (hora de Colombia)</strong>. Vencido este plazo, el
                        Bono caduca automáticamente y pierde todo valor, sin lugar a reembolso ni compensación, conforme
                        a lo establecido en la Sección 2.3.
                    </p>
                    <p>
                        <strong>1.4 Cobertura geográfica.</strong> El Bono puede ser adquirido por cualquier persona
                        desde cualquier lugar del mundo a través del Sitio. Sin embargo, los servicios asociados al
                        Bono únicamente pueden redimirse de forma presencial en las sedes físicas de La Retoucherie de
                        Manuela ubicadas en Barranquilla (tres sedes) y Cartagena (una sede), cuyas direcciones se
                        encuentran publicadas en el Sitio.
                    </p>

                    <h2 className="text-white font-bold text-base mt-2">2. Naturaleza Jurídica del Bono</h2>
                    <p>
                        <strong>2.1 Título valor / medio de pago uninominal.</strong> El Bono constituye un título
                        valor o medio de pago uninominal (equivalente a una tarjeta de regalo o "gift card"), nominativo
                        e intransferible, que representa un derecho de crédito del Participante frente al Operador,
                        redimible únicamente por servicios.
                    </p>
                    <p>
                        <strong>2.2 Causación del IVA.</strong> De conformidad con el artículo 420 del Estatuto
                        Tributario y la doctrina aplicable a bonos y vales, la venta del Bono no constituye, por sí
                        misma, el hecho generador del Impuesto sobre las Ventas (IVA). El IVA correspondiente se causa
                        únicamente en el momento en que el Participante redime el Bono y efectivamente recibe el
                        servicio en alguna de las sedes físicas, momento en el cual el Operador expedirá la factura
                        correspondiente.
                    </p>
                    <p>
                        <strong>2.3 Caducidad.</strong> En caso de que el Bono no sea redimido dentro de su vigencia
                        (Sección 1.3), la obligación del Operador se extingue por caducidad sin que se haya causado el
                        IVA, dado que no llegó a configurarse el hecho generador (prestación efectiva del servicio).
                    </p>

                    <h2 className="text-white font-bold text-base mt-2">3. Concurso de Habilidad — Pronósticos Deportivos</h2>
                    <p>
                        <strong>3.1 Mecánica.</strong> El Concurso de Habilidad consiste en que el Participante registre,
                        a través del Sitio, su pronóstico sobre el marcador exacto de los partidos de la Selección
                        Colombia en el Mundial 2026. La determinación de los ganadores se basa exclusivamente en la
                        destreza, conocimiento y acierto del Participante respecto al resultado real del partido, sin
                        que intervenga ningún elemento de suerte, azar o sorteo.
                    </p>
                    <p>
                        <strong>3.2 Plazo de registro.</strong> Los pronósticos deben registrarse{' '}
                        <strong>antes del inicio (kick-off) del partido correspondiente</strong>. El Sitio cierra
                        automáticamente la opción de registrar o modificar pronósticos en el momento exacto del inicio
                        del partido. La marca de tiempo (timestamp) registrada por el servidor del Operador es la única
                        prueba válida para determinar si un pronóstico fue recibido dentro del plazo.
                    </p>
                    <p>
                        <strong>3.3 Regla de desempate.</strong> Si dos o más Participantes aciertan el marcador exacto
                        de un mismo partido, o empatan en puntaje dentro de la clasificación general, el desempate se
                        resuelve por orden cronológico: tiene prioridad quien haya registrado válidamente su pronóstico
                        primero, según la marca de tiempo del servidor.
                    </p>

                    <h2 className="text-white font-bold text-base mt-2">4. Incentivos Comerciales</h2>
                    <p>
                        Los incentivos comerciales otorgados a los Participantes que acierten pronósticos y/o obtengan
                        los mejores puntajes se describen en detalle en el{' '}
                        <Link to="/anexo" className="text-amber-400 underline">Anexo 1 — Calendario de Partidos e
                        Incentivos Comerciales</Link>, el cual hace parte integral de estos Términos y Condiciones.
                    </p>
                    <p>
                        <strong>4.1 Resumen del sistema de puntos.</strong> Por cada partido en el que el Participante
                        acierte el marcador exacto, obtiene 100 puntos (500 puntos si se trata de los partidos de
                        semifinal o final). Adicionalmente, el Participante obtiene 20 puntos por cada persona que se
                        registre en el Sitio utilizando su enlace de referido personal.
                    </p>
                    <p>
                        <strong>4.2 Incentivo de clasificación general.</strong> El Participante que finalice con el
                        mayor puntaje acumulado al cierre del Mundial recibirá un Bono de Servicio adicional por valor
                        de un millón de pesos colombianos ($1.000.000 COP), monto que el Operador podrá incrementar a
                        su entera discreción hasta un máximo de dos millones quinientos mil pesos colombianos
                        ($2.500.000 COP).
                    </p>
                    <p>
                        <strong>4.3 Premios por partido.</strong> A discreción del Operador, los incentivos por partido
                        descritos en el Anexo 1 podrán entregarse en artículos de la línea Selección Colombia (camiseta,
                        gorra, gafas o balón de fútbol alusivos al Mundial) o, en su defecto, en un Bono de Servicio
                        equivalente, según disponibilidad.
                    </p>
                    <p>
                        <strong>4.4 Condiciones de entrega.</strong> Todos los incentivos descritos en esta sección y en
                        el Anexo 1 son <strong>intransferibles</strong> y solo podrán ser reclamados por la persona
                        titular de la cuenta que registró el pronóstico ganador, previa verificación de identidad.
                    </p>

                    <h2 className="text-white font-bold text-base mt-2">5. Exoneración de Responsabilidad</h2>
                    <p>
                        El Operador no será responsable por fallas técnicas, de conectividad o de energía eléctrica
                        ajenas a su control que impidan el registro oportuno de un pronóstico. El Operador se reserva
                        el derecho de ajustar fechas de partidos, mecánicas e incentivos de la Actividad, informando
                        oportunamente a los Participantes a través del Sitio.
                    </p>

                    <h2 className="text-white font-bold text-base mt-2">6. Control de Fraude y Cancelación</h2>
                    <p>
                        El Operador podrá invalidar pronósticos, cuentas o incentivos cuando detecte registros
                        duplicados, manipulación del sistema, suplantación de identidad o cualquier otra conducta
                        fraudulenta que afecte la transparencia de la Actividad.
                    </p>

                    <h2 className="text-white font-bold text-base mt-2">7. Propiedad Intelectual</h2>
                    <p>
                        Las marcas, logotipos, textos, imágenes y demás contenidos del Sitio son propiedad del Operador
                        o de sus licenciantes y no podrán ser reproducidos sin autorización previa y escrita.
                    </p>

                    <h2 className="text-white font-bold text-base mt-2">8. Legislación Aplicable y Jurisdicción</h2>
                    <p>
                        Estos Términos y Condiciones se rigen por las leyes de la República de Colombia. Para efectos
                        de cualquier controversia, las partes se someten a la jurisdicción de los jueces y tribunales
                        de Barranquilla, Atlántico, sin que ello restrinja la posibilidad de que el Bono sea adquirido
                        desde cualquier parte del mundo conforme a la Sección 1.4.
                    </p>

                    <h2 className="text-white font-bold text-base mt-2">9. Aceptación</h2>
                    <p>
                        Al registrarse en el Sitio y/o adquirir un Bono, el Participante declara haber leído, entendido
                        y aceptado en su totalidad estos Términos y Condiciones, así como la{' '}
                        <Link to="/privacidad" className="text-amber-400 underline">Política de Privacidad y Tratamiento
                        de Datos Personales</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}
