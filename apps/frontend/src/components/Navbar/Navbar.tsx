import { useEffect, useState, useRef, useContext } from "react";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useLoginModal } from "../../context/LoginModalContext";

// API
import { getAllProducts } from "../../api/products.api";

// Assets
import logo from "../../assets/logos/nebripop.png";
import logoSmall from "../../assets/logos/nebripop-fav-icon.png";
import searchIcon from "../../assets/iconos/buscar.png";

export default function Navbar() {
  const { openLogin } = useLoginModal();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const profilePic = user?.profilePicture || logoSmall;

  // Refs para animación
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wordRef = useRef<HTMLSpanElement | null>(null);
  const placeholderRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Estados de Búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Estados de Interfaz
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 600) return "mobile";
      if (window.innerWidth < 1050) return "tablet";
    }
    return "desktop";
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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

  /* 1. LÓGICA DE BÚSQUEDA */
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const fetchResults = async () => {
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const allProducts = await getAllProducts();
        const filtered = allProducts.filter(
          (p: any) =>
            p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        setSearchResults(filtered.slice(0, 6));
      } catch (error) {
        console.error("Error en búsqueda:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  /* 2. CERRAR DROPDOWN AL HACER CLICK FUERA */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProductSelect = (productId: any) => {
    setShowDropdown(false);
    setSearchQuery("");
    if (inputRef.current) inputRef.current.value = "";
    navigate(`/product/${productId}`);
  };

  /* 3. RESPONSIVE (TU LÓGICA ORIGINAL) */
  useEffect(() => {
    const updateScreen = () => {
      if (window.innerWidth < 600) setScreenSize("mobile");
      else if (window.innerWidth < 1050) setScreenSize("tablet");
      else setScreenSize("desktop");
    };
    updateScreen();
    window.addEventListener("resize", updateScreen);
    return () => window.removeEventListener("resize", updateScreen);
  }, []);

  /* 4. ANIMACIÓN  */
  useEffect(() => {
    let i = 0;
    let timer: number | undefined;

    const stopRotate = () => {
      if (timer) window.clearInterval(timer);
    };

    const startRotate = () => {
      stopRotate();
      timer = window.setInterval(() => {
        // Si hay texto escrito, no rotamos
        if (searchQuery.length > 0) return;

        i = (i + 1) % words.length;
        if (wordRef.current) {
          wordRef.current.textContent = words[i];
          wordRef.current.classList.remove("fade");
          void wordRef.current.offsetWidth;
          wordRef.current.classList.add("fade");
        }
      }, 1800);
    };

    startRotate();

    return () => stopRotate();
  }, [screenSize, searchQuery]);

  /* COMPONENTE INTERNO PARA NO REPETIR CÓDIGO DEL DROPDOWN */
  const ResultsDropdown = () => (
    <div className="search-results-dropdown" ref={dropdownRef}>
      {isSearching ? (
        <div className="search-status">Buscando...</div>
      ) : searchResults.length > 0 ? (
        searchResults.map((product) => (
          <div
            key={product.id}
            className="search-item"
            onClick={() => handleProductSelect(product.id)}
          >
            <img
              src={product.images?.[0]?.image_url || "/no-image.webp"}
              alt={product.name}
              className="search-item-img"
            />
            <div className="search-item-info">
              <p className="search-item-name">{product.name}</p>
              <p className="search-item-meta">{product.price}€</p>
            </div>
          </div>
        ))
      ) : (
        <div className="search-status">No se encontraron productos</div>
      )}
    </div>
  );

  return (
    <div className="header-block-container">
      {/* MOBILE */}
      {screenSize === "mobile" && (
        <nav className="navbar-mobile">
          <div className="mobile-top">
            <div className="mobile-logo" onClick={() => navigate("/")}>
              <img src={logoSmall} alt="logo" />
            </div>
            <div className="mobile-search">
              <div className="search-wrap">
                <input
                  ref={inputRef}
                  className="search"
                  type="text"
                  aria-label="Buscar"
                  placeholder=" "
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} // Esto actualiza el estado
                />
                <img src={searchIcon} className="icon" alt="buscar" />

                {/* MODIFICACIÓN AQUÍ: Añadimos la clase 'hidden' si searchQuery tiene texto */}
                <div
                  className={`fake-placeholder ${searchQuery.length > 0 ? "hidden" : ""}`}
                  ref={placeholderRef}
                >
                  <span className="buscar">Busca</span>
                  <b ref={wordRef}>nintendo</b>
                </div>

                {showDropdown && <ResultsDropdown />}
              </div>
            </div>
            <button
              className="mobile-hamb"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              ☰
            </button>
          </div>
          {userMenuOpen && (
            <div className="mobile-popover">
              {!user ? (
                <p className="mobile-popover-item" onClick={openLogin}>
                  Registrarte o iniciar sesión
                </p>
              ) : (
                <p
                  className="mobile-popover-item"
                  onClick={() => navigate("/you")}
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
              <p
                className="mobile-popover-item"
                onClick={() => navigate("/auctions")}
              >
                Subastas
              </p>
            </div>
          )}
        </nav>
      )}

      {/* TABLET */}
      {screenSize === "tablet" && (
        <nav className="navbar-tablet">
          <div className="nav-left" onClick={() => navigate("/")}>
            <div className="nav-logo">
              <img className="logo-pc" src={logo} alt="logo" />
              <img className="logo-small" src={logoSmall} alt="logo" />
            </div>
          </div>
          <div className="nav-center">
            <div className="search-wrap">
              <input
                ref={inputRef}
                className="search"
                type="text"
                aria-label="Buscar"
                placeholder=" "
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} // Esto actualiza el estado
              />
              <img src={searchIcon} className="icon" alt="buscar" />

              <div
                className={`fake-placeholder ${searchQuery.length > 0 ? "hidden" : ""}`}
                ref={placeholderRef}
              >
                <span className="buscar">Busca</span>
                <b ref={wordRef}>nintendo</b>
              </div>

              {showDropdown && <ResultsDropdown />}
            </div>
          </div>
          <div className="nav-right">
            {!user ? (
              <button className="btn-registro" onClick={openLogin}>
                Inicia sesión
              </button>
            ) : (
              <div
                className="profile-pic-container"
                onClick={() => navigate("/you")}
              >
                <img src={profilePic} alt="perfil" />
                <p>Tú</p>
              </div>
            )}
            <button
              className="mobile-hamb"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              ☰
            </button>
            {userMenuOpen && (
              <div className="mobile-popover">
                <p
                  className="mobile-popover-item"
                  onClick={() => navigate("/auctions")}
                >
                  Subastas
                </p>
                <p
                  className="mobile-popover-item"
                  onClick={() => navigate("/sell-product")}
                >
                  Vender artículos
                </p>
              </div>
            )}
          </div>
        </nav>
      )}

      {/* DESKTOP */}
      {screenSize === "desktop" && (
        <nav className="navbar">
          <div className="nav-left" onClick={() => navigate("/")}>
            <div className="nav-logo">
              <img src={logo} alt="logo" />
            </div>
          </div>
          <div className="nav-center">
            <div className="search-wrap">
              <input
                ref={inputRef}
                className="search"
                type="text"
                aria-label="Buscar"
                placeholder=" "
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} // Esto actualiza el estado
              />
              <img src={searchIcon} className="icon" alt="buscar" />

              {/* MODIFICACIÓN AQUÍ: Añadimos la clase 'hidden' si searchQuery tiene texto */}
              <div
                className={`fake-placeholder ${searchQuery.length > 0 ? "hidden" : ""}`}
                ref={placeholderRef}
              >
                <span className="buscar">Busca</span>
                <b ref={wordRef}>nintendo</b>
              </div>

              {showDropdown && <ResultsDropdown />}
            </div>
          </div>
          <div className="nav-right">
            {!user ? (
              <button className="btn-registro" onClick={openLogin}>
                Registrarte o Inicia sesión
              </button>
            ) : (
              <div
                className="profile-pic-container"
                onClick={() => navigate("/you")}
              >
                <img src={profilePic} alt="perfil" />
                <p>Tú</p>
              </div>
            )}
            <button
              className="btn-subastas"
              onClick={() => navigate("/auctions")}
            >
              Subastas
            </button>
            <button
              className="btn-vender"
              onClick={() => navigate("/sell-product")}
            >
              Vender<span className="icon-plus">+</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
