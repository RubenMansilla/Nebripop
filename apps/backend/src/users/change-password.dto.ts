import { IsNotEmpty, MinLength, IsString } from 'class-validator';

export class ChangePasswordDto {
    @IsString()
    @IsNotEmpty({ message: 'La contraseña actual es obligatoria' })
    oldPassword: string;

    @IsString()
    @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
    @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
    newPassword: string;
}