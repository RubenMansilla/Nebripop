import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Subcategory } from "./subcategories.entity";
import { SubcategoriesService } from "./subcategories.service";
import { SubcategoriesController } from "./subcategories.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Subcategory])],
  providers: [SubcategoriesService],
  controllers: [SubcategoriesController],
  exports: [TypeOrmModule],
})
export class SubcategoriesModule {}
