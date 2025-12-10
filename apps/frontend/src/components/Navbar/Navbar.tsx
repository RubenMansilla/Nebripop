import { useEffect, useState, useRef, useContext } from "react";
import "./Navbar.css";

import logo from "../../assets/logos/nebripop.png";
import searchIcon from "../../assets/iconos/buscar.png";

import { AuthContext } from "../../context/AuthContext";
import { useLoginModal } from "../../context/LoginModalContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const words = ["nintendo", "iPhone", "bicicleta", "PlayStation", "Switch", "patinete", "cámara", "AirPods"];

  const inputRef = useRef<HTMLInputElement | null>(null);
  const wordRef = useRef<HTMLSpanElement | null>(null);
  const placeholderRef = useRef<HTMLDivElement | null>(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { user } = useContext(AuthContext);
  const { openLogin } = useLoginModal();
  const navigate = useNavigate();

  /* ----------------- RESPONSIVE ----------------- */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ----------------- ANIMACIÓN DEL BUSCADOR ----------------- */
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
        <div className="nav-logo" onClick={() => navigate("/")}>
          <img src={logo} alt="nebripop" style={{ cursor: "pointer" }} />
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

        {/* ---------- DESKTOP SIN SESIÓN ---------- */}
        {!isMobile && !user && (
          <>
            <button className="btn-registro" onClick={openLogin}>
              Registrarte o Inicia sesión
            </button>

            <button className="btn-vender" onClick={() => navigate("/sell-product")}>
              Vender <span className="icon-plus">+</span>
            </button>
          </>
        )}

        {/* ---------- DESKTOP CON SESIÓN ---------- */}
        {!isMobile && user && (
          <>
            <button className="btn-registro" onClick={() => navigate(`/profile/info`)}>
              Bienvenido {user.fullName.split(" ")[0]}
            </button>

            <button className="btn-vender" onClick={() => navigate("/sell-product")}>
              Vender <span className="icon-plus">+</span>
            </button>
          </>
        )}

        {/* ---------- MOBILE ---------- */}
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
              <a href="/profile" className="mobile-menu-link">Mi perfil</a>
            )}

            <div
              className="mobile-menu-link"
              onClick={() => navigate("/sell-product")}
            >
              Vender artículos
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
