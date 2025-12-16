"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubcategoriesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const subcategories_entity_1 = require("./subcategories.entity");
const subcategories_service_1 = require("./subcategories.service");
const subcategories_controller_1 = require("./subcategories.controller");
let SubcategoriesModule = class SubcategoriesModule {
};
exports.SubcategoriesModule = SubcategoriesModule;
exports.SubcategoriesModule = SubcategoriesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([subcategories_entity_1.Subcategory])],
        providers: [subcategories_service_1.SubcategoriesService],
        controllers: [subcategories_controller_1.SubcategoriesController],
        exports: [typeorm_1.TypeOrmModule],
    })
], SubcategoriesModule);
//# sourceMappingURL=subcategories.module.js.map