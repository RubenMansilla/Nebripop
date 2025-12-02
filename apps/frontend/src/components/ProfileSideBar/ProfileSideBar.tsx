import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import './ProfileSideBar.css';

export default function ProfileSideBar() {

    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(AuthContext);

    const defaultPic = "https://zxetwkoirtyweevvatuf.supabase.co/storage/v1/object/sign/userImg/Default_Profile_Picture.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kYWMwYTY1NC1mOTY4LTQyNjYtYmVlYy1lYjdkY2EzNmI2NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ1c2VySW1nL0RlZmF1bHRfUHJvZmlsZV9QaWN0dXJlLnBuZyIsImlhdCI6MTc2NDU4MzQ3OSwiZXhwIjoxNzk2MTE5NDc5fQ.yJUBlEuws9Tl5BK9tIyMNtKp52Jj8reTF_y_a71oR1I";

    if (!user) return null;

    const year = new Date(user.createdAt).getFullYear();

    // Foto del usuario o por defecto en caso de no tener
    const imageSrc = user.profilePicture || defaultPic;

    return (
        <>
            <div className='sidebar-left'>
                <div className={`sidebar-profile ${location.pathname === "/profile/info" ? "active" : ""}`} onClick={() => navigate("/profile/info")}>
                    <div className="profile-pic">
                        <img src={imageSrc} alt="Foto de perfil" />
                    </div>
                    <div className="profile-info">
                        <div className="profile-name">
                            <h3>{user.fullName}</h3>
                        </div>
                        <div className="profile-rating">
                            <span>★★★★★ (1)</span>
                        </div>
                        <div className="profile-creation">
                            <span>En Nebripop desde {year}</span>
                        </div>
                    </div>
                    <div className="arrow">
                        <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24"><path fill="#000000" d="m14.475 12l-7.35-7.35q-.375-.375-.363-.888t.388-.887t.888-.375t.887.375l7.675 7.7q.3.3.45.675t.15.75t-.15.75t-.45.675l-7.7 7.7q-.375.375-.875.363T7.15 21.1t-.375-.888t.375-.887z" /></svg>
                    </div>
                </div>
                <div className="sidebar-menu">
                    <div className={`menu-item ${location.pathname === "/profile/purchases" ? "active" : ""}`} onClick={() => navigate("/profile/purchases")}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.7 12.4C11.7 9.6 13.8 10.3 13.8 8.2C13.8 7.28125 13.1 6.1 11.7 6.1C10.3 6.1 9.6 6.8 8.9 7.5M11.7 16.6V14.5M22.9 11.7C22.9 17.8856 17.8856 22.9 11.7 22.9C5.51441 22.9 0.5 17.8856 0.5 11.7C0.5 5.51441 5.51441 0.5 11.7 0.5C17.8856 0.5 22.9 5.51441 22.9 11.7Z" stroke="#898989" />
                        </svg>
                        <p>Compras</p>
                        <div className="arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24"><path fill="#000000" d="m14.475 12l-7.35-7.35q-.375-.375-.363-.888t.388-.887t.888-.375t.887.375l7.675 7.7q.3.3.45.675t.15.75t-.15.75t-.45.675l-7.7 7.7q-.375.375-.875.363T7.15 21.1t-.375-.888t.375-.887z" /></svg>
                        </div>
                    </div>
                    <div className={`menu-item ${location.pathname === "/profile/sales" ? "active" : ""}`} onClick={() => navigate("/profile/sales")}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.7 12.4C11.7 9.6 13.8 10.3 13.8 8.2C13.8 7.28125 13.1 6.1 11.7 6.1C10.3 6.1 9.6 6.8 8.9 7.5M11.7 16.6V14.5M22.9 11.7C22.9 17.8856 17.8856 22.9 11.7 22.9C5.51441 22.9 0.5 17.8856 0.5 11.7C0.5 5.51441 5.51441 0.5 11.7 0.5C17.8856 0.5 22.9 5.51441 22.9 11.7Z" stroke="#898989" />
                        </svg>
                        <p>Ventas</p>
                        <div className="arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24"><path fill="#000000" d="m14.475 12l-7.35-7.35q-.375-.375-.363-.888t.388-.887t.888-.375t.887.375l7.675 7.7q.3.3.45.675t.15.75t-.15.75t-.45.675l-7.7 7.7q-.375.375-.875.363T7.15 21.1t-.375-.888t.375-.887z" /></svg>
                        </div>
                    </div>
                    <div className={`menu-item ${location.pathname === "/profile/catalog" ? "active" : ""}`} onClick={() => navigate("/profile/catalog")}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.7 12.4C11.7 9.6 13.8 10.3 13.8 8.2C13.8 7.28125 13.1 6.1 11.7 6.1C10.3 6.1 9.6 6.8 8.9 7.5M11.7 16.6V14.5M22.9 11.7C22.9 17.8856 17.8856 22.9 11.7 22.9C5.51441 22.9 0.5 17.8856 0.5 11.7C0.5 5.51441 5.51441 0.5 11.7 0.5C17.8856 0.5 22.9 5.51441 22.9 11.7Z" stroke="#898989" />
                        </svg>
                        <p>Tu Catálogo</p>
                        <div className="arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24"><path fill="#000000" d="m14.475 12l-7.35-7.35q-.375-.375-.363-.888t.388-.887t.888-.375t.887.375l7.675 7.7q.3.3.45.675t.15.75t-.15.75t-.45.675l-7.7 7.7q-.375.375-.875.363T7.15 21.1t-.375-.888t.375-.887z" /></svg>
                        </div>
                    </div>
                    <div className={`menu-item ${location.pathname === "/profile/chat" ? "active" : ""}`} onClick={() => navigate("/profile/chat")}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.7 12.4C11.7 9.6 13.8 10.3 13.8 8.2C13.8 7.28125 13.1 6.1 11.7 6.1C10.3 6.1 9.6 6.8 8.9 7.5M11.7 16.6V14.5M22.9 11.7C22.9 17.8856 17.8856 22.9 11.7 22.9C5.51441 22.9 0.5 17.8856 0.5 11.7C0.5 5.51441 5.51441 0.5 11.7 0.5C17.8856 0.5 22.9 5.51441 22.9 11.7Z" stroke="#898989" />
                        </svg>
                        <p>Buzón</p>
                        <div className="arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24"><path fill="#000000" d="m14.475 12l-7.35-7.35q-.375-.375-.363-.888t.388-.887t.888-.375t.887.375l7.675 7.7q.3.3.45.675t.15.75t-.15.75t-.45.675l-7.7 7.7q-.375.375-.875.363T7.15 21.1t-.375-.888t.375-.887z" /></svg>
                        </div>
                    </div>
                    <div className={`menu-item ${location.pathname === "/profile/favorites" ? "active" : ""}`} onClick={() => navigate("/profile/favorites")}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.7 12.4C11.7 9.6 13.8 10.3 13.8 8.2C13.8 7.28125 13.1 6.1 11.7 6.1C10.3 6.1 9.6 6.8 8.9 7.5M11.7 16.6V14.5M22.9 11.7C22.9 17.8856 17.8856 22.9 11.7 22.9C5.51441 22.9 0.5 17.8856 0.5 11.7C0.5 5.51441 5.51441 0.5 11.7 0.5C17.8856 0.5 22.9 5.51441 22.9 11.7Z" stroke="#898989" />
                        </svg>
                        <p>Favoritos</p>
                        <div className="arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24"><path fill="#000000" d="m14.475 12l-7.35-7.35q-.375-.375-.363-.888t.388-.887t.888-.375t.887.375l7.675 7.7q.3.3.45.675t.15.75t-.15.75t-.45.675l-7.7 7.7q-.375.375-.875.363T7.15 21.1t-.375-.888t.375-.887z" /></svg>
                        </div>
                    </div>
                    <div
                        className={`menu-item hide-mobile ${location.pathname === "/profile/stats" ? "active" : ""}`}
                        onClick={() => navigate("/profile/stats")}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.7 12.4C11.7 9.6 13.8 10.3 13.8 8.2C13.8 7.28125 13.1 6.1 11.7 6.1C10.3 6.1 9.6 6.8 8.9 7.5M11.7 16.6V14.5M22.9 11.7C22.9 17.8856 17.8856 22.9 11.7 22.9C5.51441 22.9 0.5 17.8856 0.5 11.7C0.5 5.51441 5.51441 0.5 11.7 0.5C17.8856 0.5 22.9 5.51441 22.9 11.7Z" stroke="#898989" />
                        </svg>
                        <p>Estadísticas</p>
                        <div className="arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24"><path fill="#000000" d="m14.475 12l-7.35-7.35q-.375-.375-.363-.888t.388-.887t.888-.375t.887.375l7.675 7.7q.3.3.45.675t.15.75t-.15.75t-.45.675l-7.7 7.7q-.375.375-.875.363T7.15 21.1t-.375-.888t.375-.887z" /></svg>
                        </div>
                    </div>
                    <div className={`menu-item ${location.pathname === "/profile/wallet" ? "active" : ""}`} onClick={() => navigate("/profile/wallet")}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.7 12.4C11.7 9.6 13.8 10.3 13.8 8.2C13.8 7.28125 13.1 6.1 11.7 6.1C10.3 6.1 9.6 6.8 8.9 7.5M11.7 16.6V14.5M22.9 11.7C22.9 17.8856 17.8856 22.9 11.7 22.9C5.51441 22.9 0.5 17.8856 0.5 11.7C0.5 5.51441 5.51441 0.5 11.7 0.5C17.8856 0.5 22.9 5.51441 22.9 11.7Z" stroke="#898989" />
                        </svg>
                        <p>Monedero</p>
                        <div className="arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24"><path fill="#000000" d="m14.475 12l-7.35-7.35q-.375-.375-.363-.888t.388-.887t.888-.375t.887.375l7.675 7.7q.3.3.45.675t.15.75t-.15.75t-.45.675l-7.7 7.7q-.375.375-.875.363T7.15 21.1t-.375-.888t.375-.887z" /></svg>
                        </div>
                    </div>
                    <div className='menu-item' >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.7 12.4C11.7 9.6 13.8 10.3 13.8 8.2C13.8 7.28125 13.1 6.1 11.7 6.1C10.3 6.1 9.6 6.8 8.9 7.5M11.7 16.6V14.5M22.9 11.7C22.9 17.8856 17.8856 22.9 11.7 22.9C5.51441 22.9 0.5 17.8856 0.5 11.7C0.5 5.51441 5.51441 0.5 11.7 0.5C17.8856 0.5 22.9 5.51441 22.9 11.7Z" stroke="#898989" />
                        </svg>
                        <p>Configuración</p>
                        <div className="arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24"><path fill="#000000" d="m14.475 12l-7.35-7.35q-.375-.375-.363-.888t.388-.887t.888-.375t.887.375l7.675 7.7q.3.3.45.675t.15.75t-.15.75t-.45.675l-7.7 7.7q-.375.375-.875.363T7.15 21.1t-.375-.888t.375-.887z" /></svg>
                        </div>
                    </div>
                    <div className='menu-item'>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.7 12.4C11.7 9.6 13.8 10.3 13.8 8.2C13.8 7.28125 13.1 6.1 11.7 6.1C10.3 6.1 9.6 6.8 8.9 7.5M11.7 16.6V14.5M22.9 11.7C22.9 17.8856 17.8856 22.9 11.7 22.9C5.51441 22.9 0.5 17.8856 0.5 11.7C0.5 5.51441 5.51441 0.5 11.7 0.5C17.8856 0.5 22.9 5.51441 22.9 11.7Z" stroke="#898989" />
                        </svg>
                        <p>Ayuda</p>
                        <div className="arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24"><path fill="#000000" d="m14.475 12l-7.35-7.35q-.375-.375-.363-.888t.388-.887t.888-.375t.887.375l7.675 7.7q.3.3.45.675t.15.75t-.15.75t-.45.675l-7.7 7.7q-.375.375-.875.363T7.15 21.1t-.375-.888t.375-.887z" /></svg>
                        </div>
                    </div>
                    <div className='menu-item hide-mobile'>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.7 12.4C11.7 9.6 13.8 10.3 13.8 8.2C13.8 7.28125 13.1 6.1 11.7 6.1C10.3 6.1 9.6 6.8 8.9 7.5M11.7 16.6V14.5M22.9 11.7C22.9 17.8856 17.8856 22.9 11.7 22.9C5.51441 22.9 0.5 17.8856 0.5 11.7C0.5 5.51441 5.51441 0.5 11.7 0.5C17.8856 0.5 22.9 5.51441 22.9 11.7Z" stroke="#898989" />
                        </svg>
                        <p>Preguntas Frecuentes</p>
                        <div className="arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24"><path fill="#000000" d="m14.475 12l-7.35-7.35q-.375-.375-.363-.888t.388-.887t.888-.375t.887.375l7.675 7.7q.3.3.45.675t.15.75t-.15.75t-.45.675l-7.7 7.7q-.375.375-.875.363T7.15 21.1t-.375-.888t.375-.887z" /></svg>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
