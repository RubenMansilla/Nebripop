import './NotificationsSection.css';
import { useNotificationSettings } from '../../../context/NotificationContext';

export default function NotificationsSection() {

    const { settings, updateSetting } = useNotificationSettings();

    return (
        <div className='notifications-section'>
            <h2>Notificaciones</h2>

            <div className="notif-group">
                <h3>Cuenta y Seguridad</h3>
                <p className="group-desc">Avisos sobre cambios en tu perfil, contraseña o datos personales.</p>
                <ToggleItem
                    label="Cambios en la cuenta"
                    checked={settings.accountUpdates}
                    onChange={() => updateSetting('accountUpdates')}
                />
            </div>

            <div className="notif-group">
                <h3>Mis Favoritos</h3>
                <p className="group-desc">Recibe avisos cuando haya novedades sobre tus productos y vendedores favoritos.</p>

                <ToggleItem
                    label="Bajadas de precio"
                    checked={settings.priceDrops}
                    onChange={() => updateSetting('priceDrops')}
                />
                <ToggleItem
                    label="Favoritos vendidos"
                    checked={settings.favoritesSold}
                    onChange={() => updateSetting('favoritesSold')}
                />
                <ToggleItem
                    label="Nuevos productos"
                    checked={settings.newProducts}
                    onChange={() => updateSetting('newProducts')}
                />
            </div>

            <div className="notif-group">
                <h3>Mis acciones</h3>
                <p className="group-desc">Avisos relacionados con los productos publicados en NebriPop.</p>
                <ToggleItem
                    label="Transacciones"
                    checked={settings.transactions}
                    onChange={() => updateSetting('transactions')}
                />
                <ToggleItem
                    label="Mis anuncios"
                    // Usamos una nueva variable que engloba las 3 anteriores
                    checked={settings.productActivity}
                    onChange={() => updateSetting('productActivity')}
                />
                <ToggleItem
                    label="Al añadir a favoritos un producto o perfil"
                    checked={settings.addedToFavorites}
                    onChange={() => updateSetting('addedToFavorites')}
                />
                <ToggleItem
                    label="Subasta"
                    checked={settings.auctions}
                    onChange={() => updateSetting('auctions')}
                />
            </div>

            <div className="notif-group">
                <h3>Interacciones</h3>
                <p className="group-desc">Avisos cuando otros usuarios interactúan contigo.</p>
                <ToggleItem
                    label="Nuevo mensaje recibido"
                    checked={settings.newMessage}
                    onChange={() => updateSetting('newMessage')}
                />
                <ToggleItem
                    label="Publicar una reseña sobre un producto"
                    checked={settings.newReview}
                    onChange={() => updateSetting('newReview')}
                />
            </div>

            <div className="notif-group">
                <h3>Recomendaciones y promociones</h3>
                <p className="group-desc">Recibe avisos sobre promociones y otros contenidos.</p>
                <ToggleItem
                    label="Consejos y sugerencias"
                    checked={settings.tips}
                    onChange={() => updateSetting('tips')}
                />
                <ToggleItem
                    label="Promociones y novedades"
                    checked={settings.promotions}
                    onChange={() => updateSetting('promotions')}
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
            <label className="notif-switch">
                <input type="checkbox" checked={checked} onChange={onChange} />
                <span className="slider round"></span>
            </label>
        </div>
    );
}