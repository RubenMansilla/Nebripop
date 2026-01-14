// src/components/NotificationListener.tsx
import { useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNotificationSettings } from '../../context/NotificationContext';
import { getUnreadNotifications, markNotificationAsRead } from '../../api/notifications.api';

export default function NotificationListener() {

    const { user } = useContext(AuthContext);
    const { notify } = useNotificationSettings();

    useEffect(() => {

        if (!user) return;

        const checkNotifications = async () => {
            try {
                //Pedir al back las no leídas
                const unread = await getUnreadNotifications(user.id);

                unread.forEach(async (notification: any) => {

                    await markNotificationAsRead(notification.id);

                    notify(notification.type, notification.message, 'info');
                });

            } catch (error) {
                console.error("Error comprobando notificaciones", error);
            }
        };

        // Chequeo inicial con retraso de 5s (para no saturar al entrar)
        const initialTimer = setTimeout(() => {
            checkNotifications();
        }, 5000);

        // Polling: Comprobar cada 60 segundos si tienes la web abierta
        const pollingInterval = setInterval(() => {
            checkNotifications();
        }, 60000);

        // Limpieza al desmontar o cambiar de usuario
        return () => {
            clearTimeout(initialTimer);
            clearInterval(pollingInterval);
        };

    }, [user, notify]); // Se ejecuta cuando cambia el usuario

    return null;
}