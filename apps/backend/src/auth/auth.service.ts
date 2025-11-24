import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async login(email: string, password: string) {
    // Esto es provisional hasta que montéis el login real
    return {
      message: "Login correcto (FAKE hasta implementar usuarios)",
      email,
    };
  }
}
