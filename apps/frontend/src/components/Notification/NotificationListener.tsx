import { useEffect, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AuthContext } from '../../context/AuthContext';
import { useNotificationSettings } from '../../context/NotificationContext';
import type { NotificationsSettings } from '../../context/NotificationContext';
import { getUnreadNotifications, markNotificationAsRead } from '../../api/notifications.api';
import { useNavigate } from 'react-router-dom';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function NotificationListener() {

    const { user } = useContext(AuthContext);
    const { notify, settings } = useNotificationSettings();
    const navigate = useNavigate();

    // Mapeo de tipos de backend a claves de configuración de frontend
    const mapNotificationType = (type: string): keyof NotificationsSettings | string => {
        const auctionTypes = [
            'auction_alert',
            'auction_end',
            'auction_win',
            'payment_reminder',
            'penalty_alert',
            'auction_failed'
        ];
        if (auctionTypes.includes(type)) return 'auctions';
        return type;
    }

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

                    const mappedType = mapNotificationType(n.type) as keyof NotificationsSettings;

                    // Definir acción de click también para las pendientes
                    let clickAction = undefined;

                    // Lógica de navegación basada en el tipo ORIGINAL o mapeado
                    // Si es bajada de precio
                    if (n.type === 'priceDrops' && n.product_id) {
                        clickAction = () => navigate(`/product/${n.product_id}`);
                    }
                    // Si es mensaje nuevo
                    else if (n.type === 'newMessage') {
                        clickAction = () => navigate('/profile/chat');
                    }
                    // Si es algo de subastas
                    else if (mappedType === 'auctions' && n.product_id) {
                        clickAction = () => navigate(`/auction/${n.product_id}`);
                    }

                    notify(mappedType, n.message, 'info', { onClick: clickAction });
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

                        const mappedType = mapNotificationType(newNotif.type) as keyof NotificationsSettings;
                        const userSettings = settings || {};

                        // Verificar configuración usando el tipo mapeado
                        // Si no existe la key en settings, asumimos true por defecto (o false dependiendo de lo que queramos, pero notify ya hace su chequeo)
                        // Aquí solo pre-filtramos para logica extra si fuera necesario, pero notify es el guardián final.
                        // Sin embargo, como el usuario reportó que se "silencia", es porque notify recibe 'auction_alert' y no lo encuentra.
                        // Al pasar 'auctions', notify lo encontrará.

                        const shouldShow = userSettings[mappedType] !== false;

                        if (shouldShow) {
                            let clickAction = undefined;
                            const options: any = {};

                            // Si es mensaje nuevo -> Chat
                            if (newNotif.type === 'newMessage') {
                                clickAction = () => navigate('/profile/chat');
                                // AÑADIDO: toastId para evitar duplicados. 
                                // Si el mensaje es "Nuevo mensaje de Juan", el ID será ese mismo string.
                                // Si ya existe un toast con ese ID, react-toastify lo actualiza en lugar de crear uno nuevo.
                                (options as any).toastId = newNotif.message;
                            }

                            // Si es bajada de precio -> Producto Específico
                            else if (newNotif.type === 'priceDrops') {
                                if (newNotif.product_id) {
                                    clickAction = () => navigate(`/product/${newNotif.product_id}`);
                                }
                            }
                            // Lógica para subastas
                            else if (mappedType === 'auctions') {
                                if (newNotif.product_id) {
                                    clickAction = () => navigate(`/auction/${newNotif.product_id}`);
                                }
                            }

                            notify(mappedType, newNotif.message, 'info', {
                                onClick: clickAction,
                                ...options
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
