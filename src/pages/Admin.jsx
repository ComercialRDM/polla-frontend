import { Fragment, useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { adminLogin, adminPendientes, adminAprobar, adminRechazar, adminCrearPartido, adminActualizarPartido, adminEliminarPartido, adminAbrirComprobante, adminNotificarRecompra, adminSimuladorMetricas, obtenerPartidos, adminApuestas, adminApuestasExport, adminRankingGlobal, adminMarcarUsuarioTest, adminBonosColombia, adminMarcarReclamado, adminTestWhatsapp, adminLocalUsuarios, adminCrearLocalUsuario, adminResetLocalPassword, adminToggleLocalUsuario, admin2faEstado, admin2faSetup, admin2faConfirmar, admin2faDesactivar, adminReportes, adminUsuarios, adminEliminarUsuario, adminCrearEspeciales, adminListarEspeciales, adminInvitarEspecial, adminReenviarBono, adminRankingEspeciales, adminFlashGanadores, adminRankingFinal, adminListarRegistrosInfluencer, adminMarcarRegistroInfluencer, adminAbrirFotoRegistroInfluencer, adminListarAfiliados, adminEditarAfiliado, adminListarComisiones, adminActualizarEstadoComision, adminRedencionesResumen, adminRedencionesExport, adminDemograficos, adminMarketingResumen, adminMarketingAgregarGasto, adminMarketingEliminarGasto, adminVentasPorCanal, API_BASE } from '../api';
import { formatoPesos } from '../config/planes';
import { META_INGRESOS, FECHA_META, PRECIO_SIMULADOR_MIN, PRECIO_SIMULADOR_MAX, PRECIO_SIMULADOR_PASO, PRECIO_REFERENCIA, calcularProyeccion } from '../config/elasticidad';

const GRUPOS_NAV = [
    {
        id: 'overview', label: null,
        color: 'amber',
        secciones: [
            { id: 'inicio', label: '🏠 Inicio' },
        ],
    },
    {
        id: 'clientes', label: 'Clientes',
        color: 'blue',
        secciones: [
            { id: 'transacciones',  label: '💳 Transacciones' },
            { id: 'usuarios',       label: '👥 Usuarios' },
            { id: 'pronosticos',    label: '⚽ Pronósticos' },
            { id: 'redenciones',    label: '🧾 Redenciones' },
        ],
    },
    {
        id: 'marketing', label: 'Marketing',
        color: 'purple',
        secciones: [
            { id: 'influenciadores', label: '🎖️ Influenciadores' },
            { id: 'bonoscolombia',   label: '🇨🇴 Bono Col' },
            { id: 'simulador',       label: '📊 Simulador' },
        ],
    },
    {
        id: 'torneo', label: 'Torneo',
        color: 'green',
        secciones: [
            { id: 'partidos',  label: '⚽ Partidos' },
            { id: 'ranking',   label: '🏆 Ranking' },
            { id: 'localesqr', label: '📍 Locales QR' },
        ],
    },
    {
        id: 'sistema', label: 'Sistema',
        color: 'red',
        secciones: [
            { id: 'seguridad', label: '🔐 Seguridad' },
        ],
    },
];

// Flat list para compatibilidad con el resto del código
const SECCIONES = GRUPOS_NAV.flatMap((g) => g.secciones);

const TOKEN_STORAGE_KEY = 'polla_admin_token';

// Convierte un ISO date a formato "YYYY-MM-DDTHH:mm" en hora local para inputs datetime-local
function aDatetimeLocal(iso) {
    const fecha = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
}

export default function Admin() {
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || '');
    const [usuarioInput, setUsuarioInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [autenticado, setAutenticado] = useState(false);
    const [transacciones, setTransacciones] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [filtro, setFiltro] = useState('TODAS');
    const [busqueda, setBusqueda] = useState('');

    const [partidos, setPartidos] = useState([]);
    const [nuevoPartido, setNuevoPartido] = useState({ equipo_local: '', equipo_visitante: '', fecha_hora_inicio: '', fase: 'grupos' });
    const [creandoPartido, setCreandoPartido] = useState(false);
    const [errorPartido, setErrorPartido] = useState('');

    const [editandoPartido, setEditandoPartido] = useState(null);
    const [edicionPartido, setEdicionPartido] = useState(null);
    const [guardandoPartido, setGuardandoPartido] = useState(false);
    const [bonoColResult, setBonoColResult] = useState(null);

    const [rankingGlobal, setRankingGlobal]   = useState([]);
    const [cargandoRanking, setCargandoRanking] = useState(false);
    const [rankingExpandidoId, setRankingExpandidoId] = useState(null);
    const [mensajeCopiado, setMensajeCopiado] = useState(null);

    const [bonosCol, setBonosCol]             = useState([]);
    const [cargandoBonosCol, setCargandoBonosCol] = useState(false);
    const [reclamandoId, setReclamandoId]     = useState(null);

    const [flashGanadores, setFlashGanadores]     = useState([]);
    const [cargandoFlash, setCargandoFlash]       = useState(false);

    const [rankingFinal, setRankingFinal]         = useState(null);
    const [cargandoRankingFinal, setCargandoRankingFinal] = useState(false);

    const [especiales, setEspeciales]         = useState([]);
    const [cargandoEspeciales, setCargandoEspeciales] = useState(false);
    const [filasInfluencers, setFilasInfluencers] = useState([{ nombre: '', celular: '', correo: '' }]);
    const [valorBonoEspecial, setValorBonoEspecial] = useState(500000);
    const [intentosEspecial, setIntentosEspecial] = useState(30);
    const [creandoEspeciales, setCreandoEspeciales] = useState(false);
    const [resultadoEspeciales, setResultadoEspeciales] = useState(null);
    const [invitandoId, setInvitandoId]       = useState(null);
    const [resultadoInvitar, setResultadoInvitar] = useState(null);
    const [reenviadoBonoId, setReenviadoBonoId] = useState(null);
    const [resultadoReenviarBono, setResultadoReenviarBono] = useState(null);
    const [erroresPorFila, setErroresPorFila] = useState({});
    const [rankingEspeciales, setRankingEspeciales] = useState([]);
    const [cargandoRankingEspeciales, setCargandoRankingEspeciales] = useState(false);

    const [registrosInfluencer, setRegistrosInfluencer] = useState([]);
    const [cargandoRegistrosInfluencer, setCargandoRegistrosInfluencer] = useState(false);
    const [marcandoRegistroId, setMarcandoRegistroId] = useState(null);

    const [afiliados, setAfiliados] = useState([]);
    const [cargandoAfiliados, setCargandoAfiliados] = useState(false);
    const [comisiones, setComisiones] = useState([]);
    const [cargandoComisiones, setCargandoComisiones] = useState(false);
    const [actualizandoComisionId, setActualizandoComisionId] = useState(null);

    const [testWaCelular, setTestWaCelular]   = useState('');
    const [testWaResult, setTestWaResult]     = useState(null);
    const [testWaEnviando, setTestWaEnviando] = useState(false);

    const [recompra, setRecompra] = useState({ origen: '', destino: '' });
    const [enviandoRecompra, setEnviandoRecompra] = useState(false);
    const [resultadoRecompra, setResultadoRecompra] = useState('');

    const [localesQR, setLocalesQR] = useState([]);
    const [cargandoLocales, setCargandoLocales] = useState(false);
    const [nuevoLocal, setNuevoLocal] = useState({ usuario: '', password: '', nombre_local: '', correo: '' });
    const [creandoLocal, setCreandoLocal] = useState(false);
    const [errorLocal, setErrorLocal] = useState('');
    const [tempPassVisible, setTempPassVisible] = useState({});

    // ── 2FA ───────────────────────────────────────────────────────────────────
    const [loginPaso2fa, setLoginPaso2fa] = useState(false);
    const [loginTotpCode, setLoginTotpCode] = useState('');
    const [totp2faEnabled, setTotp2faEnabled] = useState(false);
    const [totp2faQr, setTotp2faQr] = useState(null);
    const [totp2faCode, setTotp2faCode] = useState('');
    const [totp2faMsg, setTotp2faMsg] = useState('');

    // ── Usuarios ──────────────────────────────────────────────────────────────
    const [usuarios, setUsuarios]                   = useState([]);
    const [usuariosCargando, setUsuariosCargando]   = useState(false);
    const [usuariosBusqueda, setUsuariosBusqueda]   = useState('');
    const [usuariosFechaInicio, setUsuariosFechaInicio] = useState('');
    const [usuariosFechaFin,    setUsuariosFechaFin]    = useState('');

    // ── Reportes ──────────────────────────────────────────────────────────────
    const [reporteFechaInicio, setReporteFechaInicio] = useState('');
    const [reporteFechaFin,    setReporteFechaFin]    = useState('');
    const [reporteData,        setReporteData]        = useState(null);
    const [reporteCargando,    setReporteCargando]    = useState(false);
    const [reporteError,       setReporteError]       = useState('');

    // ── Redenciones de bonos por sede ────────────────────────────────────────
    const [resumenDiaFecha,    setResumenDiaFecha]    = useState(() => new Date().toISOString().slice(0, 10));
    const [resumenDia,         setResumenDia]         = useState(null);
    const [resumenDiaCargando, setResumenDiaCargando] = useState(false);
    const [resumenDiaError,    setResumenDiaError]    = useState('');
    const [redFechaInicio,     setRedFechaInicio]     = useState('');
    const [redFechaFin,        setRedFechaFin]        = useState('');
    const [redData,            setRedData]            = useState(null);
    const [redCargando,        setRedCargando]        = useState(false);
    const [redError,           setRedError]           = useState('');

    const [seccionActiva, setSeccionActiva] = useState('inicio');

    // ── Inicio: demografía ────────────────────────────────────────────────────
    const [demograficos,        setDemograficos]        = useState(null);
    const [demoCargando,        setDemoCargando]        = useState(false);

    // ── Inicio: canales de adquisición ───────────────────────────────────────
    const [inicioCanales,       setInicioCanales]       = useState(null);

    // ── Inicio: bolsa de marketing ────────────────────────────────────────────
    const [marketing,           setMarketing]           = useState(null);
    const [mktCargando,         setMktCargando]         = useState(false);
    const [mktError,            setMktError]            = useState('');
    const [mktTipo,             setMktTipo]             = useState('pauta_ads');
    const [mktDesc,             setMktDesc]             = useState('');
    const [mktMonto,            setMktMonto]            = useState('');
    const [mktFecha,            setMktFecha]            = useState(() => new Date().toISOString().slice(0, 10));
    const [mktGuardando,        setMktGuardando]        = useState(false);

    const [metricasSimulador, setMetricasSimulador] = useState(null);
    const [errorSimulador, setErrorSimulador] = useState('');
    const [precioSimulado, setPrecioSimulado] = useState(PRECIO_REFERENCIA);

    // ── Apuestas ──────────────────────────────────────────────────────────────
    const [apPartidoId, setApPartidoId]   = useState('');
    const [apBusqueda, setApBusqueda]     = useState('');
    const [apData, setApData]             = useState(null);
    const [apPage, setApPage]             = useState(1);
    const [apCargando, setApCargando]     = useState(false);
    const [apError, setApError]           = useState('');
    const [exportando, setExportando]     = useState('');

    async function cargarDatos(tok) {
        setCargando(true);
        setError('');
        try {
            const data = await adminPendientes(tok);
            if (data?.success) {
                setTransacciones(data.transacciones);
                setAutenticado(true);
                localStorage.setItem(TOKEN_STORAGE_KEY, tok);
            } else {
                setError('Token inválido.');
                setAutenticado(false);
                localStorage.removeItem(TOKEN_STORAGE_KEY);
            }
        } catch (err) {
            setError('Token inválido o error de conexión.');
            setAutenticado(false);
        } finally {
            setCargando(false);
        }
    }

    async function cargarPartidos() {
        try {
            const data = await obtenerPartidos();
            if (data?.success) {
                setPartidos(data.partidos);
            }
        } catch (err) {
            // silencioso
        }
    }

    async function cargarInicioSimulador() {
        try {
            const d = await adminSimuladorMetricas(token);
            if (d?.success) setMetricasSimulador(d);
        } catch { /* silencioso */ }
    }

    async function cargarInicioCanales() {
        try {
            const d = await adminVentasPorCanal(token);
            if (d?.success) setInicioCanales(d.canales || []);
        } catch { /* silencioso */ }
    }

    async function cargarDemograficos() {
        setDemoCargando(true);
        try {
            const d = await adminDemograficos(token);
            if (d?.success) setDemograficos(d);
        } catch { /* silencioso */ } finally { setDemoCargando(false); }
    }

    async function cargarMarketing() {
        setMktCargando(true);
        setMktError('');
        try {
            const d = await adminMarketingResumen(token);
            if (d?.success) setMarketing(d);
        } catch (err) { setMktError(err.message || 'Error'); } finally { setMktCargando(false); }
    }

    async function handleAgregarGasto(e) {
        e.preventDefault();
        if (!mktMonto || Number(mktMonto) <= 0) { setMktError('El monto debe ser mayor a 0'); return; }
        setMktGuardando(true);
        setMktError('');
        try {
            await adminMarketingAgregarGasto(token, { tipo: mktTipo, descripcion: mktDesc || undefined, monto: Number(mktMonto), fecha: mktFecha });
            setMktMonto('');
            setMktDesc('');
            await cargarMarketing();
        } catch (err) { setMktError(err.message || 'Error'); } finally { setMktGuardando(false); }
    }

    async function handleEliminarGasto(id) {
        if (!window.confirm('¿Eliminar este gasto?')) return;
        try {
            await adminMarketingEliminarGasto(token, id);
            await cargarMarketing();
        } catch { /* silencioso */ }
    }

    async function cargarUsuarios() {
        setUsuariosCargando(true);
        try {
            const data = await adminUsuarios(token);
            if (data?.success) setUsuarios(data.usuarios);
        } catch (err) {
            // silencioso
        } finally {
            setUsuariosCargando(false);
        }
    }

    async function handleEliminarUsuario(usuario) {
        if (!window.confirm(`¿Borrar la cuenta de "${usuario.nombre}" (${usuario.celular})? Esta acción no se puede deshacer.`)) return;
        try {
            const data = await adminEliminarUsuario(token, usuario.id);
            if (data?.success) {
                setUsuarios((prev) => prev.filter((u) => u.id !== usuario.id));
            } else {
                window.alert(data?.error || 'No se pudo borrar el usuario.');
            }
        } catch {
            window.alert('Error de conexión con el servidor.');
        }
    }

    function usuariosFiltrados() {
        return usuarios.filter((u) => {
            const q = usuariosBusqueda.toLowerCase();
            const matchQ = !q || u.nombre?.toLowerCase().includes(q) || u.correo?.toLowerCase().includes(q) || u.celular?.includes(q);
            const fecha = new Date(u.fecha_registro);
            const matchInicio = !usuariosFechaInicio || fecha >= new Date(usuariosFechaInicio);
            const matchFin    = !usuariosFechaFin    || fecha <= new Date(usuariosFechaFin + 'T23:59:59');
            return matchQ && matchInicio && matchFin;
        });
    }

    function exportarUsuariosCSV() {
        const datos = usuariosFiltrados();
        const headers = ['Nombre', 'Celular', 'Correo', 'Compras aprobadas', 'Total pagado', 'Fecha registro'];
        const filas = datos.map((u) => [
            u.nombre, u.celular, u.correo || '',
            u.compras_aprobadas, Number(u.total_pagado),
            new Date(u.fecha_registro).toLocaleDateString('es-CO'),
        ]);
        const csv = [headers, ...filas].map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'usuarios_polla.csv';
        a.click();
    }

    function exportarUsuariosExcel() {
        const datos = usuariosFiltrados();
        const ws = XLSX.utils.json_to_sheet(datos.map((u) => ({
            Nombre: u.nombre, Celular: u.celular, Correo: u.correo || '',
            'Compras aprobadas': Number(u.compras_aprobadas),
            'Total pagado': Number(u.total_pagado),
            'Fecha registro': new Date(u.fecha_registro).toLocaleDateString('es-CO'),
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
        XLSX.writeFile(wb, 'usuarios_polla.xlsx');
    }

    function exportarUsuariosPDF() {
        const datos = usuariosFiltrados();
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text('Usuarios Registrados - Polla Mundialista', 14, 15);
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text('La Retoucherie de Manuela · ' + new Date().toLocaleDateString('es-CO'), 14, 22);
        autoTable(doc, {
            startY: 28,
            head: [['Nombre', 'Celular', 'Correo', 'Compras', 'Total pagado', 'Registro']],
            body: datos.map((u) => [
                u.nombre, u.celular, u.correo || '',
                u.compras_aprobadas,
                Number(u.total_pagado) > 0 ? '$' + Number(u.total_pagado).toLocaleString('es-CO') : '—',
                new Date(u.fecha_registro).toLocaleDateString('es-CO'),
            ]),
            styles: { fontSize: 8 },
            headStyles: { fillColor: [234, 179, 8], textColor: 0 },
        });
        doc.save('usuarios_polla.pdf');
    }

    const PLANTILLA_GANADOR = (nombre) => `🏆 ¡Felicitaciones, ${nombre}! 🇨🇴⚽

Quedaste entre los ganadores de la Polla Mundialista de La Retoucherie de Manuela.

Para reclamar tu premio, respóndenos por este mismo chat o visita cualquiera de nuestras sedes en Barranquilla.

¡Gracias por participar y disfrutar el Mundial con nosotros! 🎉`;

    const PLANTILLA_TOP100 = (nombre, puntos) => `⚽ ¡Hola ${nombre}!

Estás en el Top 100 de la Polla Mundialista de La Retoucherie 🏆 con ${puntos} puntos.

¡Sigue prediciendo los marcadores de los próximos partidos para subir en el ranking y ganar más premios! 💪🇨🇴

👉 www.ganaconretoucherie.com`;

    function copiarMensaje(usuario, tipo) {
        const texto = tipo === 'ganador'
            ? PLANTILLA_GANADOR(usuario.nombre)
            : PLANTILLA_TOP100(usuario.nombre, usuario.puntos);
        navigator.clipboard.writeText(texto).then(() => {
            setMensajeCopiado(`${usuario.id}-${tipo}`);
            setTimeout(() => setMensajeCopiado(null), 2000);
        });
    }

    async function handleMarcarTest(usuario) {
        try {
            const data = await adminMarcarUsuarioTest(token, usuario.id, true);
            if (data?.success) {
                setRankingGlobal((prev) => prev.filter((u) => u.id !== usuario.id));
            }
        } catch (err) {
            // silencioso
        }
    }

    async function cargarRankingGlobal() {
        setCargandoRanking(true);
        try {
            const data = await adminRankingGlobal(token, 100);
            if (data?.success) setRankingGlobal(data.ranking);
        } catch (err) {
            // silencioso
        } finally {
            setCargandoRanking(false);
        }
    }

    async function cargarBonosColombia() {
        setCargandoBonosCol(true);
        try {
            const data = await adminBonosColombia(token);
            if (data?.success) setBonosCol(data.bonos);
        } catch (err) {
            // silencioso
        } finally {
            setCargandoBonosCol(false);
        }
    }

    async function cargarFlashGanadores() {
        setCargandoFlash(true);
        try {
            const data = await adminFlashGanadores(token);
            if (data?.success) setFlashGanadores(data.partidos);
        } catch (err) {
            // silencioso
        } finally {
            setCargandoFlash(false);
        }
    }

    async function cargarRankingFinal() {
        setCargandoRankingFinal(true);
        try {
            const data = await adminRankingFinal(token);
            if (data?.success) setRankingFinal(data);
        } catch (err) {
            // silencioso
        } finally {
            setCargandoRankingFinal(false);
        }
    }

    async function handleReclamarBono(id) {
        setReclamandoId(id);
        try {
            const data = await adminMarcarReclamado(token, id);
            if (data?.success) setBonosCol((prev) => prev.map((b) => b.id === id ? { ...b, reclamado: true } : b));
        } catch (err) {
            // silencioso
        } finally {
            setReclamandoId(null);
        }
    }

    async function cargarEspeciales() {
        setCargandoEspeciales(true);
        try {
            const data = await adminListarEspeciales(token);
            if (data?.success) setEspeciales(data.bonos);
        } catch (err) {
            // silencioso
        } finally {
            setCargandoEspeciales(false);
        }
    }

    function handleCambiarFilaInfluencer(idx, campo, valor) {
        setFilasInfluencers((prev) => prev.map((fila, i) => (i === idx ? { ...fila, [campo]: valor } : fila)));
    }

    function handleAgregarFilaInfluencer() {
        setFilasInfluencers((prev) => [...prev, { nombre: '', celular: '', correo: '' }]);
    }

    function handleQuitarFilaInfluencer(idx) {
        setFilasInfluencers((prev) => prev.filter((_, i) => i !== idx));
    }

    async function handleCrearEspeciales(e) {
        e.preventDefault();
        const personas = filasInfluencers
            .map((f) => ({ nombre: f.nombre.trim(), celular: f.celular.trim(), correo: f.correo.trim() || undefined }))
            .filter((f) => f.nombre && f.celular);

        if (personas.length === 0) return;

        setCreandoEspeciales(true);
        setResultadoEspeciales(null);
        try {
            const data = await adminCrearEspeciales(token, { personas, valorBono: Number(valorBonoEspecial), intentos: Number(intentosEspecial) });
            setResultadoEspeciales(data);
            if (data?.success) {
                setFilasInfluencers([{ nombre: '', celular: '', correo: '' }]);
                cargarEspeciales();
            }
        } catch (err) {
            setResultadoEspeciales({ success: false, error: err.message });
        } finally {
            setCreandoEspeciales(false);
        }
    }

    async function cargarRankingEspeciales() {
        setCargandoRankingEspeciales(true);
        try {
            const data = await adminRankingEspeciales(token);
            if (data?.success) setRankingEspeciales(data.ranking);
        } catch (err) {
            // silencioso
        } finally {
            setCargandoRankingEspeciales(false);
        }
    }

    async function cargarRegistrosInfluencer() {
        setCargandoRegistrosInfluencer(true);
        try {
            const data = await adminListarRegistrosInfluencer(token);
            if (data?.success) setRegistrosInfluencer(data.registros);
        } catch (err) {
            // silencioso
        } finally {
            setCargandoRegistrosInfluencer(false);
        }
    }

    // Copia los datos del registro público a la primera fila del formulario de
    // Bono Especial, para que el admin solo tenga que confirmar valor/cupos.
    function handleUsarDatosRegistro(registro) {
        setFilasInfluencers([{ nombre: registro.nombre, celular: registro.celular, correo: registro.correo }]);
        document.getElementById('form-bono-especial')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async function handleVerFotoRegistro(id) {
        try {
            await adminAbrirFotoRegistroInfluencer(token, id);
        } catch (err) {
            // silencioso
        }
    }

    async function handleMarcarRegistroInfluencer(id, atendido) {
        setMarcandoRegistroId(id);
        try {
            const data = await adminMarcarRegistroInfluencer(token, id, atendido);
            if (data?.success) {
                setRegistrosInfluencer((prev) => prev.map((r) => (r.id === id ? { ...r, atendido } : r)));
            }
        } catch (err) {
            // silencioso
        } finally {
            setMarcandoRegistroId(null);
        }
    }

    async function cargarAfiliados() {
        setCargandoAfiliados(true);
        try {
            const data = await adminListarAfiliados(token);
            if (data?.success) setAfiliados(data.afiliados);
        } catch (err) {
            // silencioso
        } finally {
            setCargandoAfiliados(false);
        }
    }

    async function handleEditarPorcentaje(id, porcentajeActual) {
        const nuevo = window.prompt('Nuevo % de comisión para este afiliado:', porcentajeActual);
        if (nuevo == null || nuevo.trim() === '') return;
        const porcentajeNum = Number(nuevo);
        if (!Number.isFinite(porcentajeNum) || porcentajeNum < 0 || porcentajeNum > 100) {
            window.alert('Ingresa un porcentaje válido entre 0 y 100.');
            return;
        }
        try {
            const data = await adminEditarAfiliado(token, id, { porcentaje_comision: porcentajeNum });
            if (data?.success) cargarAfiliados();
        } catch (err) {
            // silencioso
        }
    }

    async function handleToggleAfiliadoActivo(id, activo) {
        try {
            const data = await adminEditarAfiliado(token, id, { activo });
            if (data?.success) cargarAfiliados();
        } catch (err) {
            // silencioso
        }
    }

    async function cargarComisiones() {
        setCargandoComisiones(true);
        try {
            const data = await adminListarComisiones(token);
            if (data?.success) setComisiones(data.comisiones);
        } catch (err) {
            // silencioso
        } finally {
            setCargandoComisiones(false);
        }
    }

    async function handleActualizarComision(id, estado) {
        setActualizandoComisionId(id);
        try {
            const data = await adminActualizarEstadoComision(token, id, estado);
            if (data?.success) setComisiones((prev) => prev.map((c) => (c.id === id ? { ...c, estado } : c)));
        } catch (err) {
            // silencioso
        } finally {
            setActualizandoComisionId(null);
        }
    }

    async function handleInvitar(id) {
        setInvitandoId(id);
        setErroresPorFila((prev) => ({ ...prev, [id]: { ...prev[id], invitacion: null } }));
        try {
            const data = await adminInvitarEspecial(token, id);
            if (data?.success) {
                const ahora = new Date().toISOString();
                setEspeciales((prev) => prev.map((e) => (e.transaccion_id === id ? { ...e, invitacion_enviada: true, whatsapp_invitacion_at: ahora } : e)));
            } else {
                setErroresPorFila((prev) => ({ ...prev, [id]: { ...prev[id], invitacion: data?.error || 'Error al enviar' } }));
            }
        } catch (err) {
            setErroresPorFila((prev) => ({ ...prev, [id]: { ...prev[id], invitacion: err.message } }));
        } finally {
            setInvitandoId(null);
        }
    }

    async function handleReenviarBono(id) {
        setReenviadoBonoId(id);
        setErroresPorFila((prev) => ({ ...prev, [id]: { ...prev[id], bono: null } }));
        try {
            const data = await adminReenviarBono(token, id);
            if (data?.success) {
                const ahora = new Date().toISOString();
                setEspeciales((prev) => prev.map((e) => (e.transaccion_id === id ? { ...e, whatsapp_bono_at: ahora } : e)));
            } else {
                setErroresPorFila((prev) => ({ ...prev, [id]: { ...prev[id], bono: data?.error || 'Error al enviar' } }));
            }
        } catch (err) {
            setErroresPorFila((prev) => ({ ...prev, [id]: { ...prev[id], bono: err.message } }));
        } finally {
            setReenviadoBonoId(null);
        }
    }

    async function handleTestWhatsapp(e) {
        e.preventDefault();
        if (!testWaCelular.trim()) return;
        setTestWaEnviando(true);
        setTestWaResult(null);
        try {
            const data = await adminTestWhatsapp(token, testWaCelular.trim());
            setTestWaResult(data);
        } catch (err) {
            setTestWaResult({ success: false, error: err.message });
        } finally {
            setTestWaEnviando(false);
        }
    }

    async function cargarLocalesQR() {
        setCargandoLocales(true);
        try {
            const data = await adminLocalUsuarios(token);
            if (data?.success) setLocalesQR(data.usuarios);
        } catch {
            // silencioso
        } finally {
            setCargandoLocales(false);
        }
    }

    async function handleCrearLocal(e) {
        e.preventDefault();
        if (!nuevoLocal.usuario.trim() || !nuevoLocal.password.trim()) return;
        setCreandoLocal(true);
        setErrorLocal('');
        try {
            const data = await adminCrearLocalUsuario(token, nuevoLocal);
            if (data?.success) {
                setLocalesQR(prev => [data.usuario, ...prev]);
                setNuevoLocal({ usuario: '', password: '', nombre_local: '', correo: '' });
            } else {
                setErrorLocal(data?.error || 'Error al crear usuario');
            }
        } catch {
            setErrorLocal('Error de conexión');
        } finally {
            setCreandoLocal(false);
        }
    }

    async function handleResetLocalPass(id) {
        try {
            const data = await adminResetLocalPassword(token, id);
            if (data?.success) {
                setTempPassVisible(prev => ({ ...prev, [id]: data.tempPass }));
            }
        } catch {
            // silencioso
        }
    }

    async function handleToggleLocal(id) {
        try {
            const data = await adminToggleLocalUsuario(token, id);
            if (data?.success) {
                setLocalesQR(prev => prev.map(u => u.id === id ? { ...u, activo: data.activo } : u));
            }
        } catch {
            // silencioso
        }
    }

    async function handle2faSetup() {
        setTotp2faMsg('');
        try {
            const data = await admin2faSetup(token);
            if (data?.success) { setTotp2faQr(data.qrDataUrl); setTotp2faMsg(''); }
            else setTotp2faMsg(data?.error || 'Error al generar QR');
        } catch { setTotp2faMsg('Error de conexión'); }
    }

    async function handle2faConfirmar(e) {
        e.preventDefault();
        setTotp2faMsg('');
        try {
            const data = await admin2faConfirmar(token, totp2faCode);
            if (data?.success) {
                setTotp2faEnabled(true); setTotp2faQr(null); setTotp2faCode('');
                setTotp2faMsg('✅ 2FA activado correctamente.');
            } else { setTotp2faMsg(data?.error || 'Código incorrecto'); }
        } catch { setTotp2faMsg('Error de conexión'); }
    }

    async function handle2faDesactivar(e) {
        e.preventDefault();
        setTotp2faMsg('');
        try {
            const data = await admin2faDesactivar(token, totp2faCode);
            if (data?.success) {
                setTotp2faEnabled(false); setTotp2faCode('');
                setTotp2faMsg('2FA desactivado.');
            } else { setTotp2faMsg(data?.error || 'Código incorrecto'); }
        } catch { setTotp2faMsg('Error de conexión'); }
    }

    async function cargarSimulador(tok) {
        setErrorSimulador('');
        try {
            const data = await adminSimuladorMetricas(tok);
            if (data?.success) {
                setMetricasSimulador(data);
            } else {
                setErrorSimulador(data?.error || 'No se pudo cargar el simulador.');
            }
        } catch {
            setErrorSimulador('Error de conexión al cargar el simulador.');
        }
    }

    useEffect(() => {
        if (token) {
            cargarDatos(token);
            cargarPartidos();
            cargarSimulador(token);
        }
    }, []);

    useEffect(() => {
        if (seccionActiva === 'inicio' && token) { cargarDemograficos(); cargarMarketing(); cargarInicioSimulador(); cargarInicioCanales(); cargarAfiliados(); }
        if (seccionActiva === 'usuarios' && token) cargarUsuarios();
        if (seccionActiva === 'ranking' && token) { cargarBonosColombia(); cargarFlashGanadores(); }
        if (seccionActiva === 'bonoscolombia' && token) cargarBonosColombia();
        if (seccionActiva === 'influenciadores' && token) { cargarEspeciales(); cargarRankingEspeciales(); cargarRegistrosInfluencer(); cargarAfiliados(); cargarComisiones(); }
        if (seccionActiva === 'localesqr' && token) cargarLocalesQR();
        if (seccionActiva === 'redenciones' && token) cargarResumenDia(resumenDiaFecha);
        if (seccionActiva === 'seguridad' && token) {
            admin2faEstado(token).then(d => { if (d?.success) setTotp2faEnabled(d.totp_enabled); }).catch(() => {});
        }
    }, [seccionActiva]);

    // Ranking global: se actualiza cada minuto mientras esa pestaña esté activa
    useEffect(() => {
        if (seccionActiva !== 'ranking' || !token) return;
        cargarRankingGlobal();
        const intervalo = setInterval(cargarRankingGlobal, 60 * 1000);
        return () => clearInterval(intervalo);
    }, [seccionActiva, token]);

    async function handleLogin(e) {
        e.preventDefault();
        if (!usuarioInput.trim() || !passwordInput.trim()) return;

        setCargando(true);
        setError('');
        try {
            const data = await adminLogin(usuarioInput.trim(), passwordInput, loginPaso2fa ? loginTotpCode : undefined);
            if (data?.success) {
                setToken(data.token);
                setPasswordInput('');
                setLoginPaso2fa(false);
                setLoginTotpCode('');
                cargarDatos(data.token);
                cargarPartidos();
                cargarSimulador(data.token);
            } else if (data?.requires_2fa) {
                setLoginPaso2fa(true);
            } else {
                setError(data?.error || 'Usuario o contraseña incorrectos.');
            }
        } catch (err) {
            setError('Error de conexión al iniciar sesión.');
        } finally {
            setCargando(false);
        }
    }

    async function handleCrearPartido(e) {
        e.preventDefault();
        setErrorPartido('');

        const { equipo_local, equipo_visitante, fecha_hora_inicio } = nuevoPartido;
        if (!equipo_local.trim() || !equipo_visitante.trim() || !fecha_hora_inicio) {
            setErrorPartido('Completa todos los campos.');
            return;
        }

        setCreandoPartido(true);
        try {
            const data = await adminCrearPartido(token, {
                equipo_local: equipo_local.trim(),
                equipo_visitante: equipo_visitante.trim(),
                fecha_hora_inicio: new Date(fecha_hora_inicio).toISOString(),
                fase: nuevoPartido.fase,
            });
            if (data?.success) {
                setNuevoPartido({ equipo_local: '', equipo_visitante: '', fecha_hora_inicio: '', fase: 'grupos' });
                cargarPartidos();
            } else {
                setErrorPartido(data?.error || 'No se pudo crear el partido.');
            }
        } catch (err) {
            setErrorPartido('Error de conexión al crear el partido.');
        } finally {
            setCreandoPartido(false);
        }
    }

    async function handleEliminarPartido(id) {
        if (!window.confirm('¿Eliminar este partido?')) return;

        setErrorPartido('');
        try {
            const data = await adminEliminarPartido(token, id);
            if (data?.success) {
                cargarPartidos();
            } else {
                setErrorPartido(data?.error || 'No se pudo eliminar el partido.');
            }
        } catch (err) {
            setErrorPartido('Error de conexión al eliminar el partido.');
        }
    }

    function handleEditarPartido(p) {
        setEditandoPartido(p.id);
        setEdicionPartido({
            fecha_hora_inicio: aDatetimeLocal(p.fecha_hora_inicio),
            goles_local: p.goles_local ?? 0,
            goles_visitante: p.goles_visitante ?? 0,
            estado: p.estado,
            fase: p.fase || 'grupos',
        });
    }

    function handleCancelarEdicionPartido() {
        setEditandoPartido(null);
        setEdicionPartido(null);
    }

    async function handleGuardarPartido(id) {
        setErrorPartido('');
        setGuardandoPartido(true);
        try {
            const data = await adminActualizarPartido(token, id, {
                fecha_hora_inicio: new Date(edicionPartido.fecha_hora_inicio).toISOString(),
                goles_local: Number(edicionPartido.goles_local),
                goles_visitante: Number(edicionPartido.goles_visitante),
                estado: edicionPartido.estado,
                fase: edicionPartido.fase,
            });
            if (data?.success) {
                setEditandoPartido(null);
                setEdicionPartido(null);
                cargarPartidos();
                if (data.bonoColombia) setBonoColResult(data.bonoColombia);
            } else {
                setErrorPartido(data?.error || 'No se pudo actualizar el partido.');
            }
        } catch (err) {
            setErrorPartido('Error de conexión al actualizar el partido.');
        } finally {
            setGuardandoPartido(false);
        }
    }

    async function handleNotificarRecompra(e) {
        e.preventDefault();
        setResultadoRecompra('');

        if (!recompra.origen || !recompra.destino) {
            setResultadoRecompra('Selecciona el partido de origen y el de destino.');
            return;
        }

        setEnviandoRecompra(true);
        try {
            const data = await adminNotificarRecompra(token, {
                partido_id_origen: recompra.origen,
                partido_id_destino: recompra.destino,
            });
            if (data?.success) {
                setResultadoRecompra(`Correo enviado a ${data.enviados} de ${data.total} participantes.`);
            } else {
                setResultadoRecompra(data?.error || 'No se pudo enviar la notificación.');
            }
        } catch (err) {
            setResultadoRecompra('Error de conexión al enviar la notificación.');
        } finally {
            setEnviandoRecompra(false);
        }
    }

    async function handleAprobar(id) {
        try {
            const data = await adminAprobar(token, id);
            if (!data?.success) {
                setError(data?.error || 'No se pudo aprobar la transacción.');
                return;
            }
            setError('');
            cargarDatos(token);
        } catch (err) {
            setError('No se pudo aprobar la transacción.');
        }
    }

    async function handleRechazar(id) {
        try {
            const data = await adminRechazar(token, id);
            if (!data?.success) {
                setError(data?.error || 'No se pudo rechazar la transacción.');
                return;
            }
            setError('');
            cargarDatos(token);
        } catch (err) {
            setError('No se pudo rechazar la transacción.');
        }
    }

    async function handleVerComprobante(id) {
        try {
            await adminAbrirComprobante(token, id);
        } catch (err) {
            setError('No se pudo abrir el comprobante.');
        }
    }

    // ── Apuestas ──────────────────────────────────────────────────────────────
    async function cargarApuestas(partidoId, page, search) {
        if (!partidoId) return;
        setApCargando(true);
        setApError('');
        try {
            const data = await adminApuestas(token, { partido_id: partidoId, page, limit: 100, search });
            if (data?.success) {
                setApData(data);
                setApPage(page);
            } else {
                setApError(data?.error || 'Error cargando pronósticos');
            }
        } catch {
            setApError('Error de conexión');
        } finally {
            setApCargando(false);
        }
    }

    async function exportarTransacciones(formato) {
        setExportando(formato);
        try {
            const filas = listaFiltrada.map(t => ({
                Nombre: t.nombre,
                Correo: t.correo,
                Celular: t.celular,
                Valor: t.valorPagado,
                Estado: t.estado,
                Método: t.metodo,
                Fecha: new Date(t.fecha).toLocaleString('es-CO'),
            }));
            const nombre = 'Transacciones_Polla';
            if (formato === 'csv') exportarCSV(filas, nombre, Object.keys(filas[0]));
            if (formato === 'excel') await exportarExcel(filas, nombre, 'Transacciones');
            if (formato === 'pdf') await exportarPDF(
                Object.keys(filas[0]),
                filas.map(Object.values),
                nombre,
                'Transacciones — Polla Mundialista'
            );
        } finally {
            setExportando('');
        }
    }

    async function exportarApuestas(formato) {
        if (!apPartidoId) return;
        setExportando(formato);
        try {
            const data = await adminApuestasExport(token, apPartidoId);
            if (!data?.success) { setApError(data?.error || 'Error exportando'); return; }
            const p = data.partido;
            const nombre = `Pronosticos_${p.equipo_local}_vs_${p.equipo_visitante}`.replace(/\s+/g, '_');
            const filas = data.apuestas.map(a => ({
                Nombre:       a.nombre,
                Celular:      a.celular,
                Pronóstico:   `${a.predLocal} - ${a.predVisitante}`,
                'Fecha UTC':  a.createdAt ? new Date(a.createdAt).toISOString().replace('T', ' ').slice(0, 19) : '-',
                'Hora CO':    a.createdAt ? new Date(a.createdAt).toLocaleString('es-CO') : '-',
                Puntos:       a.puntos ?? '-',
            }));
            if (formato === 'csv') exportarCSV(filas, nombre, Object.keys(filas[0]));
            if (formato === 'excel') await exportarExcel(filas, nombre, 'Pronósticos');
            if (formato === 'pdf') await exportarPDF(
                Object.keys(filas[0]),
                filas.map(Object.values),
                nombre,
                `Pronósticos: ${p.equipo_local} vs ${p.equipo_visitante}`
            );
        } finally {
            setExportando('');
        }
    }

    async function cargarResumenDia(fecha) {
        setResumenDiaCargando(true);
        setResumenDiaError('');
        try {
            const data = await adminRedencionesResumen(token, fecha);
            if (data?.success) setResumenDia(data);
            else setResumenDiaError(data?.error || 'Error cargando el resumen del día');
        } catch {
            setResumenDiaError('Error de conexión');
        } finally {
            setResumenDiaCargando(false);
        }
    }

    async function generarReporteRedenciones() {
        if (!redFechaInicio || !redFechaFin) {
            setRedError('Selecciona fecha de inicio y fin.');
            return;
        }
        setRedCargando(true);
        setRedError('');
        setRedData(null);
        try {
            const data = await adminRedencionesExport(token, redFechaInicio, redFechaFin);
            if (data?.success) setRedData(data.redenciones);
            else setRedError(data?.error || 'Error generando el reporte');
        } catch {
            setRedError('Error de conexión');
        } finally {
            setRedCargando(false);
        }
    }

    async function exportarRedenciones(formato) {
        if (!redData || redData.length === 0) return;
        setExportando(formato);
        try {
            const filas = redData.map(r => ({
                Fecha: new Date(r.fechaHora).toLocaleDateString('es-CO'),
                Hora: new Date(r.fechaHora).toLocaleTimeString('es-CO'),
                Sede: r.sede,
                Cliente: r.nombre,
                Celular: r.celular,
                'Monto redimido': r.monto,
                'Saldo antes': r.saldoAntes,
                'Saldo después': r.saldoDespues,
                'Valor del bono': r.valorPagado,
                'Atendido por': r.atendidoPor,
                Token: r.tokenAcceso,
            }));
            const nombre = `Redenciones_${redFechaInicio}_a_${redFechaFin}`;
            if (formato === 'csv') exportarCSV(filas, nombre, Object.keys(filas[0]));
            if (formato === 'excel') await exportarExcel(filas, nombre, 'Redenciones');
            if (formato === 'pdf') await exportarPDF(
                Object.keys(filas[0]),
                filas.map(Object.values),
                nombre,
                `Redenciones de bonos: ${redFechaInicio} a ${redFechaFin}`
            );
        } finally {
            setExportando('');
        }
    }

    async function generarReporte() {
        if (!reporteFechaInicio || !reporteFechaFin) {
            setReporteError('Selecciona fecha de inicio y fin.');
            return;
        }
        setReporteCargando(true);
        setReporteError('');
        setReporteData(null);
        try {
            const data = await adminReportes(token, reporteFechaInicio, reporteFechaFin);
            if (data?.success) setReporteData(data);
            else setReporteError(data?.error || 'Error generando reporte');
        } catch {
            setReporteError('Error de conexión');
        } finally {
            setReporteCargando(false);
        }
    }

    if (!autenticado) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 px-6">
                <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-4">
                    <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white text-center mb-2">Panel Admin</h1>
                    {!loginPaso2fa ? (
                        <>
                            <input
                                type="text"
                                value={usuarioInput}
                                onChange={(e) => setUsuarioInput(e.target.value)}
                                placeholder="Usuario"
                                autoComplete="username"
                                className="w-full rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                            <input
                                type="password"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                placeholder="Contraseña"
                                autoComplete="current-password"
                                className="w-full rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                        </>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <div className="rounded-xl bg-amber-50 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-400/20 px-4 py-3 text-center">
                                <p className="text-2xl mb-1">🔐</p>
                                <p className="font-bold text-zinc-900 dark:text-white text-sm">Verificación en dos pasos</p>
                                <p className="text-zinc-500 text-xs mt-1">Abre Google Authenticator e ingresa el código de 6 dígitos</p>
                            </div>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={loginTotpCode}
                                onChange={(e) => setLoginTotpCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                autoFocus
                                className="w-full rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                            <button type="button" onClick={() => { setLoginPaso2fa(false); setLoginTotpCode(''); setError(''); }}
                                className="text-xs text-zinc-400 underline text-center">
                                ← Volver
                            </button>
                        </div>
                    )}
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full py-3 rounded-xl font-bold text-zinc-950 bg-gradient-to-r from-amber-400 to-orange-500 disabled:opacity-60"
                    >
                        {cargando ? 'Verificando...' : loginPaso2fa ? 'Verificar código' : 'Entrar'}
                    </button>
                </form>
            </div>
        );
    }

    const pendientes = transacciones.filter((t) => t.estado === 'PENDIENTE');
    const aprobadas = transacciones.filter((t) => t.estado === 'APROBADO');
    const ingresos = aprobadas.reduce((acc, t) => acc + t.valorPagado, 0);

    const listaFiltrada = transacciones
        .filter((t) => (filtro === 'TODAS' ? true : t.estado === filtro))
        .filter((t) => {
            if (!busqueda.trim()) return true;
            const q = busqueda.toLowerCase();
            return (
                t.nombre.toLowerCase().includes(q) ||
                t.correo.toLowerCase().includes(q) ||
                t.celular.toLowerCase().includes(q)
            );
        });

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 px-4 sm:px-6 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Panel Admin - Polla Mundialista</h1>
                    <button
                        onClick={() => { localStorage.removeItem(TOKEN_STORAGE_KEY); setToken(''); setAutenticado(false); }}
                        className="text-sm text-zinc-500 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-1.5 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-white/30 transition-colors"
                    >
                        Cerrar sesión
                    </button>
                </div>

                {/* Menú de secciones agrupado */}
                {(() => {
                    const DOT = {
                        amber:  'bg-amber-400',
                        blue:   'bg-blue-500',
                        purple: 'bg-purple-500',
                        green:  'bg-emerald-500',
                        red:    'bg-red-500',
                    };
                    const RING = {
                        amber:  'ring-amber-400',
                        blue:   'ring-blue-500',
                        purple: 'ring-purple-500',
                        green:  'ring-emerald-500',
                        red:    'ring-red-500',
                    };
                    const grupoActivo = GRUPOS_NAV.find((g) => g.secciones.some((s) => s.id === seccionActiva));
                    return (
                        <div className="mb-6">
                            <div className="flex items-stretch gap-1.5 flex-wrap">
                                {GRUPOS_NAV.map((grupo, gi) => {
                                    const esteGrupoActivo = grupoActivo?.id === grupo.id;
                                    return (
                                        <div key={grupo.id} className={`flex items-stretch gap-0 rounded-xl overflow-hidden border transition-all ${esteGrupoActivo ? `border-transparent ring-2 ${RING[grupo.color]}` : 'border-zinc-200 dark:border-white/10'}`}>
                                            {/* Etiqueta lateral del grupo */}
                                            {grupo.label && (
                                                <div className={`flex items-center justify-center px-2 ${DOT[grupo.color]} bg-opacity-15`} style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 leading-none whitespace-nowrap">
                                                        {grupo.label}
                                                    </span>
                                                </div>
                                            )}
                                            {/* Tabs del grupo */}
                                            <div className="flex items-stretch">
                                                {grupo.secciones.map((s, si) => {
                                                    const activa = seccionActiva === s.id;
                                                    return (
                                                        <button
                                                            key={s.id}
                                                            onClick={() => setSeccionActiva(s.id)}
                                                            className={`px-3 py-2 text-xs font-bold transition-colors whitespace-nowrap ${si > 0 ? 'border-l border-zinc-200 dark:border-white/10' : ''} ${
                                                                activa
                                                                    ? `bg-amber-400 text-zinc-950`
                                                                    : 'bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10'
                                                            }`}
                                                        >
                                                            {s.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })()}

                {/* ── Inicio ── */}
                {seccionActiva === 'inicio' && (
                <div className="space-y-10">

                    {/* ── Termómetro + KPIs + Recomendaciones ── */}
                    {(() => {
                        const META_MUNDIAL = 2_600_000_000;
                        const ing = metricasSimulador?.ingresosActuales || 0;
                        const pctMeta = Math.min(100, (ing / META_MUNDIAL) * 100);
                        const diasRestantes = metricasSimulador?.diasRestantes || 1;
                        const tasaRebote = metricasSimulador?.checkout?.tasaRebote || 0;

                        const diasTotales = Math.max(1, Math.round((new Date('2026-07-19') - new Date('2025-11-01')) / 86400000));
                        const diasTranscurridos = Math.max(1, diasTotales - diasRestantes);
                        const ingDiario = ing / diasTranscurridos;
                        const ingNecesario = (META_MUNDIAL - ing) / Math.max(1, diasRestantes);
                        const pctRitmo = ingNecesario > 0 ? Math.min(100, (ingDiario / ingNecesario) * 100) : (ing >= META_MUNDIAL ? 100 : 0);

                        const diasProyectados = ingDiario > 0 ? (META_MUNDIAL - ing) / ingDiario : Infinity;
                        const pctTrack = isFinite(diasProyectados) && diasProyectados > 0 ? Math.min(100, (diasRestantes / diasProyectados) * 100) : 0;
                        const pctConv = Math.min(100, (1 - tasaRebote) * 100);

                        const totalIngC = inicioCanales?.reduce((s, c) => s + c.ingresos, 0) || 0;
                        const canalesOrden = inicioCanales ? [...inicioCanales].sort((a, b) => b.ingresos - a.ingresos) : [];

                        const afiliadosActivos = afiliados?.filter(a => a.activo) || [];
                        const afiliadosConV = afiliadosActivos.filter(a => a.total_ventas > 0);
                        const pctAff = afiliadosActivos.length > 0 ? Math.round((afiliadosConV.length / afiliadosActivos.length) * 100) : 0;

                        const colorRitmo = pctRitmo >= 80 ? '#22C55E' : pctRitmo >= 50 ? '#EAB308' : '#DC2626';
                        const colorConv  = pctConv >= 60 ? '#22C55E' : pctConv >= 40 ? '#EAB308' : '#DC2626';
                        const colorTrack = pctTrack >= 80 ? '#22C55E' : pctTrack >= 50 ? '#EAB308' : '#DC2626';
                        const colorAff   = pctAff >= 60 ? '#22C55E' : pctAff >= 30 ? '#EAB308' : '#DC2626';
                        const colorTermo = pctMeta < 1.92 ? '#DC2626' : pctMeta < 3.85 ? '#EF4444' : pctMeta < 19.23 ? '#F97316' : pctMeta < 57.69 ? '#EAB308' : pctMeta < 76.92 ? '#84CC16' : '#22C55E';

                        const NOMBRES_CANAL = { paid_ads: '💰 Pauta digital', whatsapp: '📱 WhatsApp', influencer: '🎖️ Influencers', email: '📧 Email', organic_social: '📲 Redes orgánicas', direct: '🔗 Directo', referral: '👥 Referidos', friend: '🤝 Amigos', sms: '💬 SMS', organic_search: '🔍 Búsqueda', sin_clasificar: '❓ Sin clasificar' };
                        const fp = formatoPesos;

                        // Motor de recomendaciones
                        const recs = [];
                        if (pctRitmo < 50 && ing < META_MUNDIAL)
                            recs.push({ p: 5, ico: '🚨', titulo: 'Ritmo muy por debajo', desc: `Llevas ${fp(Math.round(ingDiario))}/día pero necesitas ${fp(Math.round(ingNecesario))}/día.`, accion: 'Activa una campaña de WhatsApp masiva HOY — es el canal más rápido.' });
                        else if (pctRitmo < 80 && ing < META_MUNDIAL)
                            recs.push({ p: 3, ico: '⚡', titulo: 'Ritmo bajo', desc: `Necesitas ${fp(Math.round(ingNecesario))}/día y llevas ${fp(Math.round(ingDiario))}/día.`, accion: 'Aumenta la frecuencia de campañas o activa más influencers.' });

                        if (tasaRebote > 0.7)
                            recs.push({ p: 5, ico: '🛒', titulo: `${Math.round(tasaRebote * 100)}% abandona el checkout`, desc: 'Más de 7 de cada 10 personas que entran al checkout se van sin pagar.', accion: 'Verifica que Wompi funcione correctamente y activa seguimiento por WhatsApp 30 min después del abandono.' });
                        else if (tasaRebote > 0.5)
                            recs.push({ p: 3, ico: '🛒', titulo: `${Math.round(tasaRebote * 100)}% abandona el checkout`, desc: 'Hay espacio para mejorar la conversión.', accion: 'Prueba activar un recordatorio por WhatsApp a quien abandona el checkout.' });

                        if (canalesOrden.length > 0) {
                            const top = canalesOrden[0];
                            const pctC = totalIngC > 0 ? Math.round((top.ingresos / totalIngC) * 100) : 0;
                            const nmC = NOMBRES_CANAL[top.canal] || top.canal;
                            if (top.canal === 'paid_ads')
                                recs.push({ p: 4, ico: '💰', titulo: `${nmC} lidera (${pctC}%)`, desc: `Genera ${fp(top.ingresos)} — tu canal más rentable.`, accion: 'Aumenta el presupuesto de pauta un 20-30% esta semana.' });
                            else if (top.canal === 'whatsapp')
                                recs.push({ p: 3, ico: '📱', titulo: `${nmC} lidera (${pctC}%)`, desc: `Tu canal estrella genera ${fp(top.ingresos)}.`, accion: 'Programa la próxima campaña para mañana entre 10am y 12pm.' });
                            else if (top.canal === 'influencer')
                                recs.push({ p: 3, ico: '🎖️', titulo: `${nmC} lideran (${pctC}%)`, desc: `Generan ${fp(top.ingresos)} — tu canal de mayor impacto hoy.`, accion: 'Activa 2-3 influencers nuevos esta semana.' });
                            else
                                recs.push({ p: 2, ico: '📊', titulo: `Canal top: ${nmC} (${pctC}%)`, desc: `Genera ${fp(top.ingresos)} en ingresos.`, accion: 'Refuerza este canal con más contenido o presupuesto.' });
                        }

                        if (afiliados?.length > 0) {
                            const sinV = afiliadosActivos.filter(a => a.total_ventas === 0);
                            if (sinV.length >= 3)
                                recs.push({ p: 3, ico: '👥', titulo: `${sinV.length} influencers sin ventas`, desc: 'Tienen el link activo pero no han convertido ningún cliente.', accion: 'Envíales un kit de contenido y recuérdales las fechas clave del torneo.' });
                            const altosClics = afiliadosActivos.filter(a => a.total_clics > 200 && a.total_ventas < 5);
                            if (altosClics.length > 0) {
                                const aff = altosClics[0];
                                recs.push({ p: 4, ico: '🔗', titulo: `${aff.nombre || 'Influencer'}: ${aff.total_clics} clics → ${aff.total_ventas} ventas`, desc: `Conversión del ${aff.total_clics > 0 ? Math.round((aff.total_ventas / aff.total_clics) * 100) : 0}%. Puede ser link roto o contenido que no convierte.`, accion: 'Verifica el link de afiliado y dale material de contenido nuevo.' });
                            }
                        }

                        if (recs.length === 0 && ing > 0)
                            recs.push({ p: 1, ico: '✅', titulo: '¡Todo en orden!', desc: 'No hay alertas críticas en este momento.', accion: 'Sigue monitoreando diariamente.' });
                        recs.sort((a, b) => b.p - a.p);

                        const BORDER_REC = { 5: 'border-red-400 bg-red-50 dark:bg-red-950/30', 4: 'border-orange-400 bg-orange-50 dark:bg-orange-950/30', 3: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30', 2: 'border-blue-300 bg-blue-50 dark:bg-blue-950/30', 1: 'border-green-400 bg-green-50 dark:bg-green-950/30' };

                        return (
                        <>
                        {/* Termómetro + KPIs */}
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">🎯 Meta 2026 — $2.600.000.000</h2>
                            <p className="text-xs text-zinc-400 mb-6">Ingresos acumulados vs objetivo total · Faltan <strong className="text-zinc-600 dark:text-zinc-300">{diasRestantes}</strong> días</p>

                            <div className="flex flex-col lg:flex-row gap-10">
                                {/* Termómetro */}
                                <div className="flex items-end gap-6 justify-center lg:justify-start flex-shrink-0">
                                    <div className="relative flex flex-col items-center">
                                        {/* Marcas de escala */}
                                        <div className="absolute right-full mr-2 inset-y-0 flex flex-col justify-between py-0.5 text-right pointer-events-none" style={{ height: 320 }}>
                                            {['$2.600MM', '$2.000MM', '$1.500MM', '$500MM', '$100MM', '$50MM', '$0'].map(l => (
                                                <span key={l} className="text-[9px] text-zinc-400 leading-none whitespace-nowrap">{l}</span>
                                            ))}
                                        </div>
                                        {/* Tubo */}
                                        <div className="relative w-12 rounded-full overflow-hidden border-2 border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800" style={{ height: 320 }}>
                                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #DC2626 0% 1.92%, #EF4444 1.92% 3.85%, #F97316 3.85% 19.23%, #EAB308 19.23% 57.69%, #84CC16 57.69% 76.92%, #22C55E 76.92% 100%)' }} />
                                            <div className="absolute top-0 left-0 right-0 bg-zinc-100 dark:bg-zinc-800 transition-all duration-[2000ms]" style={{ height: `${100 - pctMeta}%` }} />
                                            {pctMeta > 1 && <div className="absolute left-0 right-0 h-px bg-white/70" style={{ bottom: `${pctMeta}%` }} />}
                                        </div>
                                        {/* Bulbo */}
                                        <div className="w-8 h-8 rounded-full border-2 border-zinc-300 dark:border-zinc-600 mt-1 transition-colors duration-[2000ms]" style={{ background: colorTermo }} />
                                    </div>

                                    {/* Info junto al termómetro */}
                                    <div className="flex flex-col justify-end gap-4 pb-10">
                                        <div>
                                            <p className="text-3xl font-black transition-colors duration-[2000ms]" style={{ color: colorTermo }}>{pctMeta.toFixed(2)}%</p>
                                            <p className="text-xs text-zinc-400">completado</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-800 dark:text-white">{fp(ing)}</p>
                                            <p className="text-xs text-zinc-400">ingresos actuales</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-zinc-500">{fp(META_MUNDIAL - ing)}</p>
                                            <p className="text-xs text-zinc-400">faltante</p>
                                        </div>
                                        <div className="border-t border-zinc-200 dark:border-white/10 pt-3 space-y-1">
                                            <p className="text-xs text-zinc-500">Ritmo actual: <strong className="text-zinc-700 dark:text-zinc-200">{fp(Math.round(ingDiario))}/día</strong></p>
                                            <p className="text-xs text-zinc-500">Necesario: <strong className="text-zinc-700 dark:text-zinc-200">{fp(Math.round(ingNecesario))}/día</strong></p>
                                        </div>
                                    </div>
                                </div>

                                {/* KPIs + Canales */}
                                <div className="flex-1 space-y-5">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <GaugeKPI pct={pctRitmo} valor={`${Math.round(pctRitmo)}%`} label="Ritmo diario" nota={`${fp(Math.round(ingDiario))}/día`} color={colorRitmo} />
                                        <GaugeKPI pct={pctConv} valor={`${Math.round(pctConv)}%`} label="Conversión checkout" nota={`${Math.round(tasaRebote * 100)}% abandona`} color={colorConv} />
                                        <GaugeKPI pct={pctTrack} valor={`${Math.round(pctTrack)}%`} label="Proyección a meta" nota={isFinite(diasProyectados) ? `~${Math.round(diasProyectados)} días` : 'sin datos'} color={colorTrack} />
                                        <GaugeKPI pct={pctAff} valor={`${pctAff}%`} label="Influencers activos" nota={`${afiliadosConV.length}/${afiliadosActivos.length} con ventas`} color={colorAff} />
                                    </div>

                                    {canalesOrden.length > 0 && (
                                    <div className="bg-zinc-50 dark:bg-white/5 rounded-xl p-4 border border-zinc-200 dark:border-white/10">
                                        <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">Canales de adquisición</p>
                                        <div className="space-y-2.5">
                                            {canalesOrden.filter(c => c.ingresos > 0).slice(0, 6).map(c => {
                                                const pctC = totalIngC > 0 ? Math.round((c.ingresos / totalIngC) * 100) : 0;
                                                return (
                                                    <div key={c.canal}>
                                                        <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-300 mb-1">
                                                            <span>{NOMBRES_CANAL[c.canal] || c.canal}</span>
                                                            <span className="font-bold">{fp(c.ingresos)} <span className="text-zinc-400">({pctC}%)</span></span>
                                                        </div>
                                                        <div className="h-1.5 bg-zinc-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                            <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${pctC}%` }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {canalesOrden.every(c => c.ingresos === 0) && <p className="text-xs text-zinc-400">Sin ventas clasificadas aún</p>}
                                        </div>
                                    </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recomendaciones */}
                        {recs.length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">💡 Qué mejorar para llegar a la meta</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {recs.map((r, i) => (
                                    <div key={i} className={`rounded-xl p-4 border-l-4 ${BORDER_REC[r.p] || BORDER_REC[2]}`}>
                                        <p className="text-sm font-bold text-zinc-800 dark:text-white mb-1">{r.ico} {r.titulo}</p>
                                        <p className="text-xs text-zinc-600 dark:text-zinc-300 mb-2">{r.desc}</p>
                                        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">→ {r.accion}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        )}
                        </>
                        );
                    })()}

                    {/* Bolsa de Marketing */}
                    <div>
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">💰 Bolsa de Marketing</h2>
                        {mktCargando ? (
                            <p className="text-sm text-zinc-400">Cargando...</p>
                        ) : marketing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Resumen */}
                                <div className="bg-zinc-50 dark:bg-white/5 rounded-xl p-5 border border-zinc-200 dark:border-white/10 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-500 dark:text-zinc-400">Ingresos totales</span>
                                        <span className="font-bold text-zinc-800 dark:text-white">{formatoPesos(marketing.ingresosTotales)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm border-t border-zinc-200 dark:border-white/10 pt-3">
                                        <span className="text-zinc-500 dark:text-zinc-400">Bolsa 5% de ingresos</span>
                                        <span className="font-bold text-amber-500">{formatoPesos(marketing.bolsa)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-red-500 dark:text-red-400">
                                        <span>− Bonos influencers (automático)</span>
                                        <span className="font-semibold">{formatoPesos(marketing.bonosInfluencers)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-red-500 dark:text-red-400">
                                        <span>− Otros bonos (manual)</span>
                                        <span className="font-semibold">{formatoPesos(marketing.bonoManual)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-red-500 dark:text-red-400">
                                        <span>− Pauta publicitaria (manual)</span>
                                        <span className="font-semibold">{formatoPesos(marketing.pautaAds)}</span>
                                    </div>
                                    <div className={`flex justify-between text-base font-black border-t border-zinc-200 dark:border-white/10 pt-3 ${marketing.disponible >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        <span>= Disponible</span>
                                        <span>{formatoPesos(marketing.disponible)}</span>
                                    </div>
                                    {/* Barra de uso */}
                                    <div className="mt-2">
                                        <div className="h-2 bg-zinc-200 dark:bg-white/10 rounded-full overflow-hidden">
                                            {marketing.bolsa > 0 && (
                                                <div
                                                    className="h-full bg-red-500 rounded-full transition-all"
                                                    style={{ width: `${Math.min(100, ((marketing.bonosInfluencers + marketing.bonoManual + marketing.pautaAds) / marketing.bolsa) * 100).toFixed(1)}%` }}
                                                />
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-400 mt-1 text-right">
                                            {marketing.bolsa > 0 ? `${Math.min(100, Math.round(((marketing.bonosInfluencers + marketing.bonoManual + marketing.pautaAds) / marketing.bolsa) * 100))}% usado` : '0% usado'}
                                        </p>
                                    </div>
                                </div>

                                {/* Formulario + lista gastos manuales */}
                                <div className="space-y-4">
                                    <form onSubmit={handleAgregarGasto} className="bg-zinc-50 dark:bg-white/5 rounded-xl p-4 border border-zinc-200 dark:border-white/10 space-y-3">
                                        <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200">Registrar gasto manual</p>
                                        <select
                                            value={mktTipo}
                                            onChange={(e) => setMktTipo(e.target.value)}
                                            className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm"
                                        >
                                            <option value="pauta_ads">Pauta publicitaria</option>
                                            <option value="bono_manual">Otro bono manual</option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Descripción (ej. Meta Ads junio)"
                                            value={mktDesc}
                                            onChange={(e) => setMktDesc(e.target.value)}
                                            className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm"
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                placeholder="Monto $"
                                                value={mktMonto}
                                                onChange={(e) => setMktMonto(e.target.value)}
                                                min="1"
                                                className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm"
                                            />
                                            <input
                                                type="date"
                                                value={mktFecha}
                                                onChange={(e) => setMktFecha(e.target.value)}
                                                className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm"
                                            />
                                        </div>
                                        {mktError && <p className="text-xs text-red-500">{mktError}</p>}
                                        <button
                                            type="submit"
                                            disabled={mktGuardando}
                                            className="w-full py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 font-bold rounded-lg text-sm"
                                        >
                                            {mktGuardando ? 'Guardando...' : 'Agregar gasto'}
                                        </button>
                                    </form>

                                    {marketing.gastos.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Gastos registrados</p>
                                            {marketing.gastos.map((g) => (
                                                <div key={g.id} className="flex items-center gap-2 bg-zinc-50 dark:bg-white/5 rounded-lg px-3 py-2 border border-zinc-200 dark:border-white/10">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 truncate">{g.descripcion || (g.tipo === 'pauta_ads' ? 'Pauta' : 'Bono manual')}</p>
                                                        <p className="text-xs text-zinc-400">{g.fecha} · {formatoPesos(g.monto)}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleEliminarGasto(g.id)}
                                                        className="text-red-400 hover:text-red-600 text-xs flex-shrink-0"
                                                        title="Eliminar"
                                                    >✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-400">Sin datos de marketing</p>
                        )}
                    </div>

                    {/* Demografía de compradores */}
                    <div>
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">👥 Perfil del comprador</h2>
                        {demoCargando ? (
                            <p className="text-sm text-zinc-400">Cargando...</p>
                        ) : demograficos ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Género */}
                                <div className="bg-zinc-50 dark:bg-white/5 rounded-xl p-5 border border-zinc-200 dark:border-white/10">
                                    <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-3">Género</p>
                                    <p className="text-xs text-zinc-400 mb-4">
                                        {demograficos.totales.con_sexo} de {demograficos.totales.total_compradores} compradores con dato ({demograficos.totales.total_compradores > 0 ? Math.round((demograficos.totales.con_sexo / demograficos.totales.total_compradores) * 100) : 0}%)
                                    </p>
                                    {demograficos.genero.length === 0 ? (
                                        <p className="text-xs text-zinc-400">Sin datos aún</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {demograficos.genero.map((g) => {
                                                const total = demograficos.genero.reduce((s, x) => s + x.total, 0);
                                                const pct = total > 0 ? Math.round((g.total / total) * 100) : 0;
                                                const colores = { masculino: 'bg-blue-500', femenino: 'bg-pink-500', prefiero_no_decirlo: 'bg-zinc-400', sin_dato: 'bg-zinc-300' };
                                                const etiquetas = { masculino: 'Masculino', femenino: 'Femenino', prefiero_no_decirlo: 'No especificado', sin_dato: 'Sin dato' };
                                                return (
                                                    <div key={g.sexo}>
                                                        <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-300 mb-1">
                                                            <span>{etiquetas[g.sexo] || g.sexo}</span>
                                                            <span className="font-bold">{g.total} ({pct}%)</span>
                                                        </div>
                                                        <div className="h-2.5 bg-zinc-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${colores[g.sexo] || 'bg-zinc-500'}`} style={{ width: `${pct}%` }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Rangos de edad (Meta) */}
                                <div className="bg-zinc-50 dark:bg-white/5 rounded-xl p-5 border border-zinc-200 dark:border-white/10">
                                    <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-3">Rango de edad (Meta)</p>
                                    <p className="text-xs text-zinc-400 mb-4">
                                        {demograficos.totales.con_edad} de {demograficos.totales.total_compradores} compradores con dato ({demograficos.totales.total_compradores > 0 ? Math.round((demograficos.totales.con_edad / demograficos.totales.total_compradores) * 100) : 0}%)
                                    </p>
                                    {demograficos.edades.length === 0 ? (
                                        <p className="text-xs text-zinc-400">Sin datos aún</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {demograficos.edades.map((e) => {
                                                const maxEdad = Math.max(...demograficos.edades.map((x) => x.total));
                                                const pct = maxEdad > 0 ? Math.round((e.total / maxEdad) * 100) : 0;
                                                return (
                                                    <div key={e.rango}>
                                                        <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-300 mb-1">
                                                            <span className="font-mono">{e.rango}</span>
                                                            <span className="font-bold">{e.total}</span>
                                                        </div>
                                                        <div className="h-2.5 bg-zinc-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-400">Sin datos demográficos</p>
                        )}
                    </div>
                </div>
                )}

                {/* ── Pronósticos ── */}
                {seccionActiva === 'pronosticos' && (
                <div>
                    {/* Controles */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <select
                            value={apPartidoId}
                            onChange={e => { setApPartidoId(e.target.value); setApData(null); }}
                            className="flex-1 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                            <option value="">— Selecciona un partido —</option>
                            {partidos.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.equipo_local} vs {p.equipo_visitante} ({p.estado})
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            value={apBusqueda}
                            onChange={e => setApBusqueda(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && cargarApuestas(apPartidoId, 1, apBusqueda)}
                            placeholder="Buscar por nombre o celular..."
                            className="flex-1 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <button
                            onClick={() => cargarApuestas(apPartidoId, 1, apBusqueda)}
                            disabled={!apPartidoId || apCargando}
                            className="px-4 py-2 rounded-lg text-sm font-bold text-zinc-950 bg-gradient-to-r from-amber-400 to-orange-500 disabled:opacity-60"
                        >
                            {apCargando ? 'Cargando...' : 'Cargar'}
                        </button>
                    </div>

                    {apError && <p className="text-red-400 text-sm mb-3">{apError}</p>}

                    {apData && (
                    <>
                        {/* Métricas del partido */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                            <Metrica titulo="Total pronósticos" valor={apData.total} />
                            <Metrica titulo="Partido" valor={`${apData.partido.equipo_local} vs ${apData.partido.equipo_visitante}`} />
                            <Metrica titulo="Estado" valor={apData.partido.estado} />
                            <Metrica titulo="Resultado real" valor={
                                apData.partido.estado === 'cerrado'
                                    ? `${apData.partido.goles_local} - ${apData.partido.goles_visitante}`
                                    : 'En juego'
                            } />
                        </div>

                        {/* Resumen de marcadores apostados */}
                        {apData.resumen.length > 0 && (
                        <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4 mb-4">
                            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3">Marcadores más apostados</p>
                            <div className="flex flex-wrap gap-2">
                                {apData.resumen.map((r, i) => (
                                    <span key={i} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                        apData.partido.estado === 'cerrado' &&
                                        r.predLocal === apData.partido.goles_local &&
                                        r.predVisitante === apData.partido.goles_visitante
                                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                            : 'bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/10'
                                    }`}>
                                        {r.predLocal}-{r.predVisitante}
                                        <span className="opacity-60">×{r.cantidad}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                        )}

                        {/* Export buttons */}
                        <div className="flex gap-2 mb-3 flex-wrap items-center">
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">Exportar {apData.total} pronósticos:</span>
                            <BtnExport label="CSV" activo={exportando === 'csv'} onClick={() => exportarApuestas('csv')} color="green" />
                            <BtnExport label="Excel" activo={exportando === 'excel'} onClick={() => exportarApuestas('excel')} color="blue" />
                            <BtnExport label="PDF" activo={exportando === 'pdf'} onClick={() => exportarApuestas('pdf')} color="red" />
                        </div>

                        {/* Tabla paginada */}
                        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-white/10 mb-3">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400">
                                    <tr>
                                        <th className="px-4 py-3">#</th>
                                        <th className="px-4 py-3">Nombre</th>
                                        <th className="px-4 py-3">Celular</th>
                                        <th className="px-4 py-3">Pronóstico</th>
                                        <th className="px-4 py-3">Fecha/Hora (UTC)</th>
                                        <th className="px-4 py-3">Puntos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {apData.apuestas.map((a, idx) => {
                                        const rowNum = (apPage - 1) * 100 + idx + 1;
                                        return (
                                            <tr key={a.id} className="border-t border-zinc-100 dark:border-white/5 text-zinc-700 dark:text-zinc-200">
                                                <td className="px-4 py-2 text-zinc-400 text-xs">{rowNum}</td>
                                                <td className="px-4 py-2 font-medium">{a.nombre}</td>
                                                <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">{a.celular}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`font-bold ${
                                                        a.puntos === 3 ? 'text-green-500' :
                                                        a.puntos === 1 ? 'text-amber-400' :
                                                        a.puntos === 0 ? 'text-red-400' :
                                                        'text-zinc-700 dark:text-zinc-200'
                                                    }`}>
                                                        {a.predLocal} - {a.predVisitante}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                                                    {a.createdAt
                                                        ? new Date(a.createdAt).toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
                                                        : '—'}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {a.puntos === null ? (
                                                        <span className="text-zinc-400">—</span>
                                                    ) : (
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                            a.puntos === 3 ? 'bg-green-500/20 text-green-400' :
                                                            a.puntos === 1 ? 'bg-amber-500/20 text-amber-400' :
                                                            'bg-red-500/20 text-red-400'
                                                        }`}>{a.puntos} pts</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {apData.apuestas.length === 0 && (
                                        <tr><td colSpan={6} className="px-4 py-6 text-center text-zinc-400">Sin resultados.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        {apData.total > 100 && (() => {
                            const totalPags = Math.ceil(apData.total / 100);
                            return (
                                <div className="flex items-center gap-2 justify-center flex-wrap">
                                    <button
                                        onClick={() => cargarApuestas(apPartidoId, 1, apBusqueda)}
                                        disabled={apPage === 1 || apCargando}
                                        className="px-3 py-1 rounded-lg text-xs font-bold bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 disabled:opacity-40"
                                    >«</button>
                                    <button
                                        onClick={() => cargarApuestas(apPartidoId, apPage - 1, apBusqueda)}
                                        disabled={apPage === 1 || apCargando}
                                        className="px-3 py-1 rounded-lg text-xs font-bold bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 disabled:opacity-40"
                                    >‹</button>
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                        Página {apPage} de {totalPags} · {apData.total} pronósticos
                                    </span>
                                    <button
                                        onClick={() => cargarApuestas(apPartidoId, apPage + 1, apBusqueda)}
                                        disabled={apPage === totalPags || apCargando}
                                        className="px-3 py-1 rounded-lg text-xs font-bold bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 disabled:opacity-40"
                                    >›</button>
                                    <button
                                        onClick={() => cargarApuestas(apPartidoId, totalPags, apBusqueda)}
                                        disabled={apPage === totalPags || apCargando}
                                        className="px-3 py-1 rounded-lg text-xs font-bold bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 disabled:opacity-40"
                                    >»</button>
                                </div>
                            );
                        })()}
                    </>
                    )}

                    {!apData && !apCargando && apPartidoId && (
                        <p className="text-zinc-400 text-sm text-center py-8">Haz clic en "Cargar" para ver los pronósticos.</p>
                    )}
                    {!apPartidoId && (
                        <p className="text-zinc-400 text-sm text-center py-8">Selecciona un partido para ver los pronósticos.</p>
                    )}
                </div>
                )}

                {/* Simulador de ingresos (solo admin) */}
                {seccionActiva === 'simulador' && (
                <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4 mb-6">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Simulador de ingresos</h2>

                    {errorSimulador && <p className="text-red-400 text-sm">{errorSimulador}</p>}

                    {!metricasSimulador && !errorSimulador && (
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">Cargando datos del simulador...</p>
                    )}

                    {metricasSimulador && (() => {
                        const proyeccion = calcularProyeccion({
                            precio: precioSimulado,
                            clicsDiariosPromedio: metricasSimulador.clicsDiariosPromedio,
                            ingresosActuales: metricasSimulador.ingresosActuales,
                            diasRestantes: metricasSimulador.diasRestantes,
                        });
                        const fechaMetaTexto = new Date(`${FECHA_META}T00:00:00`).toLocaleDateString('es-CO', {
                            day: 'numeric', month: 'long', year: 'numeric',
                        });

                        return (
                            <>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                                    Meta: {formatoPesos(META_INGRESOS)} antes del {fechaMetaTexto} · Faltan {metricasSimulador.diasRestantes} días ·
                                    {' '}Ingresos actuales: {formatoPesos(metricasSimulador.ingresosActuales)} ·
                                    {' '}Clics ManyChat/día (prom.): {metricasSimulador.clicsDiariosPromedio.toFixed(1)} ·
                                    {' '}Tasa de rebote checkout (30 días): {(metricasSimulador.checkout.tasaRebote * 100).toFixed(1)}%
                                </p>

                                <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-2">
                                    Precio del bono a simular: <span className="font-bold text-amber-500 dark:text-amber-400">{formatoPesos(precioSimulado)}</span>
                                </label>
                                <input
                                    type="range"
                                    min={PRECIO_SIMULADOR_MIN}
                                    max={PRECIO_SIMULADOR_MAX}
                                    step={PRECIO_SIMULADOR_PASO}
                                    value={precioSimulado}
                                    onChange={(e) => setPrecioSimulado(Number(e.target.value))}
                                    className="w-full accent-amber-400 mb-4"
                                />

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                                    <Metrica titulo="Conversión estimada" valor={`${(proyeccion.tasaConversion * 100).toFixed(1)}%`} />
                                    <Metrica titulo="Compras/día estimadas" valor={proyeccion.conversionesDiarias.toFixed(1)} />
                                    <Metrica titulo="Ingreso diario estimado" valor={formatoPesos(Math.round(proyeccion.ingresoDiarioEstimado))} />
                                    <Metrica titulo="Proyección a la meta" valor={formatoPesos(Math.round(proyeccion.ingresoProyectadoTotal))} />
                                </div>

                                {proyeccion.cumpleMeta ? (
                                    <p className="text-green-400 text-sm font-bold">
                                        ✅ A {formatoPesos(precioSimulado)} y al ritmo actual de clics, se alcanzaría la meta de {formatoPesos(META_INGRESOS)} para el {fechaMetaTexto}.
                                    </p>
                                ) : (
                                    <p className="text-amber-500 dark:text-amber-400 text-sm font-bold">
                                        ⚠️ A {formatoPesos(precioSimulado)} faltarían {formatoPesos(Math.round(proyeccion.faltante))} para la meta. Ajusta el precio (más bajo = más conversión, más alto = más margen) y revisa el resultado.
                                    </p>
                                )}
                            </>
                        );
                    })()}
                </div>
                )}

                {/* Partidos: crear, editar y notificar recompra */}
                {seccionActiva === 'partidos' && (
                <>
                {/* Banner Bono Colombia */}
                {bonoColResult && (
                    <div className={`rounded-xl border p-4 mb-4 ${bonoColResult.desierto ? 'border-zinc-300 dark:border-white/10 bg-zinc-50 dark:bg-white/5' : 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'}`}>
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="font-bold text-zinc-900 dark:text-white mb-1">
                                    🇨🇴 Bono Colombia {bonoColResult.desierto ? '— Desierto' : '— ¡Ganadores!'}
                                </p>
                                {bonoColResult.desierto ? (
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">Nadie acertó el marcador exacto. El Bono Colombia queda desierto para este partido.</p>
                                ) : (
                                    <>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-1">
                                            ${bonoColResult.montoPorGanador.toLocaleString('es-CO')} COP c/u · Total distribuido: ${bonoColResult.totalDistribuido.toLocaleString('es-CO')} COP
                                        </p>
                                        <ul className="text-sm text-zinc-700 dark:text-zinc-200 space-y-0.5">
                                            {bonoColResult.ganadores.map((g) => (
                                                <li key={g.celular}>✅ {g.nombre} — {g.celular}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                            <button onClick={() => setBonoColResult(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white text-lg leading-none">×</button>
                        </div>
                    </div>
                )}
                <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4 mb-6">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">Crear partido</h2>
                    <form onSubmit={handleCrearPartido} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                        <input
                            type="text"
                            value={nuevoPartido.equipo_local}
                            onChange={(e) => setNuevoPartido((p) => ({ ...p, equipo_local: e.target.value }))}
                            placeholder="Equipo local"
                            className="rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <input
                            type="text"
                            value={nuevoPartido.equipo_visitante}
                            onChange={(e) => setNuevoPartido((p) => ({ ...p, equipo_visitante: e.target.value }))}
                            placeholder="Equipo visitante"
                            className="rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <input
                            type="datetime-local"
                            value={nuevoPartido.fecha_hora_inicio}
                            onChange={(e) => setNuevoPartido((p) => ({ ...p, fecha_hora_inicio: e.target.value }))}
                            className="rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <select
                            value={nuevoPartido.fase}
                            onChange={(e) => setNuevoPartido((p) => ({ ...p, fase: e.target.value }))}
                            className="rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                            <option value="grupos">Grupos (1 cupo)</option>
                            <option value="dieciseisavos">Dieciseisavos (1 cupo)</option>
                            <option value="octavos">Octavos (1 cupo)</option>
                            <option value="cuartos">Cuartos de Final (2 cupos)</option>
                            <option value="semifinal">Semifinal (2 cupos)</option>
                            <option value="final">Gran Final (4 cupos)</option>
                        </select>
                        <button
                            type="submit"
                            disabled={creandoPartido}
                            className="px-4 py-2 rounded-lg text-sm font-bold text-zinc-950 bg-gradient-to-r from-amber-400 to-orange-500 disabled:opacity-60"
                        >
                            {creandoPartido ? 'Creando...' : 'Crear partido'}
                        </button>
                    </form>
                    {errorPartido && <p className="text-red-400 text-sm mt-2">{errorPartido}</p>}

                    {partidos.length > 0 && (
                        <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 dark:border-white/10">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400">
                                    <tr>
                                        <th className="px-3 py-2">Partido</th>
                                        <th className="px-3 py-2">Fase</th>
                                        <th className="px-3 py-2">Fecha</th>
                                        <th className="px-3 py-2">Marcador</th>
                                        <th className="px-3 py-2">Estado</th>
                                        <th className="px-3 py-2">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {partidos.map((p) => {
                                        const editando = editandoPartido === p.id;
                                        return (
                                            <tr key={p.id} className="border-t border-zinc-100 dark:border-white/5 text-zinc-700 dark:text-zinc-200">
                                                <td className="px-3 py-2">{p.equipo_local} vs {p.equipo_visitante}</td>
                                                <td className="px-3 py-2">
                                                    {editando ? (
                                                        <select
                                                            value={edicionPartido.fase}
                                                            onChange={(e) => setEdicionPartido((ed) => ({ ...ed, fase: e.target.value }))}
                                                            className="rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-2 py-1 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                                                        >
                                                            <option value="grupos">Grupos</option>
                                                            <option value="dieciseisavos">Dieciseisavos</option>
                                                            <option value="octavos">Octavos</option>
                                                            <option value="cuartos">Cuartos</option>
                                                            <option value="semifinal">Semifinal</option>
                                                            <option value="final">Gran Final</option>
                                                        </select>
                                                    ) : (
                                                        p.fase || 'grupos'
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">
                                                    {editando ? (
                                                        <input
                                                            type="datetime-local"
                                                            value={edicionPartido.fecha_hora_inicio}
                                                            onChange={(e) => setEdicionPartido((ed) => ({ ...ed, fecha_hora_inicio: e.target.value }))}
                                                            className="rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-2 py-1 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                                                        />
                                                    ) : (
                                                        new Date(p.fecha_hora_inicio).toLocaleString('es-CO')
                                                    )}
                                                </td>
                                                <td className="px-3 py-2">
                                                    {editando ? (
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                type="number"
                                                                value={edicionPartido.goles_local}
                                                                onChange={(e) => setEdicionPartido((ed) => ({ ...ed, goles_local: e.target.value }))}
                                                                className="w-14 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-2 py-1 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                                                            />
                                                            <span>-</span>
                                                            <input
                                                                type="number"
                                                                value={edicionPartido.goles_visitante}
                                                                onChange={(e) => setEdicionPartido((ed) => ({ ...ed, goles_visitante: e.target.value }))}
                                                                className="w-14 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-2 py-1 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                                                            />
                                                        </div>
                                                    ) : (
                                                        `${p.goles_local ?? 0} - ${p.goles_visitante ?? 0}`
                                                    )}
                                                </td>
                                                <td className="px-3 py-2">
                                                    {editando ? (
                                                        <select
                                                            value={edicionPartido.estado}
                                                            onChange={(e) => setEdicionPartido((ed) => ({ ...ed, estado: e.target.value }))}
                                                            className="rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-2 py-1 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                                                        >
                                                            <option value="activo">activo</option>
                                                            <option value="cerrado">cerrado</option>
                                                        </select>
                                                    ) : (
                                                        p.estado
                                                    )}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="flex gap-2 flex-wrap">
                                                        {editando ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleGuardarPartido(p.id)}
                                                                    disabled={guardandoPartido}
                                                                    className="px-3 py-1 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                                                                >
                                                                    Guardar
                                                                </button>
                                                                <button
                                                                    onClick={handleCancelarEdicionPartido}
                                                                    className="px-3 py-1 rounded-lg text-xs font-bold bg-zinc-200 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-white/20"
                                                                >
                                                                    Cancelar
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => handleEditarPartido(p)}
                                                                    className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 text-zinc-950 hover:bg-amber-400"
                                                                >
                                                                    Editar
                                                                </button>
                                                                <button
                                                                    onClick={() => handleEliminarPartido(p.id)}
                                                                    className="px-3 py-1 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700"
                                                                >
                                                                    Eliminar
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Notificar recompra */}
                <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4 mb-6">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">Notificar recompra para el siguiente partido</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-3">
                        Envía un correo a quienes compraron bono para el partido de origen, invitándolos a comprar
                        su bono para el partido de destino.
                    </p>
                    <form onSubmit={handleNotificarRecompra} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <select
                            value={recompra.origen}
                            onChange={(e) => setRecompra((r) => ({ ...r, origen: e.target.value }))}
                            className="rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                            <option value="">Partido de origen</option>
                            {partidos.map((p) => (
                                <option key={p.id} value={p.id}>{p.equipo_local} vs {p.equipo_visitante}</option>
                            ))}
                        </select>
                        <select
                            value={recompra.destino}
                            onChange={(e) => setRecompra((r) => ({ ...r, destino: e.target.value }))}
                            className="rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                            <option value="">Partido de destino</option>
                            {partidos.map((p) => (
                                <option key={p.id} value={p.id}>{p.equipo_local} vs {p.equipo_visitante}</option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            disabled={enviandoRecompra}
                            className="px-4 py-2 rounded-lg text-sm font-bold text-zinc-950 bg-gradient-to-r from-amber-400 to-orange-500 disabled:opacity-60"
                        >
                            {enviandoRecompra ? 'Enviando...' : 'Notificar'}
                        </button>
                    </form>
                    {resultadoRecompra && <p className="text-zinc-600 dark:text-zinc-300 text-sm mt-2">{resultadoRecompra}</p>}
                </div>
                </>
                )}

                {/* Usuarios registrados */}
                {seccionActiva === 'usuarios' && (
                <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4 mb-6">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">👥 Usuarios Registrados</h2>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">{usuariosFiltrados().length} / {usuarios.length}</span>
                            <button onClick={cargarUsuarios} disabled={usuariosCargando} className="text-xs px-3 py-1.5 rounded-lg bg-amber-400 text-zinc-950 font-bold disabled:opacity-50">
                                {usuariosCargando ? 'Cargando...' : '↻ Actualizar'}
                            </button>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                            <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">Desde</label>
                            <input type="date" value={usuariosFechaInicio} onChange={(e) => setUsuariosFechaInicio(e.target.value)}
                                className="w-full rounded-lg bg-white dark:bg-slate-900/60 border border-zinc-200 dark:border-white/10 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400" />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">Hasta</label>
                            <input type="date" value={usuariosFechaFin} onChange={(e) => setUsuariosFechaFin(e.target.value)}
                                className="w-full rounded-lg bg-white dark:bg-slate-900/60 border border-zinc-200 dark:border-white/10 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400" />
                        </div>
                    </div>
                    <input type="text" placeholder="Buscar por nombre, correo o celular..."
                        value={usuariosBusqueda} onChange={(e) => setUsuariosBusqueda(e.target.value)}
                        className="w-full mb-3 rounded-lg bg-white dark:bg-slate-900/60 border border-zinc-200 dark:border-white/10 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />

                    {/* Botones de exportación */}
                    <div className="flex gap-2 mb-3 flex-wrap">
                        <button onClick={exportarUsuariosCSV} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700">
                            ⬇ CSV
                        </button>
                        <button onClick={exportarUsuariosExcel} className="text-xs px-3 py-1.5 rounded-lg bg-green-700 text-white font-bold hover:bg-green-800">
                            ⬇ Excel
                        </button>
                        <button onClick={exportarUsuariosPDF} className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700">
                            ⬇ PDF
                        </button>
                        {(usuariosFechaInicio || usuariosFechaFin || usuariosBusqueda) && (
                            <button onClick={() => { setUsuariosFechaInicio(''); setUsuariosFechaFin(''); setUsuariosBusqueda(''); }}
                                className="text-xs px-3 py-1.5 rounded-lg bg-zinc-300 dark:bg-zinc-700 text-zinc-800 dark:text-white font-bold">
                                ✕ Limpiar filtros
                            </button>
                        )}
                    </div>

                    {usuariosCargando ? (
                        <p className="text-zinc-400 text-sm text-center py-4">Cargando usuarios...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead>
                                    <tr className="text-zinc-400 dark:text-zinc-500 border-b border-zinc-200 dark:border-white/10">
                                        <th className="pb-2 pr-3 font-semibold">Nombre</th>
                                        <th className="pb-2 pr-3 font-semibold">Celular</th>
                                        <th className="pb-2 pr-3 font-semibold">Correo</th>
                                        <th className="pb-2 pr-3 font-semibold text-center">Compras</th>
                                        <th className="pb-2 pr-3 font-semibold text-right">Total pagado</th>
                                        <th className="pb-2 pr-3 font-semibold">Registro</th>
                                        <th className="pb-2 font-semibold"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuariosFiltrados().map((u) => (
                                        <tr key={u.id} className="border-b border-zinc-100 dark:border-white/5 hover:bg-zinc-100 dark:hover:bg-white/5">
                                            <td className="py-2 pr-3 font-medium text-zinc-900 dark:text-white">{u.nombre}</td>
                                            <td className="py-2 pr-3 text-zinc-600 dark:text-zinc-300">{u.celular}</td>
                                            <td className="py-2 pr-3 text-zinc-500 dark:text-zinc-400 max-w-[140px] truncate">{u.correo}</td>
                                            <td className="py-2 pr-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full font-bold ${Number(u.compras_aprobadas) > 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-zinc-100 dark:bg-white/5 text-zinc-400'}`}>
                                                    {u.compras_aprobadas}
                                                </span>
                                            </td>
                                            <td className="py-2 pr-3 text-right text-zinc-900 dark:text-white font-medium">
                                                {Number(u.total_pagado) > 0 ? '$' + Number(u.total_pagado).toLocaleString('es-CO') : '—'}
                                            </td>
                                            <td className="py-2 pr-3 text-zinc-400 whitespace-nowrap">
                                                {new Date(u.fecha_registro).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: '2-digit' })}
                                            </td>
                                            <td className="py-2">
                                                {Number(u.compras_aprobadas) === 0 && (
                                                    <button
                                                        onClick={() => handleEliminarUsuario(u)}
                                                        className="text-red-500 hover:text-red-600 font-bold text-xs"
                                                        title="Borrar cuenta (sin compras aprobadas)"
                                                    >
                                                        🗑 Borrar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {usuariosFiltrados().length === 0 && (
                                <p className="text-zinc-400 text-sm text-center py-4">No hay usuarios que coincidan.</p>
                            )}
                        </div>
                    )}
                </div>
                )}

                {/* Ranking global + ganadores */}
                {seccionActiva === 'ranking' && (
                <div className="flex flex-col gap-6">
                    <div className="rounded-xl border border-amber-400/40 bg-amber-50/50 dark:bg-amber-900/10 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">🥇 Podio final del torneo</h2>
                            <button onClick={cargarRankingFinal} disabled={cargandoRankingFinal}
                                className="text-xs px-3 py-1 rounded-lg bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300 disabled:opacity-60">
                                {cargandoRankingFinal ? 'Calculando...' : 'Calcular ganadores finales'}
                            </button>
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-3">
                            Solo lectura: calcula el podio aplicando los 3 criterios de desempate (puntaje total → puntaje en la
                            Gran Final → exactos en Semifinales). Si un grupo empatado tiene más de 10 personas, sortea 10
                            ganadores entre ellos. No envía mensajes ni modifica nada — revisa el resultado y notifica manualmente
                            con el botón "🏆 Copiar mensaje de ganador" en la pestaña Usuarios.
                        </p>

                        {!rankingFinal && !cargandoRankingFinal && (
                            <p className="text-zinc-400 text-sm">Pulsa "Calcular ganadores finales" para ver el resultado.</p>
                        )}

                        {rankingFinal && (
                            <div className="flex flex-col gap-3">
                                {rankingFinal.podio.length === 0 && (
                                    <p className="text-zinc-400 text-sm">Todavía no hay participantes con puntos para calcular el podio.</p>
                                )}
                                {rankingFinal.podio.map((bloque, i) => (
                                    <div key={i} className="rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="font-bold text-zinc-900 dark:text-white text-sm">
                                                Puesto {bloque.puestos} — ${bloque.premio_total.toLocaleString('es-CO')}
                                            </p>
                                            {bloque.empatados > 1 && (
                                                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                                                    {bloque.empatados} empatados{bloque.sorteo_realizado ? ' · sorteo realizado' : ''}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-400 mb-2">
                                            ${bloque.monto_por_ganador.toLocaleString('es-CO')} por ganador
                                            {bloque.sorteo_realizado ? ` (10 de ${bloque.empatados} sorteados)` : ''}
                                        </p>
                                        <ul className="flex flex-col gap-0.5 text-sm">
                                            {bloque.ganadores.map((g) => (
                                                <li key={g.id} className="text-zinc-700 dark:text-zinc-200">
                                                    <span className="font-semibold">{g.nombre}</span> — {g.puntos_total} pts
                                                    {' · '}📱 {g.celular || '—'} · ✉️ {g.correo || '—'}
                                                </li>
                                            ))}
                                        </ul>
                                        {bloque.no_sorteados.length > 0 && (
                                            <p className="text-[11px] text-zinc-400 mt-2">
                                                No sorteados: {bloque.no_sorteados.map((u) => u.nombre).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">🏆 Top 100 — Ranking global de puntos</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-zinc-400">Se actualiza solo cada minuto</span>
                                <button onClick={cargarRankingGlobal} disabled={cargandoRanking}
                                    className="text-xs px-3 py-1 rounded-lg bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300 disabled:opacity-60">
                                    {cargandoRanking ? 'Cargando...' : 'Actualizar'}
                                </button>
                            </div>
                        </div>

                        {rankingGlobal.length === 0 && !cargandoRanking && (
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Todavía no hay puntos registrados.</p>
                        )}

                        {rankingGlobal.length > 0 && (
                            <div className="overflow-x-auto max-h-[70vh]">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 sticky top-0">
                                        <tr>
                                            <th className="px-3 py-2">#</th>
                                            <th className="px-3 py-2">Nombre</th>
                                            <th className="px-3 py-2">Puntos</th>
                                            <th className="px-3 py-2">Exactos</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                                        {rankingGlobal.map((u) => (
                                            <Fragment key={u.id}>
                                                <tr
                                                    onClick={() => setRankingExpandidoId(rankingExpandidoId === u.id ? null : u.id)}
                                                    className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-white/5"
                                                >
                                                    <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">{u.posicion}</td>
                                                    <td className="px-3 py-2 font-semibold text-zinc-900 dark:text-white">{u.nombre}</td>
                                                    <td className="px-3 py-2 font-bold text-amber-600 dark:text-amber-400">{u.puntos}</td>
                                                    <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">{u.exactos}</td>
                                                </tr>
                                                {rankingExpandidoId === u.id && (
                                                    <tr className="bg-zinc-100/60 dark:bg-white/[0.03]">
                                                        <td colSpan={4} className="px-3 py-3">
                                                            <div className="flex flex-col gap-2">
                                                                <p className="text-zinc-700 dark:text-zinc-200">
                                                                    📱 <span className="font-semibold">{u.celular || '—'}</span>
                                                                    {' · '}
                                                                    ✉️ <span className="font-semibold">{u.correo || '—'}</span>
                                                                </p>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); copiarMensaje(u, 'ganador'); }}
                                                                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700"
                                                                    >
                                                                        {mensajeCopiado === `${u.id}-ganador` ? '✓ Copiado' : '🏆 Copiar mensaje de ganador'}
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); copiarMensaje(u, 'top100'); }}
                                                                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 text-zinc-950 hover:bg-amber-300"
                                                                    >
                                                                        {mensajeCopiado === `${u.id}-top100` ? '✓ Copiado' : '⚽ Copiar mensaje motivacional'}
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleMarcarTest(u); }}
                                                                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-300 dark:bg-white/10 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-400 dark:hover:bg-white/20"
                                                                    >
                                                                        🚫 Marcar como prueba (quitar del ranking)
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">🇨🇴 Ganadores Bono Colombia</h2>
                        {bonosCol.length === 0 ? (
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">No hay ganadores del Bono Colombia registrados aún.</p>
                        ) : (
                            <ul className="flex flex-col gap-1 text-sm">
                                {bonosCol.map((b) => (
                                    <li key={b.id} className="text-zinc-700 dark:text-zinc-200">
                                        <span className="font-semibold">{b.nombre}</span> — {b.equipo_local} {b.goles_local}-{b.goles_visitante} {b.equipo_visitante} —{' '}
                                        <span className="font-bold text-amber-600 dark:text-amber-400">${Number(b.monto_cop).toLocaleString('es-CO')}</span>
                                        {b.reclamado ? ' (reclamado)' : ''}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <p className="text-[11px] text-zinc-400 mt-2">Ve a la pestaña "🇨🇴 Bono Col" para marcar reclamados.</p>
                    </div>

                    <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">⚡ Ganadores Sorteos Flash</h2>
                            <button onClick={cargarFlashGanadores} disabled={cargandoFlash}
                                className="text-xs px-3 py-1 rounded-lg bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300 disabled:opacity-60">
                                {cargandoFlash ? 'Cargando...' : 'Actualizar'}
                            </button>
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-3">
                            Premios físicos (camisetas, gafas, gorras, balones) a discreción de la empresa. 1 solo ganador por
                            partido: el primero, por hora de registro, que acertó el marcador exacto.
                        </p>

                        {flashGanadores.length === 0 && !cargandoFlash && (
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Aún no hay pronósticos flash registrados.</p>
                        )}

                        <div className="flex flex-col gap-3">
                            {flashGanadores.map((p) => (
                                <div key={p.partido_id} className="rounded-lg border border-zinc-200 dark:border-white/10 p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="font-semibold text-zinc-900 dark:text-white text-sm">
                                            {p.equipo_local} {p.goles_local ?? '?'}-{p.goles_visitante ?? '?'} {p.equipo_visitante}
                                        </p>
                                        <span className="text-[11px] text-zinc-400">{p.estado === 'cerrado' ? 'Cerrado' : 'En curso'}</span>
                                    </div>

                                    {p.goles_local === null && (
                                        <p className="text-xs text-zinc-400">Aún sin marcador final — el ganador se calcula al cerrar el partido.</p>
                                    )}

                                    {p.goles_local !== null && !p.ganador && (
                                        <p className="text-xs text-zinc-400">Nadie acertó el marcador exacto en esta promoción.</p>
                                    )}

                                    {p.ganador && (
                                        <p className="text-sm mb-2">
                                            🏆 <span className="font-bold text-amber-600 dark:text-amber-400">{p.ganador.nombre}</span>
                                            {' · '}📱 {p.ganador.celular}
                                            {' · '}{new Date(p.ganador.created_at).toLocaleString('es-CO')}
                                        </p>
                                    )}

                                    <details className="text-xs">
                                        <summary className="cursor-pointer text-zinc-400">Ver los {p.pronosticos.length} pronósticos</summary>
                                        <ul className="mt-1 flex flex-col gap-0.5">
                                            {p.pronosticos.map((pr) => (
                                                <li key={pr.pronostico_id} className={pr.es_ganador ? 'font-bold text-amber-600 dark:text-amber-400' : 'text-zinc-500 dark:text-zinc-400'}>
                                                    {pr.es_ganador ? '🏆 ' : ''}{pr.nombre} — {pr.pred_local}-{pr.pred_visitante} — {new Date(pr.created_at).toLocaleString('es-CO')}
                                                </li>
                                            ))}
                                        </ul>
                                    </details>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                )}

                {/* Bono Colombia */}
                {seccionActiva === 'bonoscolombia' && (
                <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">🇨🇴 Ganadores Bono Colombia</h2>
                        <button onClick={cargarBonosColombia} disabled={cargandoBonosCol}
                            className="text-xs px-3 py-1 rounded-lg bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300 disabled:opacity-60">
                            {cargandoBonosCol ? 'Cargando...' : 'Actualizar'}
                        </button>
                    </div>

                    {bonosCol.length === 0 && !cargandoBonosCol && (
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">No hay ganadores del Bono Colombia registrados aún.</p>
                    )}

                    {bonosCol.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400">
                                    <tr>
                                        <th className="px-3 py-2">Partido</th>
                                        <th className="px-3 py-2">Ganador</th>
                                        <th className="px-3 py-2">Celular</th>
                                        <th className="px-3 py-2">Correo</th>
                                        <th className="px-3 py-2">Monto</th>
                                        <th className="px-3 py-2">Fecha</th>
                                        <th className="px-3 py-2">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                                    {bonosCol.map((b) => (
                                        <tr key={b.id} className={b.reclamado ? 'opacity-50' : ''}>
                                            <td className="px-3 py-2 text-zinc-700 dark:text-zinc-200 whitespace-nowrap">
                                                {b.equipo_local} {b.goles_local}-{b.goles_visitante} {b.equipo_visitante}
                                            </td>
                                            <td className="px-3 py-2 font-semibold text-zinc-900 dark:text-white">{b.nombre}</td>
                                            <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300">{b.celular}</td>
                                            <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">{b.correo}</td>
                                            <td className="px-3 py-2 font-bold text-amber-600 dark:text-amber-400">
                                                ${Number(b.monto_cop).toLocaleString('es-CO')}
                                            </td>
                                            <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                                                {new Date(b.created_at).toLocaleDateString('es-CO')}
                                            </td>
                                            <td className="px-3 py-2">
                                                {b.reclamado ? (
                                                    <span className="text-green-600 dark:text-green-400 font-semibold">✓ Reclamado</span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleReclamarBono(b.id)}
                                                        disabled={reclamandoId === b.id}
                                                        className="px-2 py-1 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                                                    >
                                                        {reclamandoId === b.id ? '...' : 'Marcar reclamado'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Diagnóstico WhatsApp */}
                    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-white/10">
                        <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-2">📲 Prueba de conexión WhatsApp</h3>
                        <form onSubmit={handleTestWhatsapp} className="flex gap-2">
                            <input
                                type="tel"
                                value={testWaCelular}
                                onChange={(e) => setTestWaCelular(e.target.value)}
                                placeholder="Ej: 3001234567"
                                className="flex-1 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                            />
                            <button type="submit" disabled={testWaEnviando}
                                className="px-4 py-2 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 whitespace-nowrap">
                                {testWaEnviando ? 'Enviando...' : 'Enviar prueba'}
                            </button>
                        </form>
                        {testWaResult && (
                            <div className={`mt-2 rounded-lg p-3 text-xs ${testWaResult.success ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>
                                <p className="font-bold mb-1">{testWaResult.success ? '✅ Enviado correctamente' : '❌ Error'}</p>
                                {testWaResult.celularFormateado && <p>Número formateado: <strong>{testWaResult.celularFormateado}</strong></p>}
                                {testWaResult.subscriberId && <p>Subscriber ID ManyChat: <strong>{testWaResult.subscriberId}</strong></p>}
                                {testWaResult.error && <p>Error: {testWaResult.error}</p>}
                                {testWaResult.detalles && <pre className="mt-1 overflow-x-auto text-xs opacity-70">{JSON.stringify(testWaResult.detalles, null, 2)}</pre>}
                            </div>
                        )}
                    </div>
                </div>
                )}

                {/* Influenciadores / Creadores de contenido */}
                {seccionActiva === 'influenciadores' && (
                <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4 mb-6">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">🎖️ Influenciadores / Creadores de contenido</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">
                        Crea Bonos Especiales para que prueben la app y le muestren a sus seguidores cómo participar.
                        Reciben cupos para predecir y un bono REAL de servicios (válido en tienda), pero quedan excluidos
                        del ranking de premios y del Bono Colombia.
                    </p>

                    {/* Solicitudes públicas de /influencers, pendientes de Bono Especial */}
                    <div className="rounded-xl border border-amber-300/50 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-900/10 p-4 mb-6">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">📋 Solicitudes de registro (link público)</h3>
                            <button onClick={cargarRegistrosInfluencer} disabled={cargandoRegistrosInfluencer}
                                className="text-xs px-3 py-1 rounded-lg bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300 disabled:opacity-60">
                                {cargandoRegistrosInfluencer ? 'Cargando...' : 'Actualizar'}
                            </button>
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-300 text-xs mb-3">
                            Envíales este link para que se registren solos: <strong>{window.location.origin}/influencers</strong>
                        </p>

                        {registrosInfluencer.length === 0 && !cargandoRegistrosInfluencer && (
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Aún no hay registros.</p>
                        )}

                        {registrosInfluencer.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-white/60 dark:bg-white/5 text-zinc-500 dark:text-zinc-400">
                                        <tr>
                                            <th className="px-3 py-2">Nombre</th>
                                            <th className="px-3 py-2">Correo</th>
                                            <th className="px-3 py-2">Celular</th>
                                            <th className="px-3 py-2">Red</th>
                                            <th className="px-3 py-2">Fecha</th>
                                            <th className="px-3 py-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-amber-200/40 dark:divide-white/5">
                                        {registrosInfluencer.map((r) => (
                                            <tr key={r.id} className={r.atendido ? 'opacity-50' : ''}>
                                                <td className="px-3 py-2 font-semibold text-zinc-900 dark:text-white">{r.nombre}</td>
                                                <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300">{r.correo}</td>
                                                <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300">{r.celular}</td>
                                                <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300 capitalize">
                                                    {r.red_contenido === 'instagram' ? '📸 Instagram' : r.red_contenido === 'tiktok' ? '🎵 TikTok' : '📸🎵 Ambas'}
                                                </td>
                                                <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{new Date(r.fecha_registro).toLocaleDateString('es-CO')}</td>
                                                <td className="px-3 py-2 flex gap-1.5">
                                                    {r.tiene_foto && (
                                                        <button
                                                            onClick={() => handleVerFotoRegistro(r.id)}
                                                            className="px-2 py-1 rounded-lg text-xs font-bold bg-zinc-700 text-white hover:bg-zinc-600 whitespace-nowrap"
                                                        >
                                                            🖼️ Ver foto
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleUsarDatosRegistro(r)}
                                                        className="px-2 py-1 rounded-lg text-xs font-bold bg-amber-400 text-zinc-950 hover:bg-amber-300 whitespace-nowrap"
                                                    >
                                                        Usar estos datos
                                                    </button>
                                                    <button
                                                        onClick={() => handleMarcarRegistroInfluencer(r.id, !r.atendido)}
                                                        disabled={marcandoRegistroId === r.id}
                                                        className="px-2 py-1 rounded-lg text-xs font-bold bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-white/20 disabled:opacity-60 whitespace-nowrap"
                                                    >
                                                        {r.atendido ? '↩️ Pendiente' : '✅ Atendido'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <form id="form-bono-especial" onSubmit={handleCrearEspeciales} className="mb-5">
                        <div className="flex flex-wrap gap-3 mb-3">
                            <label className="text-xs text-zinc-600 dark:text-zinc-300">
                                Valor del bono (COP)
                                <input
                                    type="number"
                                    value={valorBonoEspecial}
                                    onChange={(e) => setValorBonoEspecial(e.target.value)}
                                    className="block mt-1 w-36 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white text-sm"
                                />
                            </label>
                            <label className="text-xs text-zinc-600 dark:text-zinc-300">
                                Intentos (cupos)
                                <input
                                    type="number"
                                    value={intentosEspecial}
                                    onChange={(e) => setIntentosEspecial(e.target.value)}
                                    className="block mt-1 w-28 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white text-sm"
                                />
                            </label>
                        </div>

                        <div className="flex flex-col gap-2 mb-3">
                            {filasInfluencers.map((fila, idx) => (
                                <div key={idx} className="flex flex-wrap gap-2 items-center">
                                    <input
                                        type="text"
                                        placeholder="Nombre completo"
                                        value={fila.nombre}
                                        onChange={(e) => handleCambiarFilaInfluencer(idx, 'nombre', e.target.value)}
                                        className="flex-1 min-w-[140px] rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white text-sm"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Celular (WhatsApp)"
                                        value={fila.celular}
                                        onChange={(e) => handleCambiarFilaInfluencer(idx, 'celular', e.target.value)}
                                        className="flex-1 min-w-[140px] rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white text-sm"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Correo (opcional)"
                                        value={fila.correo}
                                        onChange={(e) => handleCambiarFilaInfluencer(idx, 'correo', e.target.value)}
                                        className="flex-1 min-w-[140px] rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white text-sm"
                                    />
                                    {filasInfluencers.length > 1 && (
                                        <button type="button" onClick={() => handleQuitarFilaInfluencer(idx)} className="text-red-500 text-xs font-bold px-2">✕</button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <button type="button" onClick={handleAgregarFilaInfluencer} className="text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-white/10 text-zinc-600 dark:text-zinc-300 font-bold">
                                + Agregar otro
                            </button>
                            <button type="submit" disabled={creandoEspeciales} className="text-xs px-4 py-2 rounded-lg bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300 disabled:opacity-60">
                                {creandoEspeciales ? 'Creando...' : `Crear Bono Especial ($${Number(valorBonoEspecial).toLocaleString('es-CO')} + ${intentosEspecial} intentos)`}
                            </button>
                        </div>
                    </form>

                    {resultadoEspeciales && (
                        <div className={`mb-4 rounded-lg p-3 text-xs ${resultadoEspeciales.success ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>
                            {resultadoEspeciales.success ? (
                                <ul className="list-disc pl-4">
                                    {resultadoEspeciales.resultados?.map((r, i) => (
                                        <li key={i} className="mb-1">
                                            {r.nombre}: {r.error ? `❌ ${r.error}` : '✅ creado'}
                                            {r.correoEnviado === false && ' (correo falló)'}
                                            {r.whatsappEnviado === false && ' (WhatsApp falló)'}
                                            {r.errorCorreo && <div className="pl-4 opacity-70">↳ correo: {r.errorCorreo}</div>}
                                            {r.errorWhatsapp && <div className="pl-4 opacity-70">↳ WhatsApp: {typeof r.errorWhatsapp === 'string' ? r.errorWhatsapp : JSON.stringify(r.errorWhatsapp)}</div>}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>❌ {resultadoEspeciales.error}</p>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-3 pt-3 border-t border-zinc-200 dark:border-white/10">
                        <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">Influenciadores ya creados</h3>
                        <button onClick={cargarEspeciales} disabled={cargandoEspeciales}
                            className="text-xs px-3 py-1 rounded-lg bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300 disabled:opacity-60">
                            {cargandoEspeciales ? 'Cargando...' : 'Actualizar'}
                        </button>
                    </div>

                    {especiales.length === 0 && !cargandoEspeciales && (
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">Aún no has creado ningún Bono Especial.</p>
                    )}

                    {especiales.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400">
                                    <tr>
                                        <th className="px-3 py-2">Nombre</th>
                                        <th className="px-3 py-2">Celular</th>
                                        <th className="px-3 py-2">Bono</th>
                                        <th className="px-3 py-2">Cupos</th>
                                        <th className="px-3 py-2">Creado</th>
                                        <th className="px-3 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                                    {especiales.map((e) => (
                                        <tr key={e.transaccion_id}>
                                            <td className="px-3 py-2 font-semibold text-zinc-900 dark:text-white">{e.nombre}</td>
                                            <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300">{e.celular}</td>
                                            <td className="px-3 py-2 font-bold text-amber-600 dark:text-amber-400">${Number(e.saldo_bono).toLocaleString('es-CO')}</td>
                                            <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300">{e.intentos_usados}/{e.intentos_totales}</td>
                                            <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{new Date(e.fecha_creacion).toLocaleDateString('es-CO')}</td>
                                            <td className="px-3 py-2">
                                                <div className="flex flex-wrap gap-1.5 mb-1.5">
                                                    <a
                                                        href={`${API_BASE}/api/polla/bono/${e.token_acceso}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-2 py-1 rounded-lg text-xs font-bold bg-amber-400 text-zinc-950 hover:bg-amber-300 whitespace-nowrap"
                                                    >
                                                        🖼️ Descargar bono
                                                    </a>
                                                    <button
                                                        onClick={() => handleInvitar(e.transaccion_id)}
                                                        disabled={invitandoId === e.transaccion_id}
                                                        className="px-2 py-1 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 whitespace-nowrap"
                                                    >
                                                        {invitandoId === e.transaccion_id ? 'Enviando...' : '📲 Enviar invitación'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleReenviarBono(e.transaccion_id)}
                                                        disabled={reenviadoBonoId === e.transaccion_id}
                                                        className="px-2 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 whitespace-nowrap"
                                                    >
                                                        {reenviadoBonoId === e.transaccion_id ? 'Enviando...' : '🎫 Reenviar bono WA'}
                                                    </button>
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    {e.whatsapp_bono_at && (
                                                        <span className="text-xs text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                                            🎫 Bono: {new Date(e.whatsapp_bono_at).toLocaleString('es-CO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    )}
                                                    {erroresPorFila[e.transaccion_id]?.bono && (
                                                        <span className="text-xs text-red-600 dark:text-red-400 whitespace-nowrap">
                                                            ❌ Bono: {erroresPorFila[e.transaccion_id].bono}
                                                        </span>
                                                    )}
                                                    {e.whatsapp_invitacion_at && (
                                                        <span className="text-xs text-green-600 dark:text-green-400 whitespace-nowrap">
                                                            📲 Invitación: {new Date(e.whatsapp_invitacion_at).toLocaleString('es-CO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    )}
                                                    {erroresPorFila[e.transaccion_id]?.invitacion && (
                                                        <span className="text-xs text-red-600 dark:text-red-400 whitespace-nowrap">
                                                            ❌ Invitación: {erroresPorFila[e.transaccion_id].invitacion}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {resultadoInvitar && (
                        <div className={`mt-3 rounded-lg p-3 text-xs ${resultadoInvitar.success ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>
                            {resultadoInvitar.success ? '✅ Invitación enviada correctamente' : `❌ ${resultadoInvitar.error}`}
                        </div>
                    )}
                    {resultadoReenviarBono && (
                        <div className={`mt-2 rounded-lg p-3 text-xs ${resultadoReenviarBono.success ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>
                            {resultadoReenviarBono.success ? '✅ Bono reenviado por WhatsApp correctamente' : `❌ ${resultadoReenviarBono.error}`}
                        </div>
                    )}

                    {/* Ranking solo entre influenciadores */}
                    <div className="flex items-center justify-between mb-3 mt-6 pt-4 border-t border-zinc-200 dark:border-white/10">
                        <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">🏆 Ranking entre influenciadores</h3>
                        <button onClick={cargarRankingEspeciales} disabled={cargandoRankingEspeciales}
                            className="text-xs px-3 py-1 rounded-lg bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300 disabled:opacity-60">
                            {cargandoRankingEspeciales ? 'Cargando...' : 'Actualizar'}
                        </button>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-3">
                        Solo compiten entre ellos, no afecta el ranking de premios real.
                    </p>

                    {rankingEspeciales.length === 0 && !cargandoRankingEspeciales && (
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">Ningún influenciador ha registrado pronósticos aún.</p>
                    )}

                    {rankingEspeciales.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400">
                                    <tr>
                                        <th className="px-3 py-2">#</th>
                                        <th className="px-3 py-2">Nombre</th>
                                        <th className="px-3 py-2">Celular</th>
                                        <th className="px-3 py-2">Puntos</th>
                                        <th className="px-3 py-2">Exactos</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                                    {rankingEspeciales.map((r) => (
                                        <tr key={r.id}>
                                            <td className="px-3 py-2 font-black text-zinc-900 dark:text-white">
                                                {r.posicion === 1 ? '🥇' : r.posicion === 2 ? '🥈' : r.posicion === 3 ? '🥉' : r.posicion}
                                            </td>
                                            <td className="px-3 py-2 font-semibold text-zinc-900 dark:text-white">{r.nombre}</td>
                                            <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300">{r.celular}</td>
                                            <td className="px-3 py-2 font-bold text-amber-600 dark:text-amber-400">{r.puntos}</td>
                                            <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300">{r.exactos}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Programa de afiliados: clics, ventas atribuidas y comisión */}
                    <div className="flex items-center justify-between mb-3 mt-6 pt-4 border-t border-zinc-200 dark:border-white/10">
                        <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">💰 Programa de afiliados</h3>
                        <button onClick={cargarAfiliados} disabled={cargandoAfiliados}
                            className="text-xs px-3 py-1 rounded-lg bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300 disabled:opacity-60">
                            {cargandoAfiliados ? 'Cargando...' : 'Actualizar'}
                        </button>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-3">
                        Cada influencer con Bono Especial tiene su propio código de afiliado (distinto de su link de sesión).
                        % de comisión editable por persona.
                    </p>

                    {afiliados.length === 0 && !cargandoAfiliados && (
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">Aún no hay afiliados (se crean automáticamente al hacerles un Bono Especial).</p>
                    )}

                    {afiliados.length > 0 && (
                        <div className="overflow-x-auto mb-6">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400">
                                    <tr>
                                        <th className="px-3 py-2">Nombre</th>
                                        <th className="px-3 py-2">Código</th>
                                        <th className="px-3 py-2">%</th>
                                        <th className="px-3 py-2">Clics</th>
                                        <th className="px-3 py-2">Ventas</th>
                                        <th className="px-3 py-2">Comisión generada</th>
                                        <th className="px-3 py-2">Pendiente</th>
                                        <th className="px-3 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                                    {afiliados.map((a) => (
                                        <tr key={a.id} className={!a.activo ? 'opacity-50' : ''}>
                                            <td className="px-3 py-2 font-semibold text-zinc-900 dark:text-white">{a.nombre}</td>
                                            <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300 font-mono">{a.codigo_afiliado}</td>
                                            <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300">{Number(a.porcentaje_comision)}%</td>
                                            <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300">{a.total_clics}</td>
                                            <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300">{a.total_ventas}</td>
                                            <td className="px-3 py-2 font-bold text-amber-600 dark:text-amber-400">${Number(a.comision_generada).toLocaleString('es-CO')}</td>
                                            <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300">${Number(a.comision_pendiente).toLocaleString('es-CO')}</td>
                                            <td className="px-3 py-2 flex gap-1.5">
                                                <button
                                                    onClick={() => handleEditarPorcentaje(a.id, Number(a.porcentaje_comision))}
                                                    className="px-2 py-1 rounded-lg text-xs font-bold bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-white/20 whitespace-nowrap"
                                                >
                                                    Editar %
                                                </button>
                                                <button
                                                    onClick={() => handleToggleAfiliadoActivo(a.id, !a.activo)}
                                                    className="px-2 py-1 rounded-lg text-xs font-bold bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-white/20 whitespace-nowrap"
                                                >
                                                    {a.activo ? 'Desactivar' : 'Activar'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Comisiones individuales (cada venta atribuida) */}
                    <div className="flex items-center justify-between mb-3 pt-3 border-t border-zinc-200 dark:border-white/10">
                        <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">Comisiones por venta</h3>
                        <button onClick={cargarComisiones} disabled={cargandoComisiones}
                            className="text-xs px-3 py-1 rounded-lg bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300 disabled:opacity-60">
                            {cargandoComisiones ? 'Cargando...' : 'Actualizar'}
                        </button>
                    </div>

                    {comisiones.length === 0 && !cargandoComisiones && (
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">Aún no hay comisiones generadas.</p>
                    )}

                    {comisiones.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400">
                                    <tr>
                                        <th className="px-3 py-2">Afiliado</th>
                                        <th className="px-3 py-2">Venta</th>
                                        <th className="px-3 py-2">Comisión</th>
                                        <th className="px-3 py-2">Estado</th>
                                        <th className="px-3 py-2">Fecha</th>
                                        <th className="px-3 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                                    {comisiones.map((c) => (
                                        <tr key={c.id}>
                                            <td className="px-3 py-2 font-semibold text-zinc-900 dark:text-white">{c.influencer_nombre}</td>
                                            <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300">${Number(c.monto_venta).toLocaleString('es-CO')}</td>
                                            <td className="px-3 py-2 font-bold text-amber-600 dark:text-amber-400">${Number(c.monto_comision).toLocaleString('es-CO')} ({Number(c.porcentaje)}%)</td>
                                            <td className="px-3 py-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    c.estado === 'PAGADA' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : c.estado === 'ANULADA' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                }`}>
                                                    {c.estado}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{new Date(c.creado_en).toLocaleDateString('es-CO')}</td>
                                            <td className="px-3 py-2 flex gap-1.5">
                                                {c.estado !== 'PAGADA' && (
                                                    <button
                                                        onClick={() => handleActualizarComision(c.id, 'PAGADA')}
                                                        disabled={actualizandoComisionId === c.id}
                                                        className="px-2 py-1 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 whitespace-nowrap"
                                                    >
                                                        Marcar pagada
                                                    </button>
                                                )}
                                                {c.estado !== 'ANULADA' && (
                                                    <button
                                                        onClick={() => handleActualizarComision(c.id, 'ANULADA')}
                                                        disabled={actualizandoComisionId === c.id}
                                                        className="px-2 py-1 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 whitespace-nowrap"
                                                    >
                                                        Anular
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                )}

                {/* Locales QR */}
                {seccionActiva === 'localesqr' && (
                <div className="flex flex-col gap-5">
                    {/* Crear nueva cuenta */}
                    <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4">
                        <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-3">Nueva cuenta Admin QR</h2>
                        <form onSubmit={handleCrearLocal} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                                required
                                placeholder="Usuario (sin espacios)"
                                value={nuevoLocal.usuario}
                                onChange={e => setNuevoLocal(p => ({ ...p, usuario: e.target.value.replace(/\s/g, '') }))}
                                className="rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400"
                            />
                            <input
                                required
                                type="password"
                                placeholder="Contraseña inicial"
                                value={nuevoLocal.password}
                                onChange={e => setNuevoLocal(p => ({ ...p, password: e.target.value }))}
                                className="rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400"
                            />
                            <input
                                placeholder="Nombre del local (ej. Sede Norte)"
                                value={nuevoLocal.nombre_local}
                                onChange={e => setNuevoLocal(p => ({ ...p, nombre_local: e.target.value }))}
                                className="rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400"
                            />
                            <input
                                type="email"
                                placeholder="Correo (para recuperar contraseña)"
                                value={nuevoLocal.correo}
                                onChange={e => setNuevoLocal(p => ({ ...p, correo: e.target.value }))}
                                className="rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400"
                            />
                            {errorLocal && <p className="sm:col-span-2 text-red-500 text-sm">{errorLocal}</p>}
                            <button
                                type="submit"
                                disabled={creandoLocal}
                                className="sm:col-span-2 py-2.5 rounded-lg font-bold text-sm text-zinc-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-60"
                            >
                                {creandoLocal ? 'Creando...' : '+ Crear cuenta'}
                            </button>
                        </form>
                    </div>

                    {/* Tabla de usuarios existentes */}
                    <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-base font-bold text-zinc-900 dark:text-white">Cuentas registradas</h2>
                            <button onClick={cargarLocalesQR} disabled={cargandoLocales}
                                className="text-xs text-zinc-500 border border-zinc-300 dark:border-white/10 rounded px-2 py-1 hover:text-zinc-900 dark:hover:text-white">
                                {cargandoLocales ? 'Cargando...' : 'Actualizar'}
                            </button>
                        </div>
                        {localesQR.length === 0 ? (
                            <p className="text-zinc-400 text-sm">{cargandoLocales ? 'Cargando...' : 'No hay cuentas creadas aún.'}</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {localesQR.map(u => (
                                    <div key={u.id} className={`rounded-lg border p-3 ${u.activo ? 'border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5' : 'border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-white/2 opacity-60'}`}>
                                        <div className="flex items-start justify-between gap-2 flex-wrap">
                                            <div>
                                                <p className="font-bold text-zinc-900 dark:text-white text-sm">{u.usuario}
                                                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold ${u.activo ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-zinc-200 dark:bg-white/10 text-zinc-500'}`}>
                                                        {u.activo ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </p>
                                                {u.nombre_local && <p className="text-zinc-500 text-xs mt-0.5">{u.nombre_local}</p>}
                                                {u.correo && <p className="text-zinc-400 text-xs">{u.correo}</p>}
                                                <p className="text-zinc-400 text-xs mt-0.5">Creado: {new Date(u.fecha_creacion).toLocaleDateString('es-CO')}</p>
                                            </div>
                                            <div className="flex gap-2 flex-wrap">
                                                <button
                                                    onClick={() => handleResetLocalPass(u.id)}
                                                    className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-amber-100 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-400/20"
                                                >
                                                    Resetear contraseña
                                                </button>
                                                <button
                                                    onClick={() => handleToggleLocal(u.id)}
                                                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${u.activo ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200' : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-200'}`}
                                                >
                                                    {u.activo ? 'Desactivar' : 'Activar'}
                                                </button>
                                            </div>
                                        </div>
                                        {tempPassVisible[u.id] && (
                                            <div className="mt-2 rounded-lg bg-amber-50 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-400/20 px-3 py-2 flex items-center justify-between gap-2">
                                                <div>
                                                    <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">Contraseña temporal (cópiala ya, no se mostrará de nuevo):</p>
                                                    <p className="font-mono font-black text-amber-900 dark:text-amber-300 text-lg tracking-widest">{tempPassVisible[u.id]}</p>
                                                </div>
                                                <button onClick={() => setTempPassVisible(p => ({ ...p, [u.id]: undefined }))}
                                                    className="text-zinc-400 text-xs underline">Cerrar</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                )}

                {/* Redenciones de bonos por sede */}
                {seccionActiva === 'redenciones' && (
                <div className="flex flex-col gap-5">
                    {/* Cierre del día */}
                    <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4">
                        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                            <h2 className="text-base font-bold text-zinc-900 dark:text-white">🧾 Cierre del día por sede</h2>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={resumenDiaFecha}
                                    onChange={(e) => { setResumenDiaFecha(e.target.value); cargarResumenDia(e.target.value); }}
                                    className="rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                />
                                <button
                                    onClick={() => cargarResumenDia(resumenDiaFecha)}
                                    disabled={resumenDiaCargando}
                                    className="text-xs text-zinc-500 border border-zinc-300 dark:border-white/10 rounded px-2 py-2 hover:text-zinc-900 dark:hover:text-white disabled:opacity-60"
                                >
                                    {resumenDiaCargando ? 'Cargando...' : 'Actualizar'}
                                </button>
                            </div>
                        </div>
                        {resumenDiaError && <p className="text-red-400 text-sm mb-2">{resumenDiaError}</p>}
                        {resumenDia && (
                            resumenDia.porSede.length === 0 ? (
                                <p className="text-zinc-400 text-sm">No hubo canjes ese día.</p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {resumenDia.porSede.map((s) => (
                                        <div key={s.sede} className="rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 p-3">
                                            <p className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase tracking-wide">{s.sede}</p>
                                            <p className="text-zinc-900 dark:text-white font-black text-lg">{formatoPesos(s.total)}</p>
                                            <p className="text-zinc-400 text-xs">{s.cantidad} {s.cantidad === 1 ? 'canje' : 'canjes'}</p>
                                        </div>
                                    ))}
                                    <div className="rounded-lg bg-amber-50 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-400/20 p-3">
                                        <p className="text-amber-700 dark:text-amber-400 text-[10px] uppercase tracking-wide font-bold">Total del día</p>
                                        <p className="text-zinc-900 dark:text-white font-black text-lg">{formatoPesos(resumenDia.totalGeneral)}</p>
                                        <p className="text-zinc-400 text-xs">{resumenDia.cantidadGeneral} canjes</p>
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    {/* Auditoría por rango de fechas */}
                    <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4">
                        <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-3">📅 Auditoría de canjes por período</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-3">
                            Lista detallada de bonos canjeados (cliente, monto, sede y quién atendió) para comparar contra los servicios reclamados en cada sede.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 items-end flex-wrap">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-zinc-500 dark:text-zinc-400">Desde</label>
                                <input
                                    type="date"
                                    value={redFechaInicio}
                                    onChange={(e) => { setRedFechaInicio(e.target.value); setRedData(null); }}
                                    className="rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-zinc-500 dark:text-zinc-400">Hasta</label>
                                <input
                                    type="date"
                                    value={redFechaFin}
                                    onChange={(e) => { setRedFechaFin(e.target.value); setRedData(null); }}
                                    className="rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                                />
                            </div>
                            <button
                                onClick={generarReporteRedenciones}
                                disabled={redCargando || !redFechaInicio || !redFechaFin}
                                className="px-4 py-2 rounded-lg text-sm font-bold text-zinc-950 bg-gradient-to-r from-amber-400 to-orange-500 disabled:opacity-60"
                            >
                                {redCargando ? 'Generando...' : 'Generar reporte'}
                            </button>
                        </div>
                        {redError && <p className="text-red-400 text-sm mt-2">{redError}</p>}

                        {redData && (
                            <div className="mt-4">
                                {redData.length > 0 ? (
                                    <>
                                        <div className="flex gap-2 mb-3 flex-wrap">
                                            <span className="text-xs text-zinc-500 dark:text-zinc-400 self-center">Exportar {redData.length} registros:</span>
                                            <BtnExport label="CSV" activo={exportando === 'csv'} onClick={() => exportarRedenciones('csv')} color="green" />
                                            <BtnExport label="Excel" activo={exportando === 'excel'} onClick={() => exportarRedenciones('excel')} color="blue" />
                                            <BtnExport label="PDF" activo={exportando === 'pdf'} onClick={() => exportarRedenciones('pdf')} color="red" />
                                        </div>
                                        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-white/10">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400">
                                                    <tr>
                                                        <th className="px-3 py-2">Fecha / Hora</th>
                                                        <th className="px-3 py-2">Sede</th>
                                                        <th className="px-3 py-2">Cliente</th>
                                                        <th className="px-3 py-2">Monto</th>
                                                        <th className="px-3 py-2">Saldo después</th>
                                                        <th className="px-3 py-2">Atendido por</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                                                    {redData.map((r, i) => (
                                                        <tr key={i} className="text-zinc-700 dark:text-zinc-200">
                                                            <td className="px-3 py-2 text-xs whitespace-nowrap">{new Date(r.fechaHora).toLocaleString('es-CO')}</td>
                                                            <td className="px-3 py-2 font-semibold text-amber-600 dark:text-amber-400">{r.sede}</td>
                                                            <td className="px-3 py-2">
                                                                <div className="font-medium">{r.nombre}</div>
                                                                <div className="text-zinc-500 dark:text-zinc-400 text-xs">{r.celular}</div>
                                                            </td>
                                                            <td className="px-3 py-2 font-bold">{formatoPesos(r.monto)}</td>
                                                            <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">{formatoPesos(r.saldoDespues)}</td>
                                                            <td className="px-3 py-2 text-xs text-zinc-400">{r.atendidoPor}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-zinc-400 text-sm text-center py-3">No hay canjes en este período.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                )}

                {/* Seguridad — 2FA */}
                {seccionActiva === 'seguridad' && (
                <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-5 max-w-md">
                    <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-1">🔐 Verificación en dos pasos (2FA)</h2>
                    <p className="text-zinc-500 text-sm mb-4">Protege tu cuenta con Google Authenticator. Cada inicio de sesión requerirá un código de 6 dígitos generado por la app.</p>

                    <div className={`rounded-lg px-3 py-2 mb-4 text-sm font-semibold ${totp2faEnabled ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-zinc-100 dark:bg-white/5 text-zinc-500'}`}>
                        {totp2faEnabled ? '✅ 2FA activo en tu cuenta' : '⚪ 2FA desactivado'}
                    </div>

                    {!totp2faEnabled ? (
                        <div className="flex flex-col gap-3">
                            {!totp2faQr ? (
                                <button onClick={handle2faSetup}
                                    className="py-2.5 rounded-lg font-bold text-sm text-zinc-950 bg-amber-400 hover:bg-amber-300">
                                    Generar QR para activar 2FA
                                </button>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm">1. Escanea el QR con <strong>Google Authenticator</strong></p>
                                    <img src={totp2faQr} alt="QR 2FA" className="w-48 h-48 self-center rounded-xl border border-zinc-200 dark:border-white/10" />
                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm">2. Ingresa el código que muestra la app para confirmar:</p>
                                    <form onSubmit={handle2faConfirmar} className="flex gap-2">
                                        <input
                                            type="text" inputMode="numeric" maxLength={6}
                                            value={totp2faCode}
                                            onChange={e => setTotp2faCode(e.target.value.replace(/\D/g, ''))}
                                            placeholder="000000"
                                            className="flex-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white text-center font-mono text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-400"
                                        />
                                        <button type="submit"
                                            className="px-4 py-2 rounded-lg font-bold text-sm text-zinc-950 bg-amber-400 hover:bg-amber-300">
                                            Activar
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handle2faDesactivar} className="flex flex-col gap-3">
                            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Para desactivar 2FA, ingresa un código válido de Google Authenticator:</p>
                            <div className="flex gap-2">
                                <input
                                    type="text" inputMode="numeric" maxLength={6}
                                    value={totp2faCode}
                                    onChange={e => setTotp2faCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="000000"
                                    className="flex-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white text-center font-mono text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-400"
                                />
                                <button type="submit"
                                    className="px-4 py-2 rounded-lg font-bold text-sm text-white bg-red-600 hover:bg-red-500">
                                    Desactivar
                                </button>
                            </div>
                        </form>
                    )}

                    {totp2faMsg && (
                        <p className={`mt-3 text-sm font-medium ${totp2faMsg.startsWith('✅') ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                            {totp2faMsg}
                        </p>
                    )}
                </div>
                )}

                {/* Transacciones */}
                {seccionActiva === 'transacciones' && (
                <>
                {/* Métricas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <Metrica titulo="🎟️ Bonos vendidos" valor={aprobadas.length} />
                    <Metrica titulo="💰 Ingresos por bonos" valor={formatoPesos(ingresos)} />
                    <Metrica titulo="Pendientes" valor={pendientes.length} />
                    <Metrica titulo="Total transacciones" valor={transacciones.length} />
                </div>

                {/* Reporte por rango de fechas */}
                <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4 mb-6">
                    <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-3">📅 Reporte por período</h2>
                    <div className="flex flex-col sm:flex-row gap-3 items-end flex-wrap">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-zinc-500 dark:text-zinc-400">Desde</label>
                            <input
                                type="date"
                                value={reporteFechaInicio}
                                onChange={e => { setReporteFechaInicio(e.target.value); setReporteData(null); }}
                                className="rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-zinc-500 dark:text-zinc-400">Hasta</label>
                            <input
                                type="date"
                                value={reporteFechaFin}
                                onChange={e => { setReporteFechaFin(e.target.value); setReporteData(null); }}
                                className="rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                            />
                        </div>
                        <button
                            onClick={generarReporte}
                            disabled={reporteCargando || !reporteFechaInicio || !reporteFechaFin}
                            className="px-4 py-2 rounded-lg text-sm font-bold text-zinc-950 bg-gradient-to-r from-amber-400 to-orange-500 disabled:opacity-60"
                        >
                            {reporteCargando ? 'Generando...' : 'Generar reporte'}
                        </button>
                    </div>
                    {reporteError && <p className="text-red-400 text-sm mt-2">{reporteError}</p>}

                    {reporteData && (
                        <div className="mt-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                <Metrica titulo="Total" valor={reporteData.resumen.total} />
                                <Metrica titulo="Aprobadas" valor={reporteData.resumen.aprobadas} />
                                <Metrica titulo="Pendientes" valor={reporteData.resumen.pendientes} />
                                <Metrica titulo="Ingresos período" valor={formatoPesos(reporteData.resumen.ingresos)} />
                            </div>
                            {reporteData.transacciones.length > 0 ? (
                                <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-white/10">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400">
                                            <tr>
                                                <th className="px-3 py-2">Cliente</th>
                                                <th className="px-3 py-2">Contacto</th>
                                                <th className="px-3 py-2">Valor</th>
                                                <th className="px-3 py-2">Método</th>
                                                <th className="px-3 py-2">Estado</th>
                                                <th className="px-3 py-2">Fecha</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                                            {reporteData.transacciones.map(t => (
                                                <tr key={t.id} className="text-zinc-700 dark:text-zinc-200">
                                                    <td className="px-3 py-2 font-medium">{t.nombre}</td>
                                                    <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400 text-xs">
                                                        {t.correo && <div>{t.correo}</div>}
                                                        <div>{t.celular}</div>
                                                    </td>
                                                    <td className="px-3 py-2 font-bold text-amber-600 dark:text-amber-400">
                                                        {formatoPesos(t.valorPagado)}
                                                    </td>
                                                    <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400 capitalize">{t.metodo}</td>
                                                    <td className="px-3 py-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                            t.estado === 'APROBADO'  ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                                                            t.estado === 'PENDIENTE' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                                                            'bg-red-500/20 text-red-500'
                                                        }`}>{t.estado}</span>
                                                    </td>
                                                    <td className="px-3 py-2 text-xs text-zinc-400 whitespace-nowrap">
                                                        {new Date(t.fecha).toLocaleString('es-CO')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-zinc-400 text-sm text-center py-3">No hay transacciones en este período.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Pestañas y buscador */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="flex gap-2">
                        {['TODAS', 'PENDIENTE', 'APROBADO', 'RECHAZADO'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFiltro(f)}
                                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                    filtro === f ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-white/10'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar por nombre, correo o celular..."
                        className="flex-1 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-4 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <button
                        onClick={() => cargarDatos(token)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-white/10"
                    >
                        Refrescar
                    </button>
                </div>

                {/* Botones export transacciones */}
                {listaFiltrada.length > 0 && (
                    <div className="flex gap-2 mb-4 flex-wrap">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 self-center">Exportar {listaFiltrada.length} registros:</span>
                        <BtnExport label="CSV" activo={exportando === 'csv'} onClick={() => exportarTransacciones('csv')} color="green" />
                        <BtnExport label="Excel" activo={exportando === 'excel'} onClick={() => exportarTransacciones('excel')} color="blue" />
                        <BtnExport label="PDF" activo={exportando === 'pdf'} onClick={() => exportarTransacciones('pdf')} color="red" />
                    </div>
                )}

                {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

                {/* Tabla */}
                <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-white/10">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400">
                            <tr>
                                <th className="px-4 py-3">Cliente</th>
                                <th className="px-4 py-3">Contacto</th>
                                <th className="px-4 py-3">Valor</th>
                                <th className="px-4 py-3">Método</th>
                                <th className="px-4 py-3">Estado</th>
                                <th className="px-4 py-3">Fecha</th>
                                <th className="px-4 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listaFiltrada.map((t) => (
                                <tr key={t.id} className="border-t border-zinc-100 dark:border-white/5 text-zinc-700 dark:text-zinc-200">
                                    <td className="px-4 py-3">{t.nombre}</td>
                                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                                        {t.correo}<br />{t.celular}
                                    </td>
                                    <td className="px-4 py-3">{formatoPesos(t.valorPagado)}</td>
                                    <td className="px-4 py-3">{t.metodo}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            t.estado === 'APROBADO' ? 'bg-green-500/20 text-green-400' :
                                            t.estado === 'RECHAZADO' ? 'bg-red-500/20 text-red-400' :
                                            'bg-amber-500/20 text-amber-400'
                                        }`}>
                                            {t.estado}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{new Date(t.fecha).toLocaleString('es-CO')}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2 flex-wrap">
                                            {t.tieneComprobante && (
                                                <button
                                                    onClick={() => handleVerComprobante(t.id)}
                                                    className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700"
                                                >
                                                    Ver comprobante
                                                </button>
                                            )}
                                            {t.estado === 'PENDIENTE' && (
                                                <>
                                                    <button
                                                        onClick={() => handleAprobar(t.id)}
                                                        className="px-3 py-1 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700"
                                                    >
                                                        Aprobar
                                                    </button>
                                                    <button
                                                        onClick={() => handleRechazar(t.id)}
                                                        className="px-3 py-1 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700"
                                                    >
                                                        Rechazar
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {listaFiltrada.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-zinc-400 dark:text-zinc-500">
                                        No hay transacciones para mostrar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                </>
                )}
            </div>
        </div>
    );
}

function GaugeKPI({ pct = 0, valor, label, nota, color = '#22C55E' }) {
    const r = 36;
    const cx = 50;
    const cy = 50;
    const filled = Math.max(0, Math.min(100, pct));
    return (
        <div className="flex flex-col items-center gap-1">
            <svg viewBox="0 0 100 60" className="w-28">
                {/* Track */}
                <path
                    d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                    fill="none" stroke="#e4e4e7" strokeWidth="10" strokeLinecap="round"
                    className="dark:[stroke:#3f3f46]"
                />
                {/* Fill */}
                <path
                    d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                    fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
                    pathLength="100"
                    strokeDasharray="100"
                    strokeDashoffset={100 - filled}
                    style={{ transition: 'stroke-dashoffset 1.2s ease, stroke 0.5s ease' }}
                />
                {/* Valor */}
                <text x="50" y="45" textAnchor="middle" fontSize="14" fontWeight="bold" fill={color}>{valor}</text>
            </svg>
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 text-center leading-tight">{label}</p>
            {nota && <p className="text-[10px] text-zinc-400 text-center leading-tight">{nota}</p>}
        </div>
    );
}

function Metrica({ titulo, valor }) {
    return (
        <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{titulo}</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-white">{valor}</p>
        </div>
    );
}

const BTN_COLORS = {
    green: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    blue:  'bg-blue-600 hover:bg-blue-500 text-white',
    red:   'bg-rose-600 hover:bg-rose-500 text-white',
};

function BtnExport({ label, activo, onClick, color }) {
    return (
        <button
            onClick={onClick}
            disabled={activo}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-60 ${BTN_COLORS[color]}`}
        >
            {activo ? '...' : `↓ ${label}`}
        </button>
    );
}

// ── Export helpers ────────────────────────────────────────────────────────────

function exportarCSV(filas, nombreArchivo, columnas) {
    const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [
        columnas.map(escape).join(','),
        ...filas.map(f => columnas.map(c => escape(f[c])).join(',')),
    ];
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    descargar(blob, `${nombreArchivo}.csv`);
}

async function exportarExcel(filas, nombreArchivo, nombreHoja) {
    const { utils, writeFile } = await import('xlsx');
    const ws = utils.json_to_sheet(filas);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, nombreHoja);
    writeFile(wb, `${nombreArchivo}.xlsx`);
}

async function exportarPDF(columnas, filas, nombreArchivo, titulo) {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    doc.setFontSize(13);
    doc.text(titulo, 14, 15);
    doc.setFontSize(9);
    doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, 14, 21);
    autoTable(doc, {
        head: [columnas],
        body: filas,
        startY: 26,
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [251, 191, 36], textColor: [0, 0, 0] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
    });
    doc.save(`${nombreArchivo}.pdf`);
}

function descargar(blob, nombre) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    a.click();
    URL.revokeObjectURL(url);
}
