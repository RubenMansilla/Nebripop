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
  Query,
  Post,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { ChangePasswordDto } from "./change-password.dto";

@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) { }

  @UseGuards(JwtAuthGuard)
  @Patch("update")
  updateUser(@Req() req, @Body() body) {
    return this.usersService.updateUser(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("profile-picture")
  @UseInterceptors(FileInterceptor("file"))
  uploadProfilePicture(@UploadedFile() file: Express.Multer.File, @Req() req) {
    return this.usersService.updateProfilePicture(req.user.id, file);
  }

  @Get("public/:id")
  getPublicUser(@Param("id") id: number) {
    return this.usersService.getPublicUser(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Patch("change-password")
  async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    const userId = req.user.id;
    return this.usersService.changePassword(userId, dto.oldPassword, dto.newPassword);
  }

  // ✅ GET CURRENT USER (ME)
  @UseGuards(JwtAuthGuard)
  @Get("me")
  getCurrentUser(@Req() req) {
    return this.usersService.findById(req.user.id);
  }

  // ✅ SEARCH USERS (CHAT)
  // GET /users/search?q=roberto
  @UseGuards(JwtAuthGuard)
  @Get("search")
  searchUsers(@Query("q") q: string) {
    return this.usersService.searchUsers(q);
  }

  // ============================================
  // PENALTY SYSTEM ENDPOINTS
  // ============================================

  /**
   * GET /users/:id/penalty-status
   * Obtiene el estado de penalizaciones de un usuario
   */
  @UseGuards(JwtAuthGuard)
  @Get(":id/penalty-status")
  getPenaltyStatus(@Param("id") id: number) {
    return this.usersService.getPenaltyStatus(Number(id));
  }

  /**
   * POST /users/:id/assign-penalty
   * Asigna una penalización a un usuario (solo admin)
   * Body: { reason?: string }
   */
  @UseGuards(JwtAuthGuard)
  @Post(":id/assign-penalty")
  assignPenalty(
    @Param("id") id: number,
    @Body() body: { reason?: string }
  ) {
    return this.usersService.assignPenalty(Number(id), body.reason);
  }

  /**
   * GET /users/:id/can-participate
   * Verifica si un usuario puede participar en subastas
   */
  @UseGuards(JwtAuthGuard)
  @Get(":id/can-participate")
  async canParticipate(@Param("id") id: number) {
    const canParticipate = await this.usersService.canParticipateInAuctions(Number(id));
    return { canParticipate };
  }

  /**
   * POST /users/admin/cleanup-penalties
   * Ejecuta limpieza manual de penalizaciones expiradas (solo admin)
   */
  @UseGuards(JwtAuthGuard)
  @Post("admin/cleanup-penalties")
  cleanupPenalties() {
    return this.usersService.cleanExpiredPenalties();
  }
}
