import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Subcategory } from "./subcategories.entity";

@Injectable()
export class SubcategoriesService {
  constructor(
    @InjectRepository(Subcategory)
    private readonly subcategoriesRepository: Repository<Subcategory>,
  ) {}

  async getByCategory(categoryId: number) {
    return this.subcategoriesRepository.find({
      where: {
        category: { id: categoryId },
      },
      order: { name: "ASC" },
    });
  }
}
