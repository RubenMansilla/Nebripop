
const API_URL = import.meta.env.VITE_API_URL;

// Ocultar una COMPRA de mi historial
export async function hidePurchasedTransaction(purchaseId: number, token: string) {
    try {
        const res = await fetch(`${API_URL}/purchases/buy/${purchaseId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Error al ocultar la compra");
        }

        return res.json();
    } catch (error: any) {
        console.error("Error en hidePurchasedTransaction:", error);
        throw new Error(error.message || "No se pudo ocultar la compra");
    }
}

// Ocultar una VENTA de mi historial
export async function hideSoldTransaction(purchaseId: number, token: string) {
    try {
        const res = await fetch(`${API_URL}/purchases/sell/${purchaseId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Error al ocultar la venta");
        }

        return res.json();
    } catch (error: any) {
        console.error("Error en hideSoldTransaction:", error);
        throw new Error(error.message || "No se pudo ocultar la venta");
    }
}

// Obtener mi historial de transacciones
export async function fetchMyTransactions(token: string, filter: 'all' | 'in' | 'out') {
    try {
        const res = await fetch(`${API_URL}/purchases/history?type=${filter}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) throw new Error("Error al obtener historial");

        return await res.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}