import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import type { ToastOptions } from 'react-toastify';

// Interfaz de configuración de notificaciones
export interface NotificationsSettings {
    accountUpdates: boolean;
    priceDrops: boolean;
    favoritesSold: boolean;
    newProducts: boolean;
    transactions: boolean;
    productActivity: boolean;
    addedToFavorites: boolean;
    newMessage: boolean;
    newReview: boolean;
    tips: boolean;
    promotions: boolean;
}

// Valores por defecto
const defaultSettings: NotificationsSettings = {
    accountUpdates: true,
    priceDrops: true,
    favoritesSold: true,
    newProducts: true,
    transactions: true,
    productActivity: true,
    addedToFavorites: true,
    newMessage: true,
    newReview: true,
    tips: false,
    promotions: false,
};

// Contexto de notificaciones y su proveedor 
interface NotificationContextType {
    settings: NotificationsSettings;
    updateSetting: (key: keyof NotificationsSettings) => void;
    notify: (key: keyof NotificationsSettings, message: string, type?: 'success' | 'error' | 'info' | 'warning', options?: ToastOptions) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Proveedor del contexto 
export function NotificationProvider({ children }: { children: React.ReactNode }) {

    // Inicializar estado leyendo de localStorage si existe
    const [settings, setSettings] = useState<NotificationsSettings>(() => {
        const saved = localStorage.getItem('notification_settings');
        return saved ? JSON.parse(saved) : defaultSettings;
    });

    // Guardar en localStorage cada vez que cambia
    useEffect(() => {
        localStorage.setItem('notification_settings', JSON.stringify(settings));
    }, [settings]);

    const updateSetting = (key: keyof NotificationsSettings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Función inteligente para mostrar notificaciones
    const notify = (
        key: keyof NotificationsSettings,
        message: string,
        type: 'success' | 'error' | 'info' | 'warning' = 'success',
        options?: ToastOptions
    ) => {
        //  Verificar si el usuario tiene activada esa categoría
        if (settings[key]) {
            // Si está activada, lanzar el toast
            toast[type](message, options);
        } else {
            console.log(`Notificación silenciada por configuración de usuario: ${key}`);
        }
    };

    return (
        <NotificationContext.Provider value={{ settings, updateSetting, notify }}>
            {children}
        </NotificationContext.Provider>
    );
}

// Hook personalizado para usar el contexto de notificaciones
export function useNotificationSettings() {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotificationSettings debe usarse dentro de NotificationProvider');
    return context;
}