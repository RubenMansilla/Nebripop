import type { ReviewSummary } from "../types/review";

const stored = localStorage.getItem("reviewSummary");

export const reviewSummaryStore = {
    value: stored ? JSON.parse(stored) as ReviewSummary : null,
    listeners: [] as ((v: ReviewSummary) => void)[],

    set(v: ReviewSummary) {
        this.value = v;

        // Guardar en localStorage para persistencia
        localStorage.setItem("reviewSummary", JSON.stringify(v));

        this.listeners.forEach(l => l(v));
    },

    subscribe(cb: (v: ReviewSummary) => void) {
        this.listeners.push(cb);
        return () => {
            this.listeners = this.listeners.filter(l => l !== cb);
        };
    }
};
