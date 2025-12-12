import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';

@Module({
    imports: [TypeOrmModule.forFeature([User]), MulterModule.register({
        storage: multer.memoryStorage(),
    })],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
