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
exports.ChatMessage = void 0;
const typeorm_1 = require("typeorm");
const chat_entity_1 = require("./chat.entity");
let ChatMessage = class ChatMessage {
    id;
    chatId;
    senderId;
    message;
    sentAt;
    chat;
};
exports.ChatMessage = ChatMessage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ChatMessage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "chat_id", type: "int8" }),
    __metadata("design:type", Number)
], ChatMessage.prototype, "chatId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "sender_id", type: "int8" }),
    __metadata("design:type", Number)
], ChatMessage.prototype, "senderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], ChatMessage.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "sent_at" }),
    __metadata("design:type", Date)
], ChatMessage.prototype, "sentAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => chat_entity_1.Chat, (chat) => chat.messages),
    (0, typeorm_1.JoinColumn)({ name: "chat_id" }),
    __metadata("design:type", chat_entity_1.Chat)
], ChatMessage.prototype, "chat", void 0);
exports.ChatMessage = ChatMessage = __decorate([
    (0, typeorm_1.Entity)("chat_messages")
], ChatMessage);
//# sourceMappingURL=chat-message.entity.js.map