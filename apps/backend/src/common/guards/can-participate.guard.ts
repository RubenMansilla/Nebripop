import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { UsersService } from '../../users/users.service';

/**
 * Guard para verificar si un usuario puede participar en subastas
 * Bloquea a usuarios con penalty_level >= 2 (Strike 2 o Strike 3)
 * 
 * Uso:
 * @UseGuards(JwtAuthGuard, CanParticipateGuard)
 * @Post('create')
 * createAuction() { ... }
 */
@Injectable()
export class CanParticipateGuard implements CanActivate {
    constructor(private usersService: UsersService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.id) {
            throw new ForbiddenException('Usuario no autenticado');
        }

        const canParticipate = await this.usersService.canParticipateInAuctions(user.id);

        if (!canParticipate) {
            throw new ForbiddenException(
                'No puedes participar en subastas debido a penalizaciones activas. ' +
                'Tienes restricciones por incumplimientos previos.'
            );
        }

        return true;
    }
}
