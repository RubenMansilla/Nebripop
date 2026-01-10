import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";
import CategoriesBar from "../../components/CategoriesBar/CategoriesBar";
import PublicUserProfile from "../../components/PublicUserProfile/PublicUserProfile";

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

        const rawId = userId.split("-").pop();
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
                setPublicUser(userData);
                setProducts(productsData);
                setReviews(reviewsData);
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
                <div style={{ padding: "40px", textAlign: "center" }}>
                    <p>Cargando perfil...</p>
                </div>
            </>
        );
    }

    // Verificamos 'publicUser' en lugar de 'user'
    if (notFound || !publicUser) {
        return (
            <>
                <Navbar />
                <CategoriesBar />
                <div style={{ padding: "40px", textAlign: "center" }}>
                    <h2>Usuario no encontrado</h2>
                    <p>Este usuario no existe o ha sido eliminado.</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <CategoriesBar />

            <PublicUserProfile
                user={publicUser} // Pasamos el perfil público al componente hijo
                products={products}
                reviews={reviews}
                rating={rating}
            />
        </>
    );
}