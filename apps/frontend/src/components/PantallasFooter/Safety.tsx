import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./Safety.css";

export default function Safety() {
  return (
    <>
      <Navbar />

      <div className="page-wrapper">
        <h1 className="page-title">Consejos de Seguridad</h1>

        <section className="section">
          <h2>Compra y vende con confianza</h2>
          <p>
            Nuestra prioridad es que todos los usuarios de Nebripop operen de forma segura
            y sin riesgos. Sigue estas recomendaciones para una experiencia protegida.
          </p>
        </section>

        <section className="section image-section">
          <img src="https://images.unsplash.com/photo-1553729459-efe14ef6055d" alt="Seguridad Nebripop" />
          <div>
            <h2>Intercambios seguros</h2>
            <p>
              Reúnete siempre en lugares públicos y evita compartir datos personales no
              necesarios. Si algún usuario genera desconfianza, repórtalo.
            </p>
          </div>
        </section>

        <section className="section">
          <h2>Detecta señales de fraude</h2>
          <p>
            Desconfía de ofertas demasiado buenas, presiones por cerrar rápido la compra o
            solicitudes de pagos fuera de la plataforma.
          </p>
        </section>
      </div>

      <Footer />
    </>
  );
}
