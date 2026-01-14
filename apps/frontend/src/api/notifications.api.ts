import api from "../utils/axiosConfig";

export const getUnreadNotifications = async (userId: number) => {
    // Nota: El userId normalmente viaja en el Token, pero si tu back lo pide por param, ajusta la URL
    const response = await api.get('/notifications/unread');
    return response.data;
};

export const markNotificationAsRead = async (notificationId: string) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
};