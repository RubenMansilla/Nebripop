import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./terms.css";

export default function Terms() {
  return (
    <>
      <Navbar />

      <div className="page-wrapper">
        <h1 className="page-title">Términos y Condiciones</h1>

        <div className="section">
          <h2>1. Uso del servicio</h2>
          <p>
            En Nebripop proporcionamos una plataforma para comprar y vender de forma
            segura y responsable. El uso del servicio implica aceptar estas condiciones.
          </p>
        </div>

        <div className="section">
          <h2>2. Obligaciones del usuario</h2>
          <p>
            Los usuarios deben proporcionar información real, respetar a otros miembros
            de la comunidad y cumplir con las leyes aplicables en su país.
          </p>
        </div>

        <div className="section">
          <h2>3. Artículos permitidos</h2>
          <p>
            Está prohibido publicar productos ilegales, peligrosos o que infrinjan
            derechos de terceros.
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
}
