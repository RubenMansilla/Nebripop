import {
    Injectable,
    NotFoundException,
    BadRequestException,
    UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not } from "typeorm";
import { Product } from "./products.entity";
import { ProductImage } from "./products-image.entity";
import { CreateProductDto } from "./create-products.dto";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { FavoriteProduct } from "../favorites/favorite-product.entity";
import { Chat } from "../chat/chat.entity";
import { Purchase } from "../purchases/purchase.entity";
import sharp from "sharp";
import { MoreThan, Between } from 'typeorm';
import { Review } from "../reviews/review.entity";

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
        private productImagesRepo: Repository<ProductImage>,

        @InjectRepository(FavoriteProduct)
        private favoritesRepo: Repository<FavoriteProduct>,

        @InjectRepository(Chat)
        private chatRepo: Repository<Chat>,

        @InjectRepository(Purchase)
        private purchaseRepo: Repository<Purchase>,

        @InjectRepository(Review)
        private reviewRepo: Repository<Review>,
    ) { }

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

            const { error } = await this.supabase.storage
                .from("productsimg")
                .upload(filePath, processed, {
                    contentType: "image/webp",
                    upsert: true,
                });

            if (error) throw error;

            const { data } = this.supabase.storage
                .from("productsimg")
                .getPublicUrl(filePath);

            await this.productImagesRepo.save({
                product_id: productId,
                image_url: data.publicUrl,
            });

            return data.publicUrl;
        });

        return Promise.all(tasks);
    }

    // ============================
    // CREAR PRODUCTO
    // ============================
    async createProduct(
        dto: CreateProductDto,
        files: Express.Multer.File[],
        userId: number
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
    async getPublicProductsByUser(userId: number) {
        return this.productRepo.find({
            where: { owner_id: userId, sold: false },
            relations: ["images"],
            order: { id: "DESC" },
        });
    }

    // ============================
    // TODOS LOS PRODUCTOS + FILTROS
    // ============================
    async getAllProducts(
        userId?: number | null,
        categoryId?: number,
        subcategoryId?: number,
        minPrice?: number,
        maxPrice?: number,
        dateFilter?: "today" | "7days" | "30days"
    ) {
        const where: any = {};

        // Excluir productos propios
        if (userId) {
            where.owner_id = Not(userId);
        }

        // Categoría
        if (categoryId) {
            where.category_id = Number(categoryId);
        }

        // Subcategoría
        if (subcategoryId) {
            where.subcategory_id = Number(subcategoryId);
        }

        // Precio
        // Precio (CORRECTO, acepta 0)
        if (minPrice !== undefined && maxPrice !== undefined) {
            where.price = Between(
                Number(minPrice),
                Number(maxPrice)
            );
        }


        // Fecha de publicación
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

            where.createdAt = MoreThan(from);
        }

        return this.productRepo.find({
            where,
            relations: ["images"],
            order: { createdAt: "DESC" },
        });
    }



    // ============================
    // DETALLE PRODUCTO
    // ============================
    async getProductById(productId: number, userId: number | null) {
        const product = await this.productRepo.findOne({
            where: { id: productId },
            relations: [
                "images",
                "category",
                "subcategory",
            ],
        });


        if (!product) throw new Error("Producto no encontrado");
        if (product.owner_id === userId)
            throw new Error("No puedes ver tus propios productos");

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
            where: { productId },
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
            const paths = images.map((img) => img.image_url);
            await this.supabase.storage.from("productsimg").remove(paths);
            await this.productImagesRepo.remove(images);
        }

        await this.productRepo.delete(productId);
        return { message: "Producto eliminado permanentemente" };
    }

    // ============================
    // COMPRAS FINALIZADAS
    // ============================
    async getPurchasedProductsByUser(userId: number) {
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
        return this.productRepo
            .createQueryBuilder("product")
            .innerJoin("chats", "chat", "chat.product_id = product.id")
            .leftJoinAndSelect("product.images", "images")
            .where("chat.buyer_id = :userId", { userId })
            .andWhere("product.sold = false")
            .distinct(true)
            .getMany();
    }

    async getSellingProcessProducts(userId: number) {
        return this.productRepo
            .createQueryBuilder("product")
            .innerJoin("chats", "chat", "chat.product_id = product.id")
            .leftJoinAndSelect("product.images", "images")
            .where("chat.seller_id = :userId", { userId })
            .andWhere("product.sold = false")
            .distinct(true)
            .getMany();
    }
    // ============================
    // MIS PRODUCTOS VENDIDOS
    // ============================
    async getSoldProductsByUser(userId: number) {
        const purchases = await this.purchaseRepo.find({
            where: {
                sellerId: userId,
                deletedBySeller: false,
            },
            relations: ['product', 'product.images'],
            order: { purchasedAt: 'DESC' },
        });

        return purchases.map(p => ({
            ...p.product,
            purchaseId: p.id,
            soldPrice: p.price,
            soldDate: p.purchasedAt,
        }));
    }

    // Visualizaciones de producto
    async incrementViews(productId: number) {
        return this.productRepo.increment(
            { id: productId },
            'views_count',
            1
        );
    }

    async getTopSuccessfulProducts() {

        const products = await this.productRepo.createQueryBuilder('product')
            .leftJoinAndSelect('product.images', 'images')

            .loadRelationCountAndMap('product.favoritesCount', 'product.favorites')

            .loadRelationCountAndMap('product.chatsCount', 'product.chats')

            .orderBy('product.views_count', 'DESC')
            .take(2)
            .getMany();

        // Mapeo limpio
        return products.map((p) => ({
            id: p.id,
            name: p.name,
            created_at: p.createdAt,
            price: p.price,
            views_count: p.views_count,

            first_img: p.images && p.images.length > 0 ? p.images[0].image_url : null,

            total_favorites: p['favoritesCount'] || 0,
            total_chats: p['chatsCount'] || 0,
        }));
    }

    async getFinancialStats(userId: number, range: 'week' | 'month' | 'year') {
        const now = new Date();
        let startDate = new Date();

        // Variables de configuración
        let sqlFormat = '';       // Para agrupar en SQL (YYYY-MM-DD)
        let jsStep = '';          // Para iterar el bucle JS
        let displayFormat = '';   // 'weekday' | 'day-month' | 'month'

        // CALCULAR FECHA DE INICIO (Calendario Natural)
        if (range === 'week') {
            // --- ESTA SEMANA (Empezando el Lunes) ---
            // getDay(): 0 = Domingo, 1 = Lunes...
            const day = now.getDay();
            // Si es domingo (0), restamos 6 días para ir al lunes pasado. Si no, restamos (day - 1).
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);
            startDate.setDate(diff);
            startDate.setHours(0, 0, 0, 0);

            sqlFormat = 'YYYY-MM-DD';
            jsStep = 'day';
            displayFormat = 'weekday'; // Lun, Mar, Mie...

        } else if (range === 'month') {
            // --- ESTE MES (Día 1 hasta hoy) ---
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);

            sqlFormat = 'YYYY-MM-DD';
            jsStep = 'day';
            displayFormat = 'day-month'; // 12 dic...

        } else {
            // --- ESTE AÑO (1 Enero hasta hoy) ---
            startDate = new Date(now.getFullYear(), 0, 1); // Mes 0 es Enero

            sqlFormat = 'YYYY-MM';
            jsStep = 'month';
            displayFormat = 'month'; // Ene, Feb...
        }

        // GENERAR ESQUELETO VACÍO (Relleno cronológico)
        const dataMap = new Map<string, any>();
        // Hacemos una copia de startDate para iterar sin modificar la original usada en queries
        const currentDateIterator = new Date(startDate);

        // Iteramos hasta HOY (incluido)
        while (currentDateIterator <= now) {
            let key = '';
            let label = '';

            if (jsStep === 'month') {
                // Clave SQL: YYYY-MM
                const month = (currentDateIterator.getMonth() + 1).toString().padStart(2, '0');
                key = `${currentDateIterator.getFullYear()}-${month}`;

                // Etiqueta: Ene, Feb, Mar...
                label = currentDateIterator.toLocaleString('es-ES', { month: 'short' });

                // Avanzar iterador
                currentDateIterator.setMonth(currentDateIterator.getMonth() + 1);
            } else {
                // Clave SQL: YYYY-MM-DD
                const month = (currentDateIterator.getMonth() + 1).toString().padStart(2, '0');
                const day = currentDateIterator.getDate().toString().padStart(2, '0');
                key = `${currentDateIterator.getFullYear()}-${month}-${day}`;

                // Etiqueta
                if (displayFormat === 'weekday') {
                    // Lun, Mar...
                    label = currentDateIterator.toLocaleString('es-ES', { weekday: 'short' });
                } else {
                    // 14 dic...
                    label = `${day} ${currentDateIterator.toLocaleString('es-ES', { month: 'short' })}`;
                }

                // Avanzar iterador
                currentDateIterator.setDate(currentDateIterator.getDate() + 1);
            }

            // Capitalizar primera letra (ej: "lun" -> "Lun")
            label = label.charAt(0).toUpperCase() + label.slice(1);

            dataMap.set(key, {
                name: label,
                ingresos: 0,
                gastos: 0,
                ventas: 0,
                reviews: 0
            });
        }

        // CONSULTAS A BD

        // A. INGRESOS
        const incomeRaw = await this.purchaseRepo.createQueryBuilder('purchase')
            .select(`TO_CHAR(purchase.purchasedAt, '${sqlFormat}')`, 'dateKey')
            .addSelect('SUM(purchase.price)', 'amount')
            .where('purchase.sellerId = :userId', { userId })
            .andWhere('purchase.purchasedAt >= :startDate', { startDate }) // Desde el inicio del periodo
            .groupBy(`TO_CHAR(purchase.purchasedAt, '${sqlFormat}')`)
            .getRawMany();

        // B. GASTOS
        const expensesRaw = await this.purchaseRepo.createQueryBuilder('purchase')
            .select(`TO_CHAR(purchase.purchasedAt, '${sqlFormat}')`, 'dateKey')
            .addSelect('SUM(purchase.price)', 'amount')
            .where('purchase.buyerId = :userId', { userId })
            .andWhere('purchase.purchasedAt >= :startDate', { startDate })
            .groupBy(`TO_CHAR(purchase.purchasedAt, '${sqlFormat}')`)
            .getRawMany();

        // C. VENTAS
        const salesRaw = await this.productRepo.createQueryBuilder('product')
            .select(`TO_CHAR(product.created_at, '${sqlFormat}')`, 'dateKey')
            .addSelect('COUNT(product.id)', 'count')
            .where('product.owner_id = :userId', { userId })
            .andWhere('product.sold = true')
            .andWhere('product.created_at >= :startDate', { startDate })
            .groupBy(`TO_CHAR(product.created_at, '${sqlFormat}')`)
            .getRawMany();

        // D. RESEÑAS
        const reviewsRaw = await this.reviewRepo.createQueryBuilder('review')
            .select(`TO_CHAR(review.created_at, '${sqlFormat}')`, 'dateKey')
            .addSelect('COUNT(review.id)', 'count')
            .where('review.reviewed_user_id = :userId', { userId })
            .andWhere('review.created_at >= :startDate', { startDate })
            .groupBy(`TO_CHAR(review.created_at, '${sqlFormat}')`)
            .getRawMany();

        // E. VISUALIZACIONES (Total global)
        const viewsRaw = await this.productRepo.createQueryBuilder('product')
            .select('SUM(product.views_count)', 'total')
            .where('product.owner_id = :userId', { userId })
            .getRawOne();
        const totalGlobalViews = Number(viewsRaw.total) || 0;

        // 4. FUSIONAR Y RETORNAR
        const fillData = (items: any[], field: string) => {
            items.forEach(item => {
                const key = item.dateKey;
                if (dataMap.has(key)) {
                    const entry = dataMap.get(key);
                    const val = parseFloat(item.amount || item.count);
                    entry[field] = val || 0;
                }
            });
        };

        fillData(incomeRaw, 'ingresos');
        fillData(expensesRaw, 'gastos');
        fillData(salesRaw, 'ventas');
        fillData(reviewsRaw, 'reviews');

        const chartData = Array.from(dataMap.values());

        return {
            chartData,
            meta: {
                totalViews: totalGlobalViews
            }
        };
    }

}
