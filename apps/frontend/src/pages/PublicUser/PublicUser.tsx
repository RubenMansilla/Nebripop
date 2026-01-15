import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";
import CategoriesBar from "../../components/CategoriesBar/CategoriesBar";
import PublicUserProfile from "../../components/PublicUserProfile/PublicUserProfile";
import PublicUserProfileSkeleton from "../../components/PublicUserProfileSkeleton/PublicUserProfileSkeleton";
import Footer from "../../components/Footer/Footer"; // Añadido para consistencia

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

        // Limpieza de ID (soporta tanto 'nombre-123' como '123')
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
                // Validación: si el usuario no existe en la DB
                if (!userData) {
                    setNotFound(true);
                    return;
                }
                
                setPublicUser(userData);
                setProducts(productsData || []);
                
                // Mapeo de seguridad para las reviews para evitar el error de 'images'
                const safeReviews = (reviewsData || []).map((rev: any) => ({
                    ...rev,
                    product: rev.product ? {
                        ...rev.product,
                        images: rev.product.images || [] // Si no hay imágenes, array vacío
                    } : null
                }));
                
                setReviews(safeReviews);
                setRating(ratingData);
            })
            .catch((err) => {
                console.error("Error cargando perfil público:", err);
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
                <div style={{ padding: "80px 20px", textAlign: "center", minHeight: "60vh" }}>
                    <h2 style={{ color: "#4b4b4b" }}>Usuario no encontrado</h2>
                    <p style={{ color: "#9a9a9a" }}>Este usuario no existe o ha sido eliminado.</p>
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