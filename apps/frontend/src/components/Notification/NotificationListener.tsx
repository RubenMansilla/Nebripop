import { useEffect, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AuthContext } from '../../context/AuthContext';
import { useNotificationSettings } from '../../context/NotificationContext';
import { getUnreadNotifications, markNotificationAsRead } from '../../api/notifications.api';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function NotificationListener() {
    const { user } = useContext(AuthContext);
    const { notify, settings } = useNotificationSettings();

    // Ver si el componente se monta
    console.log("1. NotificationListener montado. Usuario actual:", user);

    useEffect(() => {
        if (!user) {
            console.log("2. No hay usuario, abortando listener.");
            return;
        }

        console.log("3. Iniciando lógica para usuario ID:", user.id);

        // Carga inicial de notificaciones pendientes
        const checkPendingNotifications = async () => {
            try {
                console.log("4. Buscando notificaciones antiguas...");
                const unread = await getUnreadNotifications(user.id);
                console.log("5. Notificaciones antiguas encontradas:", unread.length);

                unread.forEach(async (n: any) => {
                    await markNotificationAsRead(n.id);
                    notify(n.type, n.message, 'info');
                });
            } catch (error) {
                console.error("Error cargando notificaciones pendientes", error);
            }
        };

        const initialTimer = setTimeout(checkPendingNotifications, 2000);

        // Realtime subscription
        console.log(`6. Intentando conectar Realtime con filtro: user_id=eq.${user.id}`);

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
                    console.log("🚀 LLEGÓ ALGO:", payload);

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
                            notify(newNotif.type, newNotif.message, 'info');
                        }
                    }
                }
            )
            .subscribe((status, err) => {
                // LOG CRÍTICO: Ver estado de la conexión
                console.log("7. Estado de suscripción Supabase:", status, err);
            });

        return () => {
            clearTimeout(initialTimer);
            supabase.removeChannel(channel);
            console.log("8. Limpiando canal");
        };

    }, [user, notify, settings]);

    return null;
}