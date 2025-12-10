import { useEffect, useState, useRef } from "react";
import "./Navbar.css";

import logo from "../../assets/logos/nebripop.png";
import searchIcon from "../../assets/iconos/buscar.png";

import { AuthContext } from "../../context/AuthContext";
import { useLoginModal } from "../../context/LoginModalContext";

export default function Navbar() {
  const words = ["nintendo", "iPhone", "bicicleta", "PlayStation", "Switch", "patinete", "cámara", "AirPods"];

  const inputRef = useRef<HTMLInputElement | null>(null);
  const wordRef = useRef<HTMLSpanElement | null>(null);
  const placeholderRef = useRef<HTMLDivElement | null>(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { user } = useContext(AuthContext);
  const { openLogin } = useLoginModal();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // -------- ANIMACIÓN BUSCADOR --------
  useEffect(() => {
    let i = 0;
    let timer: any;

    function startRotate() {
      stopRotate();
      timer = setInterval(() => {
        const input = inputRef.current;
        if (!input) return;

        if (document.activeElement === input || input.value.trim().length > 0) return;

        i = (i + 1) % words.length;

        if (wordRef.current) {
          wordRef.current.textContent = words[i];
          wordRef.current.classList.remove("fade");
          void wordRef.current.offsetWidth;
          wordRef.current.classList.add("fade");
        }
      }, 1800);
    }

    function stopRotate() {
      if (timer) clearInterval(timer);
    }

    const handleInput = () => {
      const input = inputRef.current;
      if (!input) return;

      if (input.value.trim().length) {
        stopRotate();
        if (placeholderRef.current) {
          placeholderRef.current.style.opacity = "0";
          placeholderRef.current.style.visibility = "hidden";
        }
      } else {
        if (placeholderRef.current) {
          placeholderRef.current.style.opacity = "1";
          placeholderRef.current.style.visibility = "visible";
        }
        startRotate();
      }
    };

    const input = inputRef.current;
    if (input) input.addEventListener("input", handleInput);

    startRotate();

    return () => {
      if (input) input.removeEventListener("input", handleInput);
      stopRotate();
    };
  }, []);

  return (
    <nav className="navbar">
      {/* IZQUIERDA */}
      <div className="nav-left">
        <div className="nav-logo">
          <img src={logo} alt="nebripop" />
        </div>
      </div>

      {/* CENTRO */}
      <div className="nav-center">
        <div className="search-wrap">
          <input ref={inputRef} className="search" type="text" placeholder=" " />

          <img src={searchIcon} className="icon" />

          <div className="fake-placeholder" ref={placeholderRef}>
            <span className="buscar">Busca</span>
            <b ref={wordRef}>nintendo</b>
          </div>
        </div>
      </div>

      {/* DERECHA */}
      <div className="nav-right">
        {!isMobile && (
          <>
            {!user ? (
              <button className="btn-registro" onClick={openLogin}>
                Registrarte o Inicia sesión
              </button>
            ) : (
              <div className="nav-user">
                <span className="nav-username">{user.fullName}</span>
                <a href="/profile" className="nav-profile-link">Mi perfil</a>
              </div>
            )}

            <button className="btn-vender">
              Vender <span className="icon-plus">+</span>
            </button>
          </>
        )}

        {isMobile && (
          <button className="hamb-menu" onClick={() => setUserMenuOpen(!userMenuOpen)}>
            ☰
          </button>
        )}

        {isMobile && userMenuOpen && (
          <div className="mobile-user-menu">
            {!user ? (
              <div onClick={openLogin} className="mobile-menu-link">
                Registrarte o Iniciar sesión
              </div>
            ) : (
              <a href="/profile" className="mobile-menu-link">
                Mi perfil
              </a>
            )}

            <a href="/vender" className="mobile-menu-link">
              Vender artículos
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
