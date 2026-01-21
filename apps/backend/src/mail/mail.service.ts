import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor(private config: ConfigService) {
    this.resend = new Resend(this.config.get<string>('RESEND_API_KEY'));
  }

  async sendPasswordResetEmail(to: string, resetLink: string) {
    const from =
      this.config.get<string>('EMAIL_FROM') || 'Wallastock <onboarding@resend.dev>';

    await this.resend.emails.send({
      from,
      to,
      subject: 'Recuperar contraseña - Wallastock',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.4">
          <h2>Recuperar contraseña</h2>
          <p>Has solicitado cambiar tu contraseña.</p>
          <p>Pulsa aquí para crear una nueva:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>Este enlace caduca en 15 minutos.</p>
          <p>Si no has sido tú, ignora este correo.</p>
        </div>
      `,
    });
  }
}
