import axios from "axios";

const rawBaseURL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const baseURL = rawBaseURL.replace(/\/$/, "");

const api = axios.create({
  baseURL,
  withCredentials: true, // ✅ por si usas cookies/credentials
});

// REQUEST interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE interceptor (refresh)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refreshToken");

        // ✅ axios crudo (SIN interceptores)
        const { data } = await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${refreshToken}` },
          }
        );

        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        api.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.error("Sesión caducada definitivamente");
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
