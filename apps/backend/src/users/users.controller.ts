import {
  Controller,
  Patch,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Req,
  Get,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Actualizar datos del usuario
  @UseGuards(JwtAuthGuard)
  @Patch('update')
  updateUser(@Req() req, @Body() body) {
    return this.usersService.updateUser(req.user.id, body);
  }

  // Subir imagen de perfil
  @UseGuards(JwtAuthGuard)
  @Patch('profile-picture')
  @UseInterceptors(FileInterceptor('file'))
  uploadProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    return this.usersService.updateProfilePicture(req.user.id, file);
  }

  // ✅ PERFIL PÚBLICO
  @Get('public/:id')
  getPublicUser(@Param('id') id: number) {
    return this.usersService.getPublicUser(id);
  }
}
