import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./Jobs.css";

export default function Jobs() {
  return (
    <>
      <Navbar />

      <div className="page-wrapper">
        <h1 className="page-title">Empleo</h1>

        <section className="section">
          <h2>Únete a Nebripop</h2>
          <p>
            Buscamos talento creativo, responsable y con ganas de cambiar la manera en la
            que las personas compran y venden en internet.
          </p>
        </section>

        <section className="section image-section">
          <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df" alt="Equipo trabajando" />
          <div>
            <h2>¿Qué perfiles buscamos?</h2>
            <p>
              Desde desarrolladores y diseñadores UX hasta especialistas en marketing,
              soporte al cliente y crecimiento de producto.
            </p>
          </div>
        </section>

        <section className="section">
          <h2>Cultura Nebripop</h2>
          <p>
            Fomentamos un ambiente flexible, transparente y colaborativo. Valoramos la
            innovación, la sostenibilidad y la experiencia de usuario.
          </p>
        </section>
      </div>

      <Footer />
    </>
  );
}
