import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CaptchaService {
  async verifyToken(token: string): Promise<boolean> {
    const secret = process.env.RECAPTCHA_SECRET;

    if (!token) return false;

    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret,
          response: token,
        },
      }
    );

    return response.data.success === true;
  }
}
