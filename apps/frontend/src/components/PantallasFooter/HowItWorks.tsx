import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./HowItWorks.css";

export default function HowItWorks() {
  return (
    <>
      <Navbar />

      <div className="page-wrapper">
        <h1 className="page-title">Cómo Funciona</h1>

        <section className="section">
          <h2>1. Publica tu producto</h2>
          <p>
            Sube fotos, añade una descripción y fija un precio. Nuestro sistema inteligente
            te ayudará a posicionar bien tu anuncio.
          </p>
        </section>

        <section className="section image-section">
          <img src="https://images.unsplash.com/photo-1557804506-669a67965ba0" alt="Publicar producto" />
          <div>
            <h2>2. Conecta con compradores</h2>
            <p>
              Habla directamente con los usuarios interesados, negocia el precio y acuerda
              un punto seguro para el intercambio.
            </p>
          </div>
        </section>

        <section className="section">
          <h2>3. Vende de forma segura</h2>
          <p>
            Nebripop fomenta acuerdos seguros y responsables entre particulares,
            evitando estafas y garantizando una comunidad limpia.
          </p>
        </section>
      </div>

      <Footer />
    </>
  );
}
