import { useState } from 'react';
import './NotificationsSection.css';

interface NotificationsState {
    priceDrops: boolean;
    favoritesSold: boolean;
    newProducts: boolean;
    productUploaded: boolean;
    productDeleted: boolean;
    addedToFavorites: boolean;
}

export default function NotificationsSection() {

    const [notifications, setNotifications] = useState<NotificationsState>({
        priceDrops: true,
        favoritesSold: true,
        newProducts: false,
        productUploaded: true,
        productDeleted: false,
        addedToFavorites: true
    });

    const handleNotifToggle = (key: keyof NotificationsState) => {
        setNotifications({ ...notifications, [key]: !notifications[key] });
    };

    return (
        <div className='notifications-section'>
            <h2>Notificaciones</h2>

            <div className="notif-group">
                <h3>Mis Favoritos</h3>
                <p className="group-desc">Recibe avisos cuando haya novedades sobre tus productos y vendedores favoritos.</p>

                <ToggleItem
                    label="Bajadas de precio"
                    checked={notifications.priceDrops}
                    onChange={() => handleNotifToggle('priceDrops')}
                />
                <ToggleItem
                    label="Favoritos vendidos"
                    checked={notifications.favoritesSold}
                    onChange={() => handleNotifToggle('favoritesSold')}
                />
                <ToggleItem
                    label="Nuevos productos"
                    checked={notifications.newProducts}
                    onChange={() => handleNotifToggle('newProducts')}
                />
            </div>

            <div className="notif-group">
                <h3>Actividad General</h3>
                <p className="group-desc">Avisos relacionados con la actividad general de tu cuenta.</p>
                <ToggleItem
                    label="Al subir un producto"
                    checked={notifications.productUploaded}
                    onChange={() => handleNotifToggle('productUploaded')}
                />
                <ToggleItem
                    label="Al eliminar un producto"
                    checked={notifications.productDeleted}
                    onChange={() => handleNotifToggle('productDeleted')}
                />
                <ToggleItem
                    label="Al añadir un producto a favoritos"
                    checked={notifications.addedToFavorites}
                    onChange={() => handleNotifToggle('addedToFavorites')}
                />
            </div>
        </div>
    );
}


interface ToggleItemProps {
    label: string;
    checked: boolean;
    onChange: () => void;
}


function ToggleItem({ label, checked, onChange }: ToggleItemProps) {
    return (
        <div className="toggle-item">
            <span>{label}</span>
            <label className="switch">
                <input type="checkbox" checked={checked} onChange={onChange} />
                <span className="slider round"></span>
            </label>
        </div>
    );
}