import api from "../utils/axiosConfig";

// OBTENER SALDO (BALANCE)
export async function getWalletBalance() {
    try {
        const res = await api.get('/wallet/balance');
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error al obtener el saldo");
    }
}

// RECARGAR (DEPOSIT)
export async function depositMoney(amount: number) {
    try {
        const res = await api.post('/wallet/deposit', { amount });
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error al realizar la recarga");
    }
}

// RETIRAR (WITHDRAW)
export async function withdrawMoney(amount: number) {
    try {
        const res = await api.post('/wallet/withdraw', { amount });
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error al retirar fondos");
    }
}