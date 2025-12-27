import { useEffect, useState, useRef, useContext } from "react";
import "./Navbar.css";

import logo from "../../assets/logos/nebripop.png";
import searchIcon from "../../assets/iconos/buscar.png";

import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLoginModal } from "../../context/LoginModalContext";

export default function Navbar() {

  const { openLogin } = useLoginModal();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  /* ---------------------------------------------
     PALABRAS ANIMADAS DEL BUSCADOR
  --------------------------------------------- */
  const words = ["nintendo", "iPhone", "bicicleta", "PlayStation", "Switch", "patinete", "cámara", "AirPods"];

  const inputRef = useRef(null);
  const wordRef = useRef(null);
  const placeholderRef = useRef(null);

  /* ---------------------------------------------
     🔥 ESTADO PARA LOS 3 BREAKPOINTS
     - mobile: < 600px
     - tablet: 600–1000px
     - desktop: > 1000px
  --------------------------------------------- */
  const [screenSize, setScreenSize] = useState("desktop");

  useEffect(() => {
    const updateScreen = () => {
      if (window.innerWidth < 800) {
        setScreenSize("mobile");
      } else if (window.innerWidth < 1000) {
        setScreenSize("tablet");
      } else {
        setScreenSize("desktop");
      }
    };

    updateScreen();
    window.addEventListener("resize", updateScreen);
    return () => window.removeEventListener("resize", updateScreen);
  }, []);

  /* ---------------------------------------------
     ESTADO DEL MENÚ HAMBURGUESA
  --------------------------------------------- */
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  /* ---------------------------------------------
     ANIMACIÓN DEL BUSCADOR
  --------------------------------------------- */
  useEffect(() => {
    let i = 0;
    let timer;

    function startRotate() {
      stopRotate();
      timer = setInterval(() => {
        const input = inputRef.current;
        if (!input) return;

        if (document.activeElement === input || input.value.trim().length > 0)
          return;

        i = (i + 1) % words.length;

        wordRef.current.textContent = words[i];
        wordRef.current.classList.remove("fade");
        void wordRef.current.offsetWidth;
        wordRef.current.classList.add("fade");
      }, 1800);
    }

    function stopRotate() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    const handleInput = () => {
      const input = inputRef.current;
      if (input.value.trim().length) {
        stopRotate();
        placeholderRef.current.style.opacity = 0;
        placeholderRef.current.style.visibility = "hidden";
      } else {
        placeholderRef.current.style.opacity = 1;
        placeholderRef.current.style.visibility = "visible";
        startRotate();
      }
    };

    const input = inputRef.current;
    input.addEventListener("input", handleInput);
    startRotate();

    return () => {
      input.removeEventListener("input", handleInput);
      stopRotate();
    };
  }, []);

  /* ---------------------------------------------
     🔥 RETURN COMPLETO CON 3 NAVBARS
  --------------------------------------------- */
  return (
    <>
      {/* ============================================================
          📱 NAVBAR MÓVIL (<600px)
      ============================================================ */}
      {screenSize === "mobile" && (
        <nav className="navbar-mobile">

          <div className="mobile-top">
            <div className="mobile-logo" onClick={() => navigate("/")}>
              <img src={logo} alt="nebripop" />
            </div>

            <button
              className="mobile-hamb"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              ☰
            </button>
          </div>

          <div className="mobile-search">
            <div className="search-wrap">
              <input ref={inputRef} className="search" type="text" placeholder=" " />
              <img src={searchIcon} className="icon" />
              <div className="fake-placeholder" ref={placeholderRef}>
                <span className="buscar">Busca</span>
                <b ref={wordRef}>nintendo</b>
              </div>
            </div>
          </div>

          {userMenuOpen && (
            <div className="mobile-popover">
              {!user && (
                <p className="mobile-popover-item" onClick={openLogin}>
                  Registrarte o iniciar sesión
                </p>
              )}

              {user && (
                <p
                  className="mobile-popover-item"
                  onClick={() => navigate(window.innerWidth < 990 ? "/you" : "/catalog/published")}
                >
                  Mi perfil
                </p>
              )}

              <p
                className="mobile-popover-item"
                onClick={() => navigate("/sell-product")}
              >
                Vender artículos
              </p>
            </div>
          )}


        </nav>
      )}

      {/* ============================================================
          📱 NAVBAR TABLET (600–1000px)
      ============================================================ */}
      {screenSize === "tablet" && (
        <nav className="navbar-tablet">

          <div className="nav-left">
            <div className="nav-logo" onClick={() => navigate("/")}>
              <img src={logo} alt="nebripop" />
            </div>
          </div>

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

          <div className="nav-right">
            {!user && (
              <button className="btn-vender" onClick={() => navigate("/sell-product")}>
                Vender <span className="icon-plus">+</span>
              </button>
            )}

            {user && (
              <>
                <button className="btn-registro"
                  onClick={() => navigate(window.innerWidth < 990 ? "/you" : "/catalog/published")}>
                  {user.fullName.split(" ")[0]}
                </button>

                <button className="btn-vender" onClick={() => navigate("/sell-product")}>
                  Vender <span className="icon-plus">+</span>
                </button>
              </>
            )}
          </div>

        </nav>
      )}

      {/* ============================================================
          🖥️ NAVBAR ESCRITORIO (>1000px)
      ============================================================ */}
      {screenSize === "desktop" && (
        <nav className="navbar">

          <div className="nav-left">
            <div className="nav-logo" onClick={() => navigate("/")}>
              <img src={logo} alt="nebripop" style={{ cursor: "pointer" }} />
            </div>
          </div>

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

          <div className="nav-right">

            {!user && (
              <>
                <button className="btn-registro" onClick={openLogin}>Registrarte o Inicia sesión</button>
                <button className="btn-vender" onClick={() => navigate("/sell-product")}>
                  Vender <span className="icon-plus">+</span>
                </button>
              </>
            )}

            {user && (
              <>
                <button className="btn-registro"
                  onClick={() => navigate(window.innerWidth < 990 ? "/you" : "/catalog/published")}>
                  Bienvenido {user.fullName.split(" ")[0]}
                </button>
                <button className="btn-vender" onClick={() => navigate("/sell-product")}>
                  Vender <span className="icon-plus">+</span>
                </button>
              </>
            )}

          </div>


        </nav>
      )}
    </>
  );
}
