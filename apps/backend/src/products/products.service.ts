import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "./products.entity";
import { ProductImage } from "./products-image.entity";
import { CreateProductDto } from "./create-products.dto";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { FavoriteProduct } from "../favorites/favorite-product.entity";
import { Not } from "typeorm";
import { Chat } from "../chat/chat.entity";
import { Purchase } from "../purchases/purchase.entity";
import sharp from "sharp";

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

    ) { }

    // Subida y procesamiento de imágenes
    async uploadImages(files: Express.Multer.File[], productId: number) {
        const tasks = files.map(async (file) => {
            // Procesar imagen con Sharp
            const processed = await sharp(file.buffer)
                .resize(1400, 1400, { fit: "inside" })  // calidad alta pero ligera
                .webp({ quality: 80 })
                .toBuffer();

            // Nombre único
            const filePath = `${productId}/${uuidv4()}.webp`;

            // Subir a Supabase
            const { error } = await this.supabase.storage
                .from("productsimg")
                .upload(filePath, processed, {
                    contentType: "image/webp",
                    upsert: true,
                });

            if (error) throw error;

            // Obtener URL pública
            const { data } = this.supabase.storage
                .from("productsimg")
                .getPublicUrl(filePath);

            // Guardar en la base de datos
            await this.productImagesRepo.save({
                product_id: productId,
                image_url: data.publicUrl,
            });

            return data.publicUrl;
        });

        // Ejecutar TODAS las subidas en paralelo
        const urls = await Promise.all(tasks);

        return urls;
    }

    // Crear un nuevo producto
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

    // Obtener productos activos de un usuario con estado de favorito
    async getActiveProductsByUser(userId: number) {
        // Obtener productos
        const products = await this.productRepo.find({
            where: {
                owner_id: userId,
                sold: false
            },
            relations: ['images'],
            order: {
                id: 'DESC'
            }
        });

        // Obtener lista de favoritos del usuario
        const favorites = await this.favoritesRepo.find({
            where: { user_id: userId }
        });

        const favoriteProductIds = favorites.map(f => f.product_id);

        // Devolver productos + isFavorite
        return products.map(p => ({
            ...p,
            isFavorite: favoriteProductIds.includes(p.id)
        }));
    }

    // MIS VENTAS FINALIZADAS (Historial)
    // Productos que están en la tabla purchases donde yo soy el vendedor
    // Ejemplo modificado en products.service.ts
    async getSoldProductsByUser(userId: number) {
        const purchases = await this.purchaseRepo.find({
            where: { sellerId: userId, deletedBySeller: false },
            relations: ['product', 'product.images'],
            order: { purchasedAt: 'DESC' }
        });

        // Devolvemos una estructura mixta
        return purchases.map(p => ({
            ...p.product,       // Datos del producto (nombre, imagen...)
            purchaseId: p.id,   // <--- ID DE LA TRANSACCIÓN (NECESARIO PARA BORRAR)
            soldPrice: p.price, // Precio al que se vendió
            soldDate: p.purchasedAt
        }));
    }

    // Obtener todos los productos, excluyendo los del usuario si se proporciona userId
    async getAllProducts(
    userId?: number,
    categoryId?: number,
    subcategoryId?: number,
) {
    const where: any = {};

    // Excluir productos propios
    if (userId) {
        where.owner_id = Not(userId);
    }

    // 🔥 FILTRO POR CATEGORÍA (CLAVE)
    if (categoryId) {
        where.category = { id: Number(categoryId) };
    }

    // 🔥 FILTRO POR SUBCATEGORÍA
    if (subcategoryId) {
        where.subcategory = { id: Number(subcategoryId) };
    }

    return this.productRepo.find({
        where,
        relations: {
            images: true,
            category: true,
            subcategory: true,
        },
        order: {
            id: "DESC",
        },
    });
}


    // Obtener detalles de un producto por ID
    async getProductById(productId: number, userId: number | null) {
        const product = await this.productRepo.findOne({
            where: { id: productId },
            relations: ["images"], // Including related images
        });

        if (!product) {
            throw new Error('Producto no encontrado');
        }

        // Check if user is trying to view their own product (optional logic)
        if (product.owner_id === userId) {
            throw new Error("No puedes ver tus propios productos en la página de detalle");
        }

        return product;
    }

    // Eliminar un producto y sus imágenes asociadas
    async deleteProduct(productId: number, userId: number) {
        // Obtener producto
        const product = await this.productRepo.findOne({ where: { id: productId } });

        if (!product) throw new NotFoundException('Producto no encontrado');

        // Seguridad: ¿Es el dueño?
        if (product.owner_id !== userId) {
            throw new UnauthorizedException('No tienes permiso para eliminar este producto');
        }

        // --- CASOS 4 y 5: PRODUCTO VENDIDO ---
        // Si ya hay dinero de por medio, PROHIBIDO BORRAR el registro maestro.
        // El usuario debe usar "Ocultar venta" (hideSale) si quiere dejar de verlo.
        if (product.sold) {
            throw new BadRequestException(
                'No puedes eliminar un producto vendido. Úsalo la opción "Ocultar" en tu historial de ventas.'
            );
        }

        // --- CASO 3: EN PROCESO (HAY CHATS) ---
        // Verificamos si alguien ha chateado sobre este producto
        const chatCount = await this.chatRepo.count({ where: { productId: productId } });

        if (chatCount > 0) {
            // ESTRATEGIA: SOFT DELETE
            // Hay historial de conversación. No borramos físicamente ni imágenes ni datos.
            // Solo lo marcamos como borrado para que salga del catálogo.
            await this.productRepo.softDelete(productId);
            return { message: 'Producto archivado (Soft Delete) porque tiene chats activos.' };
        }

        // --- CASOS 1 y 2: LIMPIEZA TOTAL (HARD DELETE) ---
        // Si llegamos aquí, no se ha vendido y nadie ha chateado.
        // Es seguro borrarlo todo para ahorrar espacio.

        // Borrar Favoritos (Caso 2)
        // Aunque la BDD tenga CASCADE, es buena práctica hacerlo explícito o asegurarlo.
        await this.favoritesRepo.delete({ product_id: productId });

        // Borrar Imágenes de Supabase (Limpieza física)
        const productImages = await this.productImagesRepo.find({ where: { product_id: productId } });

        if (productImages.length > 0) {
            const paths = productImages.map(img => img.image_url); // Asegúrate que esto sea el path relativo si es necesario
            const { error } = await this.supabase.storage
                .from('productsimg')
                .remove(paths);

            if (error) console.error("Error borrando imágenes de Supabase:", error);

            // Borramos referencias de imágenes en BDD
            await this.productImagesRepo.remove(productImages);
        }

        //  Borrar Producto Físicamente
        await this.productRepo.delete(productId); // Usamos .delete() o .remove(), NO softDelete

        return { message: 'Producto eliminado permanentemente (Hard Delete).' };
    }

    // MIS COMPRAS FINALIZADAS (Historial)
    // Productos que están en la tabla purchases donde yo soy el comprador
    async getPurchasedProductsByUser(userId: number) {
        const purchases = await this.purchaseRepo.find({
            where: {
                buyerId: userId,
                deletedByBuyer: false
            },
            relations: ['product', 'product.images'],
            order: { purchasedAt: 'DESC' }
        });

        // Inyectar el ID de la transacción:
        return purchases.map(p => ({
            ...p.product,
            purchaseId: p.id,
            soldPrice: p.price,
            soldDate: p.purchasedAt
        }));
    }

    // EN PROCESO DE COMPRA (Negociando)
    // Productos donde tengo un chat abierto Y sold = false
    async getBuyingProcessProducts(userId: number) {
        return this.productRepo.createQueryBuilder('product')
            .innerJoin('chats', 'chat', 'chat.product_id = product.id')
            .leftJoinAndSelect('product.images', 'images') // Cargar imágenes
            .where('chat.buyer_id = :userId', { userId })
            .andWhere('product.sold = :sold', { sold: false })
            .distinct(true)
            .getMany();
    }

    // EN PROCESO DE VENTA (Me están negociando)
    // Productos míos donde alguien abrió un chat Y sold = false
    async getSellingProcessProducts(userId: number) {
        return this.productRepo.createQueryBuilder('product')
            .innerJoin('chats', 'chat', 'chat.product_id = product.id')
            .leftJoinAndSelect('product.images', 'images')
            .where('chat.seller_id = :userId', { userId }) // Yo soy el vendedor en el chat
            .andWhere('product.sold = :sold', { sold: false })
            .distinct(true)
            .getMany();
    }

}