import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "./categories.entity";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepo: Repository<Category>
  ) {}

  findAll() {
    return this.categoriesRepo.find({
      relations: ["subcategories"],
      order: { name: "ASC" },
    });
  }
}
