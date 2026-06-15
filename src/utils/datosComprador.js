const DATOS_KEY = 'polla_datos_comprador';

export function guardarDatosComprador({ nombre, correo, celular }) {
    try {
        const actuales = obtenerDatosComprador();
        localStorage.setItem(
            DATOS_KEY,
            JSON.stringify({
                nombre: nombre?.trim() || actuales.nombre || '',
                correo: correo?.trim() || actuales.correo || '',
                celular: celular?.trim() || actuales.celular || '',
            })
        );
    } catch {
        // localStorage no disponible, ignorar
    }
}

export function obtenerDatosComprador() {
    try {
        const data = localStorage.getItem(DATOS_KEY);
        return data ? JSON.parse(data) : { nombre: '', correo: '', celular: '' };
    } catch {
        return { nombre: '', correo: '', celular: '' };
    }
}
