const API_URL = import.meta.env.VITE_API_URL;

// OBTENER SALDO (BALANCE)
export async function getWalletBalance(token: string) {
    const res = await fetch(`${API_URL}/wallet/balance`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) throw new Error("Error al obtener el saldo");
    return res.json();
}

// RECARGAR (DEPOSIT)
export async function depositMoney(amount: number, token: string) {
    const res = await fetch(`${API_URL}/wallet/deposit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
    });

    if (!res.ok) throw new Error("Error al realizar la recarga");
    return res.json();
}

// RETIRAR (WITHDRAW)
export async function withdrawMoney(amount: number, token: string) {
    const res = await fetch(`${API_URL}/wallet/withdraw`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al retirar fondos");
    }

    return res.json();
}