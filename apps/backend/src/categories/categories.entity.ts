import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Subcategory } from "../subcategories/subcategories.entity";

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", nullable: false })
  name: string;

  @OneToMany(() => Subcategory, (sub) => sub.category)
  subcategories: Subcategory[];
}
