// apps/frontend/src/api/purchases.api.ts
import api from "../utils/axiosConfig";

// =========================
// CREAR COMPRA
// =========================
export async function createPurchase(data: any) {
  try {
    const res = await api.post("/purchases", data);
    return res.data;
  } catch (error: any) {
    console.error("Error en createPurchase:", error);
    throw new Error(
      error.response?.data?.message || "Error al crear la compra",
    );
  }
}

// Ocultar una COMPRA de mi historial
export async function hidePurchasedTransaction(purchaseId: number) {
  try {
    const res = await api.delete(`/purchases/buy/${purchaseId}`);
    return res.data;
  } catch (error: any) {
    console.error("Error en hidePurchasedTransaction:", error);
    throw new Error(
      error.response?.data?.message || "No se pudo ocultar la compra",
    );
  }
}

// Ocultar una VENTA de mi historial
export async function hideSoldTransaction(purchaseId: number) {
  try {
    const res = await api.delete(`/purchases/sell/${purchaseId}`);
    return res.data;
  } catch (error: any) {
    console.error("Error en hideSoldTransaction:", error);
    throw new Error(
      error.response?.data?.message || "No se pudo ocultar la venta",
    );
  }
}

// Obtener mi historial de transacciones
export async function fetchMyTransactions(filter: "all" | "in" | "out") {
  try {
    const res = await api.get("/purchases/history", {
      params: { type: filter },
    });
    return res.data;
  } catch (error: any) {
    console.error("Error obteniendo transacciones:", error);

    throw new Error(
      error.response?.data?.message || "Error al obtener historial",
    );
  }
}
