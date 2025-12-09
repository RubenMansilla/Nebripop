import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./Sustainability.css";

export default function Sustainability() {
  return (
    <>
      <Navbar />

      <div className="page-wrapper">
        <h1 className="page-title">Sostenibilidad</h1>

        <section className="section">
          <h2>Nuestra visión ecológica</h2>
          <p>
            La economía circular es la base de Nebripop. Ayudamos a reducir residuos 
            fomentando la reutilización de productos.
          </p>
        </section>

        <section className="section image-section">
          <img src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6" alt="Sostenibilidad" />
          <div>
            <h2>Impacto positivo</h2>
            <p>
              Dando una segunda vida a los artículos evitamos toneladas de desechos y 
              contribuimos a un consumo más inteligente.
            </p>
          </div>
        </section>

        <section className="section">
          <h2>Compromiso futuro</h2>
          <p>
            Estamos desarrollando nuevas herramientas para medir el impacto ambiental de 
            cada producto reutilizado dentro de Nebripop.
          </p>
        </section>
      </div>

      <Footer />
    </>
  );
}
