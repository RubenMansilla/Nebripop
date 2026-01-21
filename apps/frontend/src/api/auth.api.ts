// apps/frontend/src/api/auth.api.ts
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

// ✅ NUEVO: request forgot password
interface ForgotPasswordData {
  email: string;
}

// ✅ NUEVO: reset password
interface ResetPasswordData {
  token: string;
  newPassword: string;
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

// ✅ AÑADIDO: solo para “¿Has olvidado tu contraseña?”
export async function requestPasswordReset(data: ForgotPasswordData) {
  try {
    const response = await api.post("/auth/forgot-password", data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "No se pudo solicitar el cambio de contraseña"
    );
  }
}

// ✅ AÑADIDO: para confirmar el cambio de contraseña desde el link
export async function resetPassword(data: ResetPasswordData) {
  try {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "No se pudo cambiar la contraseña"
    );
  }
}
