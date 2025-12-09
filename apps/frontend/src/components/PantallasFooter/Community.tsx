import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./Community.css";

export default function Community() {
  return (
    <>
      <Navbar />

      <div className="page-wrapper">
        <h1 className="page-title">Normas de la Comunidad</h1>

        <section className="section">
          <h2>Un espacio respetuoso para todos</h2>
          <p>
            En Nebripop fomentamos una comunidad segura, amable y responsable. 
            Para ello, todos los usuarios deben seguir normas básicas de convivencia.
          </p>
        </section>

        <section className="section image-section">
          <img src="https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a" alt="Comunidad Nebripop" />
          <div>
            <h2>Respeto y transparencia</h2>
            <p>
              Trata a otros usuarios con educación, sé claro con las descripciones de tus
              productos y evita cualquier conducta abusiva.
            </p>
          </div>
        </section>

        <section className="section">
          <h2>Prohibiciones</h2>
          <p>
            Está prohibido vender artículos ilegales, engañosos o peligrosos. Cualquier
            violación puede suponer la suspensión de la cuenta.
          </p>
        </section>
      </div>

      <Footer />
    </>
  );
}
