import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";
import CategoriesBar from "../../components/CategoriesBar/CategoriesBar";
import PublicUserProfile from "../../components/PublicUserProfile/PublicUserProfile";
import PublicUserProfileSkeleton from "../../components/PublicUserProfileSkeleton/PublicUserProfileSkeleton";
import Footer from "../../components/Footer/Footer";

import { getPublicUser } from "../../api/users.api";
import { getPublicProductsByUser } from "../../api/products.api";
import { getReviews, getUserReviewSummary } from "../../api/reviews.api";

import type { ProductType } from "../../types/product";
import type { ReviewType } from "../../types/review";
import type { UserType } from "../../types/user";

export default function PublicUser() {
    const { userId } = useParams();

    const [publicUser, setPublicUser] = useState<UserType | null>(null);
    const [products, setProducts] = useState<ProductType[]>([]);
    const [reviews, setReviews] = useState<ReviewType[]>([]);
    const [rating, setRating] = useState<{ average: number; total: number } | null>(null);

    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!userId) return;

        const rawId = userId.includes("-") ? userId.split("-").pop() : userId;
        const id = Number(rawId);

        if (Number.isNaN(id)) {
            setNotFound(true);
            setLoading(false);
            return;
        }

        setLoading(true);
        setNotFound(false);

        Promise.all([
            getPublicUser(id),
            getPublicProductsByUser(id),
            getReviews(id, "newest"),
            getUserReviewSummary(id),
        ])
            .then(([userData, productsData, reviewsData, ratingData]) => {
                if (!userData) {
                    setNotFound(true);
                    return;
                }

                setPublicUser(userData);
                setProducts(productsData || []);
                
                // SOLUCIÓN AL ERROR DE LA CONSOLA:
                // Mapeamos las reviews para asegurar que 'product' e 'images' no sean null
                const validatedReviews = (reviewsData || []).map((rev: any) => ({
                    ...rev,
                    product: rev.product ? {
                        ...rev.product,
                        images: rev.product.images || [] // Si no hay imágenes, enviamos array vacío
                    } : { name: "Producto no disponible", images: [] } 
                }));

                setReviews(validatedReviews);
                setRating(ratingData);
            })
            .catch((err) => {
                console.error("Error cargando perfil:", err);
                setNotFound(true);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [userId]);

    if (loading) {
        return (
            <>
                <Navbar />
                <CategoriesBar />
                <PublicUserProfileSkeleton />
            </>
        );
    }

    if (notFound || !publicUser) {
        return (
            <>
                <Navbar />
                <CategoriesBar />
                <div style={{ padding: "60px 20px", textAlign: "center" }}>
                    <h2>Usuario no encontrado</h2>
                    <p>El perfil que buscas no existe.</p>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <CategoriesBar />
            <PublicUserProfile
                user={publicUser}
                products={products}
                reviews={reviews}
                rating={rating}
            />
            <Footer />
        </>
    );
}