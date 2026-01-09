// Formatea una fecha dada en una cadena de tiempo relativo en español
export function formatRelativeTime(date: string) {
    const diff = (Date.now() - new Date(date).getTime()) / 1000; // Diferencia en segundos

    // Constantes en segundos
    const minute = 60;
    const hour = 3600;
    const day = 86400;
    const week = 604800;
    const month = 2592000;
    const year = 31536000;

    if (diff < minute) return 'Hace unos segundos';

    if (diff < hour) {
        const minutes = Math.floor(diff / minute);
        return `Hace ${minutes} min`;
    }

    if (diff < day) {
        const hours = Math.floor(diff / hour);
        return `Hace ${hours} h`;
    }

    if (diff < week) {
        const days = Math.floor(diff / day);
        return `Hace ${days} día${days > 1 ? 's' : ''}`;
    }

    if (diff < month) {
        const weeks = Math.floor(diff / week);
        return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
    }

    if (diff < year) {
        const months = Math.floor(diff / month);
        return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
    }

    const years = Math.floor(diff / year);
    return `Hace ${years} año${years > 1 ? 's' : ''}`;
}