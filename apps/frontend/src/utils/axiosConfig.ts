import axios from 'axios';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}`,
});

// INTERCEPTOR DE SOLICITUD (REQUEST)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// INTERCEPTOR DE RESPUESTA (RESPONSE) - LÓGICA REFRESH
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');

                const { data } = await axios.post(
                    `${import.meta.env.VITE_API_URL}/auth/refresh`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${refreshToken}` }
                    }
                );

                // Guardar los nuevos tokens
                localStorage.setItem('token', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);

                // Actualizar el header de la instancia de axios y de la petición original
                api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

                return api(originalRequest);

            } catch (refreshError) {
                // Si el refresh falla (ej. pasaron los 30 días o DB vacía), logout forzoso
                console.error("Sesión caducada definitivamente");
                localStorage.clear();
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;