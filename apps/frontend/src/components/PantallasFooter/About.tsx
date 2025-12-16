import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./About.css";

export default function About() {
  return (
    <>
      <Navbar />

      <div className="page-wrapper">
        <h1 className="page-title">Quiénes Somos</h1>

        <div className="section">
          <p>
            En Nebripop conectamos a personas que desean comprar y vender de forma
            segura, rápida y cercana. Apostamos por la economía circular, el consumo
            responsable y una comunidad basada en confianza.
          </p>
        </div>

        <div className="image-section">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
            alt="Equipo Nebripop"
          />
          <img
            src="https://images.unsplash.com/photo-1560264280-88b68371db39"
            alt="Tecnología Nebripop"
          />
        </div>

        <div className="section">
          <h2>Nuestra misión</h2>
          <p>
            Queremos que cada persona pueda dar una segunda vida a sus objetos, ahorrar
            dinero y encontrar oportunidades cerca de casa. Creamos herramientas modernas
            que hacen la experiencia más segura, transparente y rápida.
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
}
