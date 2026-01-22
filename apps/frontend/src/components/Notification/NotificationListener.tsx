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

                    // Definir acción de click también para las pendientes
                    let clickAction = undefined;

                    if (n.type === 'priceDrops' && n.product_id) {
                        clickAction = () => navigate(`/product/${n.product_id}`);
                    } else if (n.type === 'newMessage') {
                        clickAction = () => navigate('/profile/chat');
                    }

                    notify(n.type, n.message, 'info', { onClick: clickAction });
                });
            } catch (error) {
                console.error("Error cargando notificaciones pendientes", error);
            }
        };

        const initialTimer = setTimeout(checkPendingNotifications, 2000);

        // Escuchar notificaciones en Tiempo Real
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

                    if (payload.errors) {
                        console.error("Error de permisos Supabase:", payload.errors);
                        return;
                    }

                    const newNotif = payload.new;

                    // Verificar que la notificación es para el usuario actual
                    if (Number(newNotif.user_id) === Number(user.id)) {

                        await markNotificationAsRead(newNotif.id);

                        const userSettings = settings || {};
                        const shouldShow = userSettings[newNotif.type] !== false;

                        if (shouldShow) {
                            let clickAction = undefined;

                            // Si es mensaje nuevo -> Chat
                            if (newNotif.type === 'newMessage') {
                                clickAction = () => navigate('/profile/chat');
                            }

                            // Si es bajada de precio -> Producto Específico
                            else if (newNotif.type === 'priceDrops') {
                                if (newNotif.product_id) {
                                    clickAction = () => navigate(`/product/${newNotif.product_id}`);
                                }
                            }

                            notify(newNotif.type, newNotif.message, 'info', {
                                onClick: clickAction
                            });
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            clearTimeout(initialTimer);
            supabase.removeChannel(channel);
        };

    }, [user, notify, settings, navigate]);

    return null;
}