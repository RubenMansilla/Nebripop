// Formatea una fecha en formato relativo en español
export function formatRelativeTime(date: string) {
    const diff = (Date.now() - new Date(date).getTime()) / 1000;

    if (diff < 60) return 'Hace unos segundos';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    if (diff < 2592000) return `Hace ${Math.floor(diff / 86400)} días`;

    return 'Hace tiempo';
}
