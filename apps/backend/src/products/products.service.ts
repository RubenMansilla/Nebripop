import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "./products.entity";
import { ProductImage } from "./products-image.entity";
import { CreateProductDto } from "./create-products.dto";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class ProductsService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!
  );

  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,

    @InjectRepository(ProductImage)
    private productImagesRepo: Repository<ProductImage>
  ) {}

  async uploadImages(files: Express.Multer.File[], productId: number) {
    const urls: string[] = [];

    for (const file of files) {
      const path = `${productId}/${uuidv4()}-${file.originalname}`;

      const { error } = await this.supabase.storage
        .from("productsimg")
        .upload(path, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) throw error;

      const { data } = this.supabase.storage
        .from("productsimg")
        .getPublicUrl(path);

      urls.push(data.publicUrl);

      await this.productImagesRepo.save({
        product_id: productId,
        image_url: data.publicUrl,
      });
    }

    return urls;
  }
async createProduct(dto: CreateProductDto, files: Express.Multer.File[], userId: number) {
 

  try {
    const product = await this.productRepo.save({
      ...dto,
      owner_id: userId,
    });

    

    if (files && files.length > 0) {
      await this.uploadImages(files, product.id);
    }

    return { productId: product.id };

  } catch (err) {
    console.error("ERROR BACKEND:", err);
    throw err;
  }
}

}
