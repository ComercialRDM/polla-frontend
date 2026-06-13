import { Link } from 'react-router-dom';

export default function Privacidad() {
    return (
        <div className="min-h-screen bg-zinc-950 stadium-glow px-6 py-10 flex flex-col items-center">
            <div className="absolute top-0 left-0 right-0 h-2 flex">
                <div className="flex-1 bg-colombia-yellow" />
                <div className="flex-1 bg-colombia-blue" />
                <div className="flex-1 bg-colombia-red" />
            </div>

            <div className="w-full max-w-md mt-6">
                <Link to="/" className="text-zinc-400 text-sm hover:text-white">&larr; Volver</Link>

                <h1 className="text-2xl font-extrabold text-white mt-4 mb-6">Política de privacidad</h1>

                <div className="flex flex-col gap-4 text-zinc-300 text-sm">
                    <p>
                        Para participar en la Polla Mundialista, La Retoucherie de Manuela (NIT 901765354) solicita tu
                        nombre, correo electrónico y número de celular. Estos datos se usan únicamente para:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Generar y enviar tu Bono Digital y tu acceso a la Polla.</li>
                        <li>Registrar y validar tus pronósticos del marcador.</li>
                        <li>Contactarte por correo o WhatsApp en caso de que ganes un premio.</li>
                        <li>Informarte sobre próximos partidos y promociones de La Retoucherie de Manuela.</li>
                    </ul>
                    <p>
                        Si pagas por transferencia bancaria, almacenamos la imagen del comprobante únicamente para
                        verificar el pago y aprobarlo desde nuestro panel administrativo.
                    </p>
                    <p>
                        No compartimos tus datos con terceros, salvo con los proveedores necesarios para procesar el
                        pago (Wompi) y el envío de correos.
                    </p>
                    <p>
                        Si deseas que eliminemos tus datos, escríbenos por WhatsApp y atenderemos tu solicitud.
                    </p>
                </div>
            </div>
        </div>
    );
}
