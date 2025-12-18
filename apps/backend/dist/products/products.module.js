"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const products_entity_1 = require("./products.entity");
const products_image_entity_1 = require("./products-image.entity");
const products_controller_1 = require("./products.controller");
const products_service_1 = require("./products.service");
const favorite_product_entity_1 = require("../favorites/favorite-product.entity");
const chat_entity_1 = require("../chat/chat.entity");
const purchase_entity_1 = require("../purchases/purchase.entity");
const review_entity_1 = require("../reviews/review.entity");
const users_entity_1 = require("../users/users.entity");
let ProductsModule = class ProductsModule {
};
exports.ProductsModule = ProductsModule;
exports.ProductsModule = ProductsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([products_entity_1.Product, products_image_entity_1.ProductImage, favorite_product_entity_1.FavoriteProduct, chat_entity_1.Chat, purchase_entity_1.Purchase, review_entity_1.Review, users_entity_1.User])],
        controllers: [products_controller_1.ProductsController],
        providers: [products_service_1.ProductsService],
    })
], ProductsModule);
//# sourceMappingURL=products.module.js.map