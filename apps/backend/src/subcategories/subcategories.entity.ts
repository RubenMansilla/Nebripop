import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Category } from "../categories/categories.entity";

@Entity("subcategories")
export class Subcategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", nullable: false })
  name: string;

  @ManyToOne(() => Category, (category) => category.subcategories, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "category_id" })
  category: Category;
}
