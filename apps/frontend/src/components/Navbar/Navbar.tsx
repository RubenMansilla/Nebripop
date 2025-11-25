import { useEffect, useRef } from "react";
import "./Navbar.css";

import logo from "../../assets/logos/nebripop.png";
import searchIcon from "../../assets/iconos/buscar.png";

// 👉 IMPORTACIÓN NECESARIA
import { useLoginModal } from "../../context/LoginModalContext";

export default function Navbar() {
  const { openLogin } = useLoginModal(); // 👉 aquí obtenemos la función para abrir el popup

  const words = [
    "nintendo",
    "iPhone",
    "bicicleta",
    "PlayStation",
    "Switch",
    "patinete",
    "cámara",
    "AirPods",
  ];

  const inputRef = useRef(null);
  const wordRef = useRef(null);
  const placeholderRef = useRef(null);

  /* ============ ANIMACIÓN DEL BUSCADOR ============ */
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

  return (
    <nav className="navbar">

      {/* ZONA IZQUIERDA */}
      <div className="nav-left">
        <div className="nav-logo">
          <img src={logo} alt="nebripop" />
        </div>
      </div>

      {/* ZONA CENTRAL */}
      <div className="nav-center">
        <div className="search-wrap">
          <input
            ref={inputRef}
            className="search"
            type="text"
            placeholder=" "
          />

          <img src={searchIcon} className="icon" />

          <div className="fake-placeholder" ref={placeholderRef}>
            <span className="buscar">Busca</span>
            <b ref={wordRef}>nintendo</b>
          </div>
        </div>
      </div>

      {/* ZONA DERECHA */}
      <div className="nav-right">

        {/* 🔥 ESTE BOTÓN AHORA ABRE EL POPUP */}
        <button className="btn-registro" onClick={openLogin}>
          Registrarte o Inicia sesión
        </button>

        <button className="btn-vender">
          Vender <span className="icon-plus">+</span>
        </button>
      </div>

    </nav>
  );
}
