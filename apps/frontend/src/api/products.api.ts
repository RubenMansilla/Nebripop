import api from "../utils/axiosConfig";

// =========================
// PRODUCTS API
// =========================

// ---------- CREAR PRODUCTO ----------
export async function createProduct(
    data: any,
    images: File[]
) {

    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (
            value !== undefined &&
            value !== null &&
            value !== "" &&
            !Number.isNaN(value)
        ) {
            formData.append(key, String(value));
        }
    });

    for (const img of images) {
        formData.append("images", img);
    }

    try {
        const res = await api.post('/products', formData);
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error al crear producto");
    }
}

// ---------- MIS PRODUCTOS ACTIVOS ----------
export async function getMyActiveProducts() {
    try {
        const res = await api.get('/products/my-products/active');
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error al obtener productos activos");
    }
}

// ---------- MIS PRODUCTOS VENDIDOS ----------
export async function getMySoldProducts() {
    try {
        const res = await api.get('/products/my-products/sold');
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error al obtener productos vendidos");
    }
}

// ---------- TODOS LOS PRODUCTOS (HOME) ----------
export async function getAllProducts(
    categoryId?: number | null,
    subcategoryId?: number | null,
    minPrice?: number,
    maxPrice?: number,
    dateFilter?: "today" | "7days" | "30days"
) {
    // Construimos el objeto de parámetros
    const params: any = {};

    if (categoryId) params.categoryId = categoryId;
    if (subcategoryId) params.subcategoryId = subcategoryId;
    if (minPrice !== undefined) params.minPrice = minPrice;
    if (maxPrice !== undefined) params.maxPrice = maxPrice;
    if (dateFilter) params.dateFilter = dateFilter;

    try {
        const res = await api.get('/products', { params });
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error al obtener productos");
    }
}

// ---------- PRODUCTO POR ID ----------
export async function getProductById(productId: string) {
    try {
        const res = await api.get(`/products/${productId}`);
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error al obtener el producto");
    }
}

// ---------- ELIMINAR PRODUCTO ----------
export async function deleteProduct(productId: number) {
    try {
        const res = await api.delete(`/products/${productId}`);

        return true;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "No se pudo eliminar el producto");
    }
}

// ---------- MIS COMPRAS FINALIZADAS ----------
export async function getMyPurchasedProducts() {
    try {
        const res = await api.get('/products/my-products/purchased');
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error al obtener productos comprados");
    }
}

// ---------- PROCESO DE COMPRA ----------
export async function getMyBuyingProcessProducts() {
    try {
        const res = await api.get('/products/my-products/buying-process');
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error al obtener productos en proceso de compra");
    }
}

// ---------- PROCESO DE VENTA ----------
export async function getMySellingProcessProducts() {
    try {
        const res = await api.get('/products/my-products/selling-process');
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error al obtener productos en proceso de venta");
    }
}

// ---------- PRODUCTOS PÚBLICOS DE UN USUARIO ----------
export async function getPublicProductsByUser(userId: number) {
    try {
        const res = await api.get(`/products/public/user/${userId}`);
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error obteniendo productos del usuario");
    }
}

// ---------- PRODUCTOS MÁS VISTOS ----------
export async function getMostViewedProducts() {
    try {
        const res = await api.get('/products/top-success');
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error al obtener los productos más vistos");
    }
}

// ---------- ESTADÍSTICAS FINANCIERAS ----------
export async function getFinancialStats(range: string) {
    try {
        const res = await api.get('/products/stats/financial', {
            params: { range }
        });
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error al obtener las estadísticas financieras");
    }
}