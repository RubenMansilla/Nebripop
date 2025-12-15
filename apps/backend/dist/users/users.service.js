"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const users_entity_1 = require("./users.entity");
const supabase_js_1 = require("@supabase/supabase-js");
const sharp_1 = __importDefault(require("sharp"));
let UsersService = class UsersService {
    repo;
    supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);
    constructor(repo) {
        this.repo = repo;
    }
    create(data) {
        const user = this.repo.create(data);
        return this.repo.save(user);
    }
    findByEmail(email) {
        return this.repo.findOne({ where: { email } });
    }
    async updateUser(id, data) {
        await this.repo.update(id, data);
        return this.repo.findOne({ where: { id } });
    }
    async updateProfilePicture(id, file) {
        const processedImage = await (0, sharp_1.default)(file.buffer)
            .resize(800, 800, { fit: 'inside' })
            .webp({ quality: 80 })
            .toBuffer();
        const fileName = `user_${id}_${Date.now()}.webp`;
        const { error } = await this.supabase.storage
            .from('userImg')
            .upload(fileName, processedImage, {
            contentType: 'image/webp',
            upsert: true
        });
        if (error)
            throw new Error(error.message);
        const { data } = this.supabase.storage
            .from('userImg')
            .getPublicUrl(fileName);
        await this.repo.update(id, { profilePicture: data.publicUrl });
        return this.repo.findOne({ where: { id } });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(users_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map