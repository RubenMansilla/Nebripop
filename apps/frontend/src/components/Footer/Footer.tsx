import React, { type JSX } from "react";
import "./Footer.css";

import apple from "../../assets/iconos/apple.png";
import huawei from "../../assets/iconos/huawei.png";
import android from "../../assets/iconos/android.png";
import facebook from "../../assets/iconos/facebook.png";
import instagram from "../../assets/iconos/instagram.png";
import twitter from "../../assets/iconos/twitter.png";
import paypal from "../../assets/iconos/paypal.png";
import visa from "../../assets/iconos/visa.png";

export default function Footer(): JSX.Element {
  return (
    <footer className="footer">

      <div className="footer-top-bg">
        <div className="footer-container footer-top">

          <div className="footer-column">
            <h4>NEBRIPOP</h4>
            <a href="/quienes-somos">Quiénes somos</a>
            <a href="/como-funciona">Cómo funciona</a>
            <a href="/empleo">Empleo</a>
            <a href="/sostenibilidad">Sostenibilidad</a>
            <p className="footer-address">
              Calle Joaquín María López, 25 Madrid 28019
            </p>
          </div>

          <div className="footer-column">
            <h4>SOPORTE</h4>
            <a href="/ayuda">Ayuda</a>
            <a href="/seguridad">Consejos de seguridad</a>
            <a href="/normas">Normas de la comunidad</a>
          </div>

          <div className="footer-column">
            <h4>LEGAL</h4>
            <a href="/privacidad">Política de Privacidad</a>
            <a href="/condiciones">Condiciones de uso</a>
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

      <div className="footer-bottom-bg">
        <div className="footer-container footer-bottom">

          <div className="stores">
            <a className="store"><img src={apple} /> Apple Store</a>
            <a className="store"><img src={huawei} /> AppGallery</a>
            <a className="store"><img src={android} /> Google Play</a>
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
