import "./Footer.css";
import apple from "../../assets/iconos/Apple.png";
import huawei from "../../assets/iconos/Huawei.png";
import android from "../../assets/iconos/Android.png";
import facebook from "../../assets/iconos/Facebook.png";
import instagram from "../../assets/iconos/Instagram.png";
import twitter from "../../assets/iconos/Twitter.png";
import paypal from "../../assets/iconos/PayPal.png";
import visa from "../../assets/iconos/Visa.png";

export default function Footer() {
  return (
    <footer className="footer">

      {/* TOP SECTION (BEIGE) */}
      <div className="footer-top-bg">
        <div className="footer-container footer-top">
          
          <div className="footer-column">
            <h4>NEBRIPOP</h4>
            <a href="#">Quiénes somos</a>
            <a href="#">Cómo funciona</a>
            <a href="#">Empleo</a>
            <a href="#">Sostenibilidad</a>
            <p className="footer-address">
              Calle Joaquín María López, 25 Madrid 28019
            </p>
          </div>

          <div className="footer-column">
            <h4>SOPORTE</h4>
            <a href="#">Ayuda</a>
            <a href="#">Consejos de seguridad</a>
            <a href="#">Normas de la comunidad</a>
          </div>

          <div className="footer-column">
            <h4>LEGAL</h4>
            <a href="#">Política de Privacidad</a>
            <a href="#">Condiciones de uso</a>
          </div>

          <div className="footer-column subscribe">
            <h4>SUSCRÍBETE</h4>
            <p>
              Introduce tu email y obtén notificaciones <br />
              sobre novedades y mejoras.
            </p>
            <input type="email" placeholder="Email" />
            <p className="copyright">© InstitutosNebrija</p>

            <div className="payment-logos">
              <img src={paypal} alt="PayPal" />
              <img src={visa} alt="Visa" />
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM SECTION (WHITE) */}
      <div className="footer-bottom-bg">
        <div className="footer-container footer-bottom">

          <div className="stores">
            <a className="store">
              <img src={apple} /> Apple Store
            </a>
            <a className="store">
              <img src={huawei} /> AppGallery
            </a>
            <a className="store">
              <img src={android} /> Google Play
            </a>
          </div>

          <div className="social">
            <a className="social-icon"><img src={facebook} /></a>
            <a className="social-icon"><img src={instagram} /></a>
            <a className="social-icon"><img src={twitter} /></a>
          </div>

        </div>
      </div>

    </footer>
  );
}
