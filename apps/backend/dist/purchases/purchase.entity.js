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
exports.Purchase = void 0;
const typeorm_1 = require("typeorm");
const products_entity_1 = require("../products/products.entity");
let Purchase = class Purchase {
    id;
    buyerId;
    sellerId;
    productId;
    price;
    deletedByBuyer;
    deletedBySeller;
    product;
    purchasedAt;
};
exports.Purchase = Purchase;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], Purchase.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'buyer_id' }),
    __metadata("design:type", Number)
], Purchase.prototype, "buyerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'seller_id' }),
    __metadata("design:type", Number)
], Purchase.prototype, "sellerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id' }),
    __metadata("design:type", Number)
], Purchase.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal'),
    __metadata("design:type", Number)
], Purchase.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deleted_by_buyer', default: false }),
    __metadata("design:type", Boolean)
], Purchase.prototype, "deletedByBuyer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deleted_by_seller', default: false }),
    __metadata("design:type", Boolean)
], Purchase.prototype, "deletedBySeller", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => products_entity_1.Product),
    (0, typeorm_1.JoinColumn)({ name: 'product_id' }),
    __metadata("design:type", products_entity_1.Product)
], Purchase.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'purchased_at' }),
    __metadata("design:type", Date)
], Purchase.prototype, "purchasedAt", void 0);
exports.Purchase = Purchase = __decorate([
    (0, typeorm_1.Entity)('purchases')
], Purchase);
//# sourceMappingURL=purchase.entity.js.map