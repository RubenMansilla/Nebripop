import './Help.css';
import {
    Search,
    Truck,
    Wallet,
    BadgeCheck,
    Gift,
    Smile,
    ShieldCheck,
    MessageCircle,
    Globe
} from 'lucide-react';
import HelpBackgreounf from '../../../assets/profile/helpBackground.jpeg';
import { useNavigate } from 'react-router-dom';

export default function Help() {

    const navigate = useNavigate();

    return (
        <div className="Nebripop-help-container">
            {/* --- HEADER --- */}
            <header className="header">
                <div className="header-logo" onClick={() => window.location.reload()}>
                    <span className="logo-text">Nebripop</span>
                    <span className="logo-sub">ayuda</span>
                </div>
                <div className="header-links">
                    <a onClick={() => navigate('/')}>Volver a Nebripop</a>
                </div>
            </header>

            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-illustration-placeholder">
                        <img src={HelpBackgreounf} alt="Help Background" />
                    </div>
                    <div className="hero-text-overlay">
                        <h1 className="hero-title">¿Cómo te podemos ayudar?</h1>
                        <div className="search-bar-container">
                            <Search className="search-icon" size={20} />
                            <input
                                type="text"
                                placeholder="Detalla tu búsqueda..."
                                className="search-input"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <main className="main-content">
                <section className="featured-section">
                    <h2>Artículos destacados</h2>
                    <div className="featured-grid">
                        <a>Protección Nebripop</a>
                        <a>Cómo funciona Nebripop Envíos</a>
                        <a>¿Cómo abro una disputa al vendedor?</a>
                        <a>Escoge donde quieres recibir tu reembolso</a>
                        <a>Reembolsos</a>
                        <a>Productos con "Garantía" en Nebripop</a>
                    </div>
                </section>

                <div className="categories-grid-help">
                    <div className="category-column">
                        <div className="cat-header">
                            <Truck size={32} className="cat-icon" />
                            <h3>Envíos</h3>
                        </div>
                        <ul className="cat-list">
                            <li><a>¿Qué es Nebripop Envíos?</a></li>
                            <li><a>Comprar con envíos</a></li>
                            <li><a>Vender con envíos</a></li>
                            <li><a>¿Qué pasa si algo sale mal durante el envío?</a></li>
                            <li><a>Gestionar una disputa</a></li>
                        </ul>
                    </div>

                    <div className="category-column">
                        <div className="cat-header">
                            <Wallet size={32} className="cat-icon" />
                            <h3>Pagos y reembolsos</h3>
                        </div>
                        <ul className="cat-list">
                            <li><a>Información general</a></li>
                            <li><a>Soy comprador/a</a></li>
                            <li><a>Soy vendedor/a</a></li>
                            <li><a>Seguridad</a></li>
                        </ul>
                    </div>

                    <div className="category-column">
                        <div className="cat-header">
                            <BadgeCheck size={32} className="cat-icon" />
                            <h3>Productos con "Garantía" en Nebripop</h3>
                        </div>
                        <ul className="cat-list">
                            <li><a>Encuentra tu producto con "Garantía"</a></li>
                            <li><a>Garantía y política de devoluciones</a></li>
                        </ul>
                    </div>

                    <div className="category-column">
                        <div className="cat-header">
                            <Gift size={32} className="cat-icon" />
                            <h3>Comprar y vender</h3>
                        </div>
                        <ul className="cat-list">
                            <li><a>Mis productos</a></li>
                            <li><a>Cómo comprar en Nebripop</a></li>
                            <li><a>Cómo vender en Nebripop</a></li>
                            <li><a>Destacados</a></li>
                            <li><a>Normativa DAC7</a></li>
                        </ul>
                    </div>

                    <div className="category-column">
                        <div className="cat-header">
                            <Smile size={32} className="cat-icon" />
                            <h3>Cuenta</h3>
                        </div>
                        <ul className="cat-list">
                            <li><a>Acceso a cuenta</a></li>
                            <li><a>Perfil</a></li>
                            <li><a>Chats</a></li>
                            <li><a>Nebripop Club</a></li>
                        </ul>
                    </div>

                    <div className="category-column">
                        <div className="cat-header">
                            <BadgeCheck size={32} className="cat-icon" />
                            <h3>Nebripop PRO</h3>
                        </div>
                        <ul className="cat-list">
                            <li><a>¿Qué es Nebripop PRO?</a></li>
                            <li><a>Tipos de suscripciones</a></li>
                            <li><a>Beneficios de Nebripop PRO Multicategoría</a></li>
                            <li><a>Beneficios de Nebripop PRO Motor</a></li>
                            <li><a>Beneficios de Nebripop PRO Inmobiliaria</a></li>
                        </ul>
                    </div>

                    <div className="category-column">
                        <div className="cat-header">
                            <ShieldCheck size={32} className="cat-icon" />
                            <h3>Centro de Seguridad</h3>
                        </div>
                        <ul className="cat-list">
                            <li><a>Seguridad y protección en tu cuenta de Nebripop</a></li>
                            <li><a>Protégete de las estafas</a></li>
                            <li><a>Normas de Comunidad</a></li>
                            <li><a>Otra información legal</a></li>
                            <li><a>Uso y protección de datos</a></li>
                            <li><a>Gestión de peticiones</a></li>
                        </ul>
                    </div>
                </div>
            </main>

            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-logo">
                        <span className="logo-text">Nebripop</span>
                    </div>
                    <div className="footer-links">
                        <a>Centro de Ayuda Madrid</a>
                        <a>Centro de Ayuda Portugal</a>
                    </div>
                    <div className="lang-selector">
                        <Globe size={16} />
                        <span>español</span>
                    </div>
                </div>
            </footer>

            <button className="floating-chat-btn">
                <MessageCircle color="white" size={24} />
            </button>
        </div>
    )
}