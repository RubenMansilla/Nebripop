import { Controller, Get, Param } from "@nestjs/common";
import { SubcategoriesService } from "./subcategories.service";

@Controller("subcategories")
export class SubcategoriesController {
  constructor(
    private readonly subcategoriesService: SubcategoriesService,
  ) {}

  @Get("category/:categoryId")
  getByCategory(@Param("categoryId") categoryId: number) {
    return this.subcategoriesService.getByCategory(Number(categoryId));
  }
}