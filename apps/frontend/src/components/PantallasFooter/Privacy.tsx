import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./privacy.css";

export default function Privacy() {
  return (
    <>
      <Navbar />

      <div className="page-wrapper">
        <h1 className="page-title">Política de Privacidad</h1>

        <div className="section">
          <h2>1. Información que recopilamos</h2>
          <p>
            Recopilamos datos necesarios para ofrecer nuestros servicios, como email,
            nombre de usuario y actividad dentro de la plataforma.
          </p>
        </div>

        <div className="section">
          <h2>2. Cómo usamos tus datos</h2>
          <p>
            Utilizamos la información para mejorar la experiencia de usuario, garantizar
            la seguridad y facilitar las transacciones.
          </p>
        </div>

        <div className="section">
          <h2>3. Protección de la información</h2>
          <p>
            Aplicamos medidas de seguridad técnicas y organizativas para proteger tu
            privacidad y evitar accesos no autorizados.
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
}
