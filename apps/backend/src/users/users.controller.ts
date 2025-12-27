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
import { ChangePasswordDto } from './change-password.dto';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

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

    @UseGuards(JwtAuthGuard)
    @Patch('change-password')
    async changePassword(
        @Req() req,
        @Body() dto: ChangePasswordDto
    ) {
        // Usamos req.user.id para ser consistentes con tu ProductsController
        const userId = req.user.id;

        return this.usersService.changePassword(
            userId,
            dto.oldPassword,
            dto.newPassword
        );
    }
}
