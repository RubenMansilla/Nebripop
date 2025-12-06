export interface ProductType {
    id: number;
    name: string;
    price: number;
    images: { image_url: string }[];
    shipping_active: boolean;
}
