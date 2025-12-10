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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = void 0;
const typeorm_1 = require("typeorm");
const chat_message_entity_1 = require("./chat-message.entity");
let Chat = class Chat {
    id;
    buyerId;
    sellerId;
    productId;
    createdAt;
    messages;
};
exports.Chat = Chat;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Chat.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "buyer_id", type: "int8" }),
    __metadata("design:type", Number)
], Chat.prototype, "buyerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "seller_id", type: "int8" }),
    __metadata("design:type", Number)
], Chat.prototype, "sellerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "product_id", type: "int8", nullable: true }),
    __metadata("design:type", Object)
], Chat.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Chat.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => chat_message_entity_1.ChatMessage, (msg) => msg.chat),
    __metadata("design:type", Array)
], Chat.prototype, "messages", void 0);
exports.Chat = Chat = __decorate([
    (0, typeorm_1.Entity)("chats")
], Chat);
//# sourceMappingURL=chat.entity.js.map