import api from "../utils/axiosConfig";

// ---------- CREAR SUBASTA ----------
export async function createAuction(
    productId: string | number,
    startingPrice: number,
    durationHours: number
) {
    try {
        const res = await api.post("/auctions", {
            productId,
            startingPrice,
            durationHours,
        });
        return res.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || "Error al crear la subasta"
        );
    }
}

// ---------- FILTRAR SUBASTAS ----------
export async function filterAuctions(
    categoryId?: number | null,
    subcategoryId?: number | null,
    minPrice?: number | string,
    maxPrice?: number | string,
    dateFilter?: string,
    condition?: string,
    shippingActive?: boolean
) {
    const params: any = {};
    if (categoryId) params.categoryId = categoryId;
    if (subcategoryId) params.subcategoryId = subcategoryId;
    if (minPrice !== undefined && minPrice !== "") params.minPrice = minPrice;
    if (maxPrice !== undefined && maxPrice !== "") params.maxPrice = maxPrice;
    if (dateFilter) params.dateFilter = dateFilter;
    if (condition) params.condition = condition;
    if (shippingActive !== undefined) params.shippingActive = shippingActive;

    try {
        const res = await api.get("/auctions/filter", { params });
        return res.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || "Error al filtrar subastas"
        );
    }
}

// ---------- TODAS LAS SUBASTAS ----------
export async function getAuctions() {
    try {
        const res = await api.get("/auctions");
        return res.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || "Error al obtener subastas"
        );
    }
}

// ---------- SUBASTA POR ID ----------
export async function getAuctionById(id: string | number) {
    try {
        // If you need numerical ID validation:
        // const numericId = Number(id);
        // if (isNaN(numericId)) throw new Error('ID inválido');
        const res = await api.get(`/auctions/${id}`);
        return res.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || "Error al obtener la subasta"
        );
    }
}

// ---------- PUJAR ----------
export async function placeBid(
    auctionId: string | number,
    amount: number,
    _user: any // keeping user param for interface consistency if needed, though backend handles user via token
) {
    try {
        const res = await api.post(`/auctions/${auctionId}/bid`, { amount });
        return res.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || "Error al realizar la puja"
        );
    }
}

// ---------- MIS SUBASTAS (CREADAS) ----------
export async function getMyAuctions(_userId: string | number) {
    try {
        const res = await api.get("/auctions/my-auctions");
        return res.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || "Error al obtener tus subastas"
        );
    }
}

// ---------- SUBASTAS EN LAS QUE PARTICIPO ----------
export async function getParticipatingAuctions(_userId?: string | number) {
    try {
        // userId param is optional/unused here because token is used by backend, 
        // but kept for signature compatibility if needed.
        const res = await api.get("/auctions/participating");
        return res.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || "Error al obtener subastas participadas"
        );
    }
}

// ---------- HISTORIAL DE SUBASTAS (CREADAS - FINALIZADAS) ----------
export async function getMyAuctionHistory(_userId: string | number) {
    try {
        const res = await api.get("/auctions/my-history");
        return res.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || "Error al obtener historial"
        );
    }
}

// ---------- ELIMINAR SUBASTA ----------
export async function deleteAuction(id: string | number) {
    try {
        const res = await api.delete(`/auctions/${id}`);
        return res.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || "Error al eliminar la subasta"
        );
    }
}


// ---------- PAGAR SUBASTA ----------
export async function payAuction(id: string | number, shippingPayload?: any) {
    try {
        const res = await api.post(`/auctions/${id}/pay`, shippingPayload);
        return res.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || "Error al procesar el pago"
        );
    }
}
