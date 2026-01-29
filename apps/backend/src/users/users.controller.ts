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
}
