// Calcula la antigüedad de una cuenta en Nebripop y la formatea en una cadena legible.
export function formatAccountAge(createdAt: string): string {
    const created = new Date(createdAt);
    const now = new Date();

    const diffMs = now.getTime() - created.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    // Menos de 1 mes → semanas (1–4)
    if (diffDays < 30) {
        const weeks = Math.max(1, Math.floor(diffDays / 7));
        return `${weeks} semana${weeks > 1 ? "s" : ""} en Nebripop`;
    }

    // Menos de 1 año → meses (1–11)
    if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} mes${months > 1 ? "es" : ""} en Nebripop`;
    }

    // 1 año o más
    const years = Math.floor(diffDays / 365);
    return `${years} año${years > 1 ? "s" : ""} en Nebripop`;
}
