import { urlCalendarioIcs } from '../api';

export default function AgendarCalendario({ calendarioToken }) {
    if (!calendarioToken) return null;

    const urlIcs = urlCalendarioIcs(calendarioToken);
    const urlWebcal = urlIcs.replace(/^https?:\/\//, 'webcal://');
    const urlGoogleCalendar = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(urlWebcal)}`;

    return (
        <div className="rounded-2xl border border-amber-400/20 bg-slate-900/60 backdrop-blur-lg p-4 mb-6">
            <p className="text-white font-bold text-sm mb-1">📅 ¡La Retoucherie te recuerda tus partidos!</p>
            <p className="text-zinc-400 text-xs mb-3">
                Agenda los partidos de tus equipos favoritos y vive el Mundial con{' '}
                <span className="text-amber-400 font-semibold">GanaConRetoucherie</span> 🇨🇴. Cuando tu equipo
                avance de ronda, se agendará automáticamente.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
                <a
                    href={urlWebcal}
                    className="flex-1 inline-block py-2.5 rounded-xl font-bold text-sm text-slate-950 text-center bg-gradient-to-r from-yellow-400 to-amber-500 active:scale-95 transition-transform"
                >
                    🍎 Apple / Outlook Calendar
                </a>
                <a
                    href={urlGoogleCalendar}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-block py-2.5 rounded-xl font-bold text-sm text-white text-center border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
                >
                    📆 Google Calendar
                </a>
            </div>
        </div>
    );
}
