import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendPasswordResetEmail(to: string, resetLink: string) {
    const from =
      this.config.get<string>('EMAIL_FROM') || 'Equipo Nebripop <nebripop@gmail.com>';

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject: 'Recuperar contraseña - Nebripop',
        html: `
          <html lang="es">
          <body>
            <div style="font-family: Arial, sans-serif; line-height: 1.4; color: #333;">
              <h2 style="color: #6d5a45;">Recuperar contraseña</h2>
              <p>Has solicitado cambiar tu contraseña en Nebripop.</p>
              <p>Pulsa el siguiente botón para crear una nueva contraseña:</p>
              <p style="margin: 20px 0;">
                <a href="${resetLink}" style="background-color: #d6c6b0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Restablecer contraseña</a>
              </p>
              <p style="font-size: 13px; color: #666;">O copia y pega este enlace en tu navegador:<br>
              <a href="${resetLink}" style="color: #c2a98a;">${resetLink}</a></p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #999;">Este enlace caduca en 15 minutos. Si no has sido tú, ignora este correo de forma segura.</p>
            </div>
          </body>
          </html>
        `,
      });

    } catch (err) {
      console.error("Error al enviar email con Nodemailer:", err);
      throw err;
    }
  }
}
