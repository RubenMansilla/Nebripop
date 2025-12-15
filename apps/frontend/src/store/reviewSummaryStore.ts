import type { ReviewSummary } from "../types/review";

// Definimos una interfaz interna para lo que guardamos en LocalStorage
interface StoredReviewData extends ReviewSummary {
    _userId?: number; // Campo extra para validar propiedad
}

const STORAGE_KEY = "reviewSummary";

// Función auxiliar para leer con seguridad
const loadFromStorage = (): StoredReviewData | null => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

export const reviewSummaryStore = {
    // Cargamos el valor inicial
    value: loadFromStorage(),
    listeners: [] as ((v: ReviewSummary) => void)[],

    // Modificamos set para que pida el userId OBLIGATORIAMENTE
    set(v: ReviewSummary, userId: number) {
        // Creamos el objeto con la marca del usuario
        const dataToStore: StoredReviewData = { ...v, _userId: userId };

        this.value = dataToStore;

        // Guardar en localStorage con el ID
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));

        this.listeners.forEach(l => l(v));
    },

    // Método para limpiar (útil al hacer logout explícito)
    clear() {
        this.value = null;
        localStorage.removeItem(STORAGE_KEY);
        this.listeners.forEach(l => l({ average: 0, total: 0 }));
    },

    subscribe(cb: (v: ReviewSummary) => void) {
        this.listeners.push(cb);
        return () => {
            this.listeners = this.listeners.filter(l => l !== cb);
        };
    }
};