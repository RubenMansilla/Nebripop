export async function registerUser(data: {
    fullName: string;
    email: string;
    password: string;
}) {
    const res = await fetch("http://localhost:3001/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error al registrar usuario");

    return res.json();
}

export async function loginUser(data: { email: string; password: string }) {

    const res = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message || "Credenciales incorrectas");
    }

    return res.json();
}