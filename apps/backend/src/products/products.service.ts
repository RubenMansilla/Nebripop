import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not, MoreThan, Between } from "typeorm";
import { Product } from "./products.entity";
import { ProductImage } from "./products-image.entity";
import { CreateProductDto, UpdateProductDto } from "./create-products.dto";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { FavoriteProduct } from "../favorites/favorite-product.entity";
import { Chat } from "../chat/chat.entity";
import { Purchase } from "../purchases/purchase.entity";
import sharp from "sharp";
import { Review } from "../reviews/review.entity";
import { ProductView } from "./ProductView/product-view.entity";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class ProductsService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!,
  );

  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,

    @InjectRepository(ProductImage)
    private productImagesRepo: Repository<ProductImage>,

    @InjectRepository(FavoriteProduct)
    private favoritesRepo: Repository<FavoriteProduct>,

    @InjectRepository(Chat)
    private chatRepo: Repository<Chat>,

    @InjectRepository(Purchase)
    private purchaseRepo: Repository<Purchase>,

    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,

    @InjectRepository(ProductView)
    private readonly productViewRepo: Repository<ProductView>,

    private notificationsService: NotificationsService,
  ) { }

  // ============================
  // HELPER SUPABASE: sacar path real desde la URL pública
  // ============================
  private getSupabasePathFromUrl(url: string): string | null {
    // Ejemplo de URL:
    // https://xxxx.supabase.co/storage/v1/object/public/productsimg/123/uuid.webp
    const marker = "/storage/v1/object/public/productsimg/";
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    return url.substring(idx + marker.length); // -> "123/uuid.webp"
  }

  // ============================
  // SUBIDA Y PROCESADO DE IMÁGENES
  // ============================
  async uploadImages(files: Express.Multer.File[], productId: number) {
    const tasks = files.map(async (file) => {
      const processed = await sharp(file.buffer)
        .resize(1400, 1400, { fit: "inside" })
        .webp({ quality: 80 })
        .toBuffer();

      const filePath = `${productId}/${uuidv4()}.webp`;

      const { error: uploadError } = await this.supabase.storage
        .from("productsimg")
        .upload(filePath, processed, {
          contentType: "image/webp",
          upsert: true,
        });

      if (uploadError) {
        console.error("Error subiendo imagen a Supabase:", uploadError);
        throw new BadRequestException("No se pudo subir la imagen");
      }

      const { data: publicUrlData } = this.supabase.storage
        .from("productsimg")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      await this.productImagesRepo.save({
        product_id: productId,
        image_url: publicUrl, // solo guardamos la URL pública
      });

      return publicUrl;
    });

    return Promise.all(tasks);
  }

  // ============================
  // CREAR PRODUCTO
  // ============================
  async createProduct(
    dto: CreateProductDto,
    files: Express.Multer.File[],
    userId: number,
  ) {
    const product = await this.productRepo.save({
      ...dto,
      owner_id: userId,
    });

    if (files?.length) {
      await this.uploadImages(files, product.id);
    }

    return { productId: product.id };
  }

  // ============================
  // EDITAR PRODUCTO
  // ============================
  async updateProduct(
    productId: number,
    dto: UpdateProductDto,
    files: Express.Multer.File[] | undefined,
    userId: number,
  ) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: ["images", "favorites", "favorites.user"],
    });

    if (!product) {
      throw new NotFoundException("Producto no encontrado");
    }

    if (product.owner_id !== userId) {
      throw new UnauthorizedException(
        "No tienes permiso para editar este producto",
      );
    }

    if (product.sold) {
      throw new BadRequestException("No puedes editar un producto vendido");
    }

    // Lógica para detectar bajada de precio
    const oldPrice = Number(product.price); // Aseguramos que sea número
    const newPrice = dto.price !== undefined ? Number(dto.price) : undefined;

    // Guardar una bandera para saber si se debe notificar DESPUÉS de guardar
    let shouldNotifyPriceDrop = false;

    // Verificar: 
    // 1. Que venga un precio nuevo
    // 2. Que sea menor al viejo
    if (newPrice !== undefined && newPrice < oldPrice) {
      shouldNotifyPriceDrop = true;
    }

    Object.assign(product, dto);
    await this.productRepo.save(product);

    if (files && files.length > 0) {
      await this.uploadImages(files, product.id);
    }

    if (newPrice !== undefined && newPrice < oldPrice) {
      // Llamamos a la función auxiliar (sin await si quieres que sea background)
      this.notifyFollowers(product, newPrice).catch(console.error);
    }

    const updated = await this.productRepo.findOne({
      where: { id: productId },
      relations: ["images"],
    });

    return updated;
  }


  private async notifyFollowers(product: Product, newPrice: number) {
    if (!product.favorites || product.favorites.length === 0) return;

    const notificationsPayload = product.favorites.map(fav => ({
      userId: String(fav.user_id),
      type: 'priceDrops',
      message: `¡${product.name} ha bajado de precio a ${newPrice}€!`,
      productId: product.id,
      isRead: false,
      createdAt: new Date()
    }));

    await this.notificationsService.createBatch(notificationsPayload);
    console.log(`Alertas enviadas a ${notificationsPayload.length} usuarios.`);
  }

  // ============================
  // ELIMINAR UNA IMAGEN CONCRETA
  // ============================
  async deleteProductImage(
    productId: number,
    imageId: number,
    userId: number,
  ) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: ["images"],
    });

    if (!product) {
      throw new NotFoundException("Producto no encontrado");
    }

    if (product.owner_id !== userId) {
      throw new UnauthorizedException(
        "No tienes permiso para editar este producto",
      );
    }

    const image = await this.productImagesRepo.findOne({
      where: { id: imageId, product_id: productId },
    });

    if (!image) {
      throw new NotFoundException("Imagen no encontrada");
    }

    if ((product.images?.length || 0) <= 1) {
      throw new BadRequestException(
        "No puedes eliminar la única imagen del producto",
      );
    }

    // Borrar del bucket de Supabase usando la URL para obtener el path
    const supabasePath = this.getSupabasePathFromUrl(image.image_url);
    if (supabasePath) {
      const { error } = await this.supabase.storage
        .from("productsimg")
        .remove([supabasePath]);

      if (error) {
        console.error("Error eliminando archivo de Supabase:", error);
        throw new BadRequestException(
          "No se pudo eliminar la imagen del almacenamiento",
        );
      }
    }

    await this.productImagesRepo.remove(image);

    return { success: true };
  }

  // ============================
  // PRODUCTOS ACTIVOS DEL USUARIO
  // ============================
  async getActiveProductsByUser(userId: number) {
    const products = await this.productRepo.find({
      where: { owner_id: userId, sold: false },
      relations: ["images"],
      order: { id: "DESC" },
    });

    const favorites = await this.favoritesRepo.find({
      where: { user_id: userId },
    });

    const favoriteIds = favorites.map((f) => f.product_id);

    return products.map((p) => ({
      ...p,
      isFavorite: favoriteIds.includes(p.id),
    }));
  }

  // ============================
  // PERFIL PÚBLICO
  // ============================
  async getPublicProductsByUser(sellerId: number, viewerId?: number | null) {
    const products = await this.productRepo.find({
      where: { owner_id: sellerId, sold: false },
      relations: ["images"],
      order: { id: "DESC" },
    });

    let favoriteIds: number[] = [];

    if (viewerId) {
      const favorites = await this.favoritesRepo.find({
        where: { user_id: viewerId },
      });
      favoriteIds = favorites.map((f) => f.product_id);
    }

    return products.map((p) => ({
      ...p,
      isFavorite: favoriteIds.includes(p.id),
    }));
  }

  // ============================
  // TODOS LOS PRODUCTOS + FILTROS + FAVORITOS
  // ============================
  async getAllProducts(
    userId?: number | null,
    categoryId?: number,
    subcategoryId?: number,
    minPrice?: number,
    maxPrice?: number,
    dateFilter?: "today" | "7days" | "30days",
  ) {
    const where: any = {};

    if (userId) {
      where.owner_id = Not(userId);
    }

    where.sold = false;
    where.is_auction = false; // Exclude products in auction

    if (categoryId) {
      where.category_id = Number(categoryId);
    }

    if (subcategoryId) {
      where.subcategory_id = Number(subcategoryId);
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      where.price = Between(Number(minPrice), Number(maxPrice));
    }

    if (dateFilter) {
      const now = new Date();
      let from: Date;

      if (dateFilter === "today") {
        from = new Date();
        from.setHours(0, 0, 0, 0);
      } else if (dateFilter === "7days") {
        from = new Date(now.setDate(now.getDate() - 7));
      } else {
        from = new Date(now.setDate(now.getDate() - 30));
      }

      // ojo: tu entidad tiene createdAt o created_at, revísalo
      where.createdAt = MoreThan(from);
    }

    const products = await this.productRepo.find({
      where,
      relations: ["images"],
      order: { createdAt: "DESC" },
    });

    let favoriteIds: number[] = [];

    if (userId) {
      const favorites = await this.favoritesRepo.find({
        where: { user_id: userId },
        select: ["product_id"],
      });
      favoriteIds = favorites.map((f) => f.product_id);
    }

    return products.map((p) => ({
      ...p,
      isFavorite: favoriteIds.includes(p.id),
    }));
  }

  // ============================
  // DETALLE PRODUCTO
  // ============================
  async getProductById(productId: number, userId: number | null) {
    const product = await this.productRepo
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.images", "images")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.subcategory", "subcategory")
      .leftJoin("product.seller", "seller")
      .addSelect(["seller.id", "seller.full_name", "seller.full_name"])
      .where("product.id = :productId", { productId })
      .getOne();

    if (!product) {
      throw new NotFoundException("Producto no encontrado");
    }

    return product;
  }

  // ============================
  // ELIMINAR PRODUCTO
  // ============================
  async deleteProduct(productId: number, userId: number) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });

    if (!product) throw new NotFoundException("Producto no encontrado");
    if (product.owner_id !== userId)
      throw new UnauthorizedException("No tienes permiso");

    if (product.sold)
      throw new BadRequestException("No puedes eliminar un producto vendido");

    const chatCount = await this.chatRepo.count({
      where: { products: { id: productId } },
    });

    if (chatCount > 0) {
      await this.productRepo.softDelete(productId);
      return { message: "Producto archivado (Soft Delete)" };
    }

    await this.favoritesRepo.delete({ product_id: productId });

    const images = await this.productImagesRepo.find({
      where: { product_id: productId },
    });

    if (images.length) {
      // Convertimos las URLs públicas en paths internos de Supabase
      const paths = images
        .map((img) => this.getSupabasePathFromUrl(img.image_url))
        .filter((p): p is string => !!p);

      if (paths.length) {
        const { error } = await this.supabase.storage
          .from("productsimg")
          .remove(paths);

        if (error) {
          console.error("Error eliminando imágenes de Supabase:", error);
          // No rompo el borrado del producto, pero podrías lanzar excepción si quieres
        }
      }

      await this.productImagesRepo.remove(images);
    }

    await this.productRepo.delete(productId);
    return { message: "Producto eliminado permanentemente" };
  }

  // ============================
  // COMPRAS FINALIZADAS
  // ============================
  async getPurchasedProductsByUser(userId: string) {
    const purchases = await this.purchaseRepo.find({
      where: { buyerId: userId, deletedByBuyer: false },
      relations: ["product", "product.images"],
      order: { purchasedAt: "DESC" },
    });

    return purchases.map((p) => ({
      ...p.product,
      purchaseId: p.id,
      soldPrice: p.price,
      soldDate: p.purchasedAt,
    }));
  }

  // ============================
  // PROCESOS
  // ============================
  async getBuyingProcessProducts(userId: number) {
    const products = await this.productRepo
      .createQueryBuilder("product")
      .innerJoin("product.chats", "chat")
      .leftJoinAndSelect("product.images", "images")
      .where("chat.buyer_id = :userId", { userId })
      .andWhere("product.sold = false")
      .distinct(true)
      .getMany();

    if (products.length === 0) return [];

    const favorites = await this.favoritesRepo.find({
      where: { user_id: userId },
    });

    const favoriteIds = favorites.map((f) => f.product_id);

    return products.map((p) => ({
      ...p,
      isFavorite: favoriteIds.includes(p.id),
    }));
  }

  async getSellingProcessProducts(userId: number) {
    return this.productRepo
      .createQueryBuilder("product")
      .innerJoin("product.chats", "chat")
      .leftJoinAndSelect("product.images", "images")
      .where("chat.seller_id = :userId", { userId })
      .andWhere("product.sold = false")
      .distinct(true)
      .getMany();
  }

  // ============================
  // MIS PRODUCTOS VENDIDOS
  // ============================
  async getSoldProductsByUser(userId: string) {
    const purchases = await this.purchaseRepo.find({
      where: {
        sellerId: userId,
        deletedBySeller: false,
      },
      relations: ["product", "product.images"],
      order: { purchasedAt: "DESC" },
    });

    return purchases.map((p) => ({
      ...p.product,
      purchaseId: p.id,
      soldPrice: p.price,
      soldDate: p.purchasedAt,
    }));
  }

  async getTopSuccessfulProducts(userId: number) {
    const products = await this.productRepo
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.images", "images")
      .where("product.owner_id = :userId", { userId })
      .loadRelationCountAndMap("product.favoritesCount", "product.favorites")
      .loadRelationCountAndMap("product.chatsCount", "product.chats")
      .orderBy("product.views_count", "DESC")
      .take(2)
      .getMany();

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      created_at: p.createdAt,
      price: p.price,
      views_count: p.views_count,
      first_img:
        p.images && p.images.length > 0 ? p.images[0].image_url : null,
      total_favorites: (p as any)["favoritesCount"] || 0,
      total_chats: (p as any)["chatsCount"] || 0,
    }));
  }

  async getFinancialStats(userId: number, range: "week" | "month" | "year") {
    const now = new Date();
    let startDate = new Date();

    let sqlFormat = "";
    let jsStep = "";
    let displayFormat = "";

    if (range === "week") {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startDate.setDate(diff);
      startDate.setHours(0, 0, 0, 0);

      sqlFormat = "YYYY-MM-DD";
      jsStep = "day";
      displayFormat = "weekday";
    } else if (range === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);

      sqlFormat = "YYYY-MM-DD";
      jsStep = "day";
      displayFormat = "day-month";
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);

      sqlFormat = "YYYY-MM";
      jsStep = "month";
      displayFormat = "month";
    }

    const dataMap = new Map<string, any>();
    const currentDateIterator = new Date(startDate);

    while (currentDateIterator <= now) {
      let key = "";
      let label = "";

      if (jsStep === "month") {
        const month = (currentDateIterator.getMonth() + 1)
          .toString()
          .padStart(2, "0");
        key = `${currentDateIterator.getFullYear()}-${month}`;

        label = currentDateIterator.toLocaleString("es-ES", {
          month: "short",
        });

        currentDateIterator.setMonth(currentDateIterator.getMonth() + 1);
      } else {
        const month = (currentDateIterator.getMonth() + 1)
          .toString()
          .padStart(2, "0");
        const day = currentDateIterator.getDate().toString().padStart(2, "0");
        key = `${currentDateIterator.getFullYear()}-${month}-${day}`;

        if (displayFormat === "weekday") {
          label = currentDateIterator.toLocaleString("es-ES", {
            weekday: "short",
          });
        } else {
          label = `${day} ${currentDateIterator.toLocaleString("es-ES", {
            month: "short",
          })}`;
        }

        currentDateIterator.setDate(currentDateIterator.getDate() + 1);
      }

      label = label.charAt(0).toUpperCase() + label.slice(1);

      dataMap.set(key, {
        name: label,
        ingresos: 0,
        gastos: 0,
        ventas: 0,
        reviews: 0,
      });
    }

    const incomeRaw = await this.purchaseRepo
      .createQueryBuilder("purchase")
      .select(`TO_CHAR(purchase.purchasedAt, '${sqlFormat}')`, "dateKey")
      .addSelect("SUM(purchase.price)", "amount")
      .where("purchase.sellerId = :userId", { userId })
      .andWhere("purchase.purchasedAt >= :startDate", { startDate })
      .groupBy(`TO_CHAR(purchase.purchasedAt, '${sqlFormat}')`)
      .getRawMany();

    const expensesRaw = await this.purchaseRepo
      .createQueryBuilder("purchase")
      .select(`TO_CHAR(purchase.purchasedAt, '${sqlFormat}')`, "dateKey")
      .addSelect("SUM(purchase.price)", "amount")
      .where("purchase.buyerId = :userId", { userId })
      .andWhere("purchase.purchasedAt >= :startDate", { startDate })
      .groupBy(`TO_CHAR(purchase.purchasedAt, '${sqlFormat}')`)
      .getRawMany();

    const salesRaw = await this.productRepo
      .createQueryBuilder("product")
      .select(`TO_CHAR(product.created_at, '${sqlFormat}')`, "dateKey")
      .addSelect("COUNT(product.id)", "count")
      .where("product.owner_id = :userId", { userId })
      .andWhere("product.sold = true")
      .andWhere("product.created_at >= :startDate", { startDate })
      .groupBy(`TO_CHAR(product.created_at, '${sqlFormat}')`)
      .getRawMany();

    const reviewsRaw = await this.reviewRepo
      .createQueryBuilder("review")
      .select(`TO_CHAR(review.created_at, '${sqlFormat}')`, "dateKey")
      .addSelect("COUNT(review.id)", "count")
      .where("review.reviewed_user_id = :userId", { userId })
      .andWhere("review.created_at >= :startDate", { startDate })
      .groupBy(`TO_CHAR(review.created_at, '${sqlFormat}')`)
      .getRawMany();

    const viewsRaw = await this.productRepo
      .createQueryBuilder("product")
      .select("SUM(product.views_count)", "total")
      .where("product.owner_id = :userId", { userId })
      .getRawOne();
    const totalGlobalViews = Number(viewsRaw.total) || 0;

    const fillData = (items: any[], field: string) => {
      items.forEach((item) => {
        const key = item.dateKey;
        if (dataMap.has(key)) {
          const entry = dataMap.get(key);
          const val = parseFloat(item.amount || item.count);
          entry[field] = val || 0;
        }
      });
    };

    fillData(incomeRaw, "ingresos");
    fillData(expensesRaw, "gastos");
    fillData(salesRaw, "ventas");
    fillData(reviewsRaw, "reviews");

    const chartData = Array.from(dataMap.values());

    return {
      chartData,
      meta: {
        totalViews: totalGlobalViews,
      },
    };
  }

  // Visualizaciones de producto
  async incrementViews(productId: number, userId: number | null, ip: string) {
    const product = await this.productRepo.findOne({ where: { id: productId } });

    if (!product) return;

    if (userId && product.owner_id === userId) {
      return { message: "Owner cannot increment views" };
    }

    const query = this.productViewRepo
      .createQueryBuilder("view")
      .where("view.productId = :productId", { productId });

    if (userId) {
      query.andWhere("view.userId = :userId", { userId });
    } else {
      query.andWhere("view.ip = :ip", { ip });
    }

    const alreadyViewed = await query.getOne();

    if (alreadyViewed) {
      return { message: "View already counted" };
    }

    const newView = this.productViewRepo.create({
      productId,
      userId,
      ip,
    });
    await this.productViewRepo.save(newView);

    await this.productRepo.increment({ id: productId }, "views_count", 1);

    return { success: true };
  }
}
