import { Link } from 'react-router-dom';

export default function Privacidad() {
    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 stadium-glow px-6 py-10 flex flex-col items-center">
            <div className="absolute top-0 left-0 right-0 h-2 flex">
                <div className="flex-1 bg-colombia-yellow" />
                <div className="flex-1 bg-colombia-blue" />
                <div className="flex-1 bg-colombia-red" />
            </div>

            <div className="w-full max-w-md mt-6">
                <Link to="/" className="text-zinc-500 dark:text-zinc-400 text-sm hover:text-zinc-900 dark:hover:text-white">&larr; Volver</Link>

                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-4 mb-1">
                    Política de Privacidad y Tratamiento de Datos Personales
                </h1>
                <p className="text-zinc-400 dark:text-zinc-500 text-xs mb-6">Versión 1.0 — 15 de junio de 2026</p>

                <div className="flex flex-col gap-4 text-zinc-600 dark:text-zinc-300 text-sm">
                    <p>
                        En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013, RDM MASTER COLOMBIA SAS,
                        identificada con NIT 901.765.354-3, con domicilio en Carrera 51 #95-31, Barranquilla,
                        Atlántico, Colombia (en adelante, "el Responsable" o "La Retoucherie de Manuela"), informa la
                        presente Política de Privacidad y Tratamiento de Datos Personales aplicable al sitio web
                        www.ganaconretoucherie.com.
                    </p>

                    <h2 className="text-zinc-900 dark:text-zinc-900 dark:text-white font-bold text-base mt-2">1. Datos recolectados</h2>
                    <p>Para participar en la Actividad, el Responsable recolecta:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Nombre completo.</li>
                        <li>Número de celular (y, opcionalmente, correo electrónico).</li>
                        <li>Contraseña de acceso (almacenada de forma cifrada).</li>
                        <li>Equipos favoritos seleccionados por el Participante.</li>
                        <li>Pronósticos registrados y marcas de tiempo asociadas.</li>
                        <li>Comprobantes de pago, en caso de pagos por transferencia bancaria.</li>
                        <li>Enlace de referido utilizado, si aplica.</li>
                    </ul>

                    <h2 className="text-zinc-900 dark:text-white font-bold text-base mt-2">2. Finalidad del tratamiento</h2>
                    <p>Los datos recolectados serán utilizados exclusivamente para:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Crear y administrar la cuenta del Participante en el Sitio.</li>
                        <li>Generar, enviar y validar el Bono de Servicio y su código de acceso.</li>
                        <li>Registrar, validar y calificar los pronósticos del Concurso de Habilidad.</li>
                        <li>Contactar al Participante por correo o WhatsApp en caso de resultar beneficiario de un incentivo comercial.</li>
                        <li>Verificar y aprobar pagos realizados por transferencia bancaria.</li>
                        <li>Informar sobre próximos partidos, novedades y promociones de La Retoucherie de Manuela.</li>
                        <li>Dar cumplimiento a obligaciones legales y tributarias, incluida la facturación al momento de la redención del Bono.</li>
                    </ul>

                    <h2 className="text-zinc-900 dark:text-white font-bold text-base mt-2">3. Transferencia y transmisión de datos</h2>
                    <p>
                        El Responsable no comercializa ni cede los datos personales a terceros para fines distintos a
                        los aquí descritos. Únicamente se comparte la información estrictamente necesaria con
                        proveedores tecnológicos requeridos para la operación del Sitio, tales como la pasarela de
                        pagos Wompi, el canal de mensajería ManyChat/WhatsApp y proveedores de envío de correo
                        electrónico, quienes están obligados a dar un uso adecuado y confidencial a dicha información.
                    </p>

                    <h2 className="text-zinc-900 dark:text-white font-bold text-base mt-2">4. Derechos del titular (Derechos ARCO)</h2>
                    <p>
                        Como titular de los datos personales, el Participante tiene derecho a conocer, actualizar,
                        rectificar y solicitar la supresión de sus datos, así como a revocar la autorización otorgada
                        para su tratamiento, en los términos del artículo 8 de la Ley 1581 de 2012. Para ejercer
                        estos derechos, el Participante puede escribir a comercial@retoucherie.com.co o al WhatsApp
                        +57 310 396 3708, solicitud que será atendida dentro de los plazos legalmente establecidos.
                    </p>

                    <h2 className="text-zinc-900 dark:text-white font-bold text-base mt-2">5. Seguridad y vigencia</h2>
                    <p>
                        El Responsable adopta medidas técnicas y administrativas razonables para proteger los datos
                        personales contra acceso no autorizado, pérdida o alteración. Los datos se conservarán durante
                        el tiempo necesario para cumplir las finalidades descritas y las obligaciones legales aplicables,
                        incluido el periodo de vigencia del Bono y los plazos de reclamación de incentivos descritos en
                        el Anexo 1 de los Términos y Condiciones.
                    </p>

                    <h2 className="text-zinc-900 dark:text-white font-bold text-base mt-2">6. Autorización</h2>
                    <p>
                        Al registrarse en el Sitio, el Participante autoriza de manera previa, expresa e informada al
                        Responsable para el tratamiento de sus datos personales conforme a esta Política y a los{' '}
                        <Link to="/terminos" className="text-amber-500 dark:text-amber-400 underline">Términos y Condiciones</Link> de la
                        Actividad.
                    </p>
                </div>
            </div>
        </div>
    );
}
