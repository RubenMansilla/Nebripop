import { useEffect, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AuthContext } from '../../context/AuthContext';
import { useNotificationSettings } from '../../context/NotificationContext';
import { getUnreadNotifications, markNotificationAsRead } from '../../api/notifications.api';
import { useNavigate } from 'react-router-dom';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function NotificationListener() {

    const { user } = useContext(AuthContext);
    const { notify, settings } = useNotificationSettings();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            return;
        }

        // Carga inicial de notificaciones pendientes
        const checkPendingNotifications = async () => {
            try {
                const unread = await getUnreadNotifications(user.id);

                unread.forEach(async (n: any) => {
                    await markNotificationAsRead(n.id);
                    notify(n.type, n.message, 'info');
                });
            } catch (error) {
                console.error("Error cargando notificaciones pendientes", error);
            }
        };

        const initialTimer = setTimeout(checkPendingNotifications, 2000);

        const channel = supabase
            .channel('realtime:notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                },
                async (payload) => {

                    // Si sigue llegando error, salir
                    if (payload.errors) {
                        console.error("Error de permisos Supabase:", payload.errors);
                        return;
                    }

                    const newNotif = payload.new;

                    // Comparar el user_id de la notificación con el de la sesión
                    if (Number(newNotif.user_id) === Number(user.id)) {

                        await markNotificationAsRead(newNotif.id);

                        // Comprobar configuración
                        const userSettings = settings || {};
                        const shouldShow = userSettings[newNotif.type] !== false;

                        if (shouldShow) {
                            // LÓGICA DE NAVEGACIÓN
                            let clickAction = undefined;

                            // Si es un mensaje nuevo, ir al buzón general
                            if (newNotif.type === 'newMessage') {
                                clickAction = () => navigate('/profile/chat');
                            }

                            notify(newNotif.type, newNotif.message, 'info', {
                                onClick: clickAction
                            });
                        }
                    }
                }
            )
            .subscribe((status, err) => {
            });

        return () => {
            clearTimeout(initialTimer);
            supabase.removeChannel(channel);
        };

    }, [user, notify, settings, navigate]);

    return null;
}