import api from "../utils/axiosConfig";


interface RegisterData {
    fullName: string;
    email: string;
    password: string;
}

interface LoginData {
    email: string;
    password: string;
}

export async function registerUser(data: RegisterData) {
    try {

        const response = await api.post("/auth/register", data);

        return response.data;
    } catch (error: any) {

        throw new Error(error.response?.data?.message || "Error al registrar usuario");
    }
}

export async function loginUser(data: LoginData) {
    try {
        const response = await api.post("/auth/login", data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Credenciales incorrectas");
    }
}