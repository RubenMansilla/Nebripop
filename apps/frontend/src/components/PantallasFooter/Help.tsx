import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./Help.css";

export default function Help() {
  return (
    <>
      <Navbar />

      <div className="page-wrapper">
        <h1 className="page-title">Ayuda</h1>

        <section className="section">
          <h2>Centro de Ayuda Nebripop</h2>
          <p>
            Aquí encontrarás respuestas a las dudas más comunes sobre cómo comprar,
            vender, gestionar tu perfil y resolver problemas dentro de Nebripop.
          </p>
        </section>

        <section className="section image-section">
          <img src="https://images.unsplash.com/photo-1525182008055-f88b95ff7980" alt="Soporte Nebripop" />
          <div>
            <h2>¿Problemas con tu cuenta?</h2>
            <p>
              Si tienes dificultades para iniciar sesión, cambiar tu correo o recuperar tu
              contraseña, nuestro equipo te ayudará paso a paso.
            </p>
          </div>
        </section>

        <section className="section">
          <h2>Preguntas Frecuentes</h2>
          <p>Consulta las FAQ sobre pagos, envíos, seguridad, chat y disputas.</p>
        </section>
      </div>

      <Footer />
    </>
  );
}
