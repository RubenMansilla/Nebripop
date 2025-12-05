import './ReviewProfile.css'
import { useRef, useState, useEffect } from 'react';
import Review from '../Review/Review';
import { getReviews } from "../../api/reviews.api";
import type { ReviewType } from '../../types/review';
import ReviewSkeleton from '../Review/ReviewSkeleton';

export default function ReviewProfile() {

    const sortRef = useRef<HTMLDivElement | null>(null);

    const [open, setOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState("Más recientes");
    type SortOption = "newest" | "oldest" | "low-rating" | "high-rating";
    const [sortOption, setSortOption] = useState<SortOption>("newest");

    const selectOption = (value: SortOption) => {
        setSortOption(value);
        switch (value) {
            case "newest":
                setSelectedLabel("Más recientes");
                break;
            case "oldest":
                setSelectedLabel("Más antiguas");
                break;
            case "low-rating":
                setSelectedLabel("Valoración: menor a mayor");
                break;
            case "high-rating":
                setSelectedLabel("Valoración: mayor a menor");
                break;
        }

        setOpen(false);
    };

    // State para las reviews
    const [reviews, setReviews] = useState<ReviewType[]>([]);
    // State para el loading
    const [loading, setLoading] = useState(true);
    // State para el número de reviews visibles
    const [visibleCount, setVisibleCount] = useState(35);

    // Función para cargar más reviews
    const loadMore = () => {
        setVisibleCount(prev => prev + 35);
    };

    // useEffect para cargar las reviews cuando cambia sortOption
    useEffect(() => {
        setLoading(true); // activa skeleton antes de pedir las reviews
        getReviews(3, sortOption)
            .then(data => {
                setReviews(data);
                setVisibleCount(35); // reiniciar al cambiar de orden
            })
            .finally(() => setLoading(false)); // desactiva skeleton cuando llega la data
    }, [sortOption]);

    return (
        <>
            <div className="sort-by-container">
                <div className="sort-by" ref={sortRef} onClick={() => setOpen(!open)}>
                    <p>Ordenar por: {selectedLabel}</p>
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
                        <path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 10l5 5m0 0l5-5" />
                    </svg>
                </div>
                {open && (
                    <div className="sort-dropdown" style={{ width: sortRef.current?.offsetWidth }}>
                        <p className={sortOption === "newest" ? "active" : ""} onClick={() => selectOption("newest")}>Más recientes</p>
                        <p className={sortOption === "oldest" ? "active" : ""} onClick={() => selectOption("oldest")}>Más antiguas</p>
                        <p className={sortOption === "low-rating" ? "active" : ""} onClick={() => selectOption("low-rating")}>Valoración: menor a mayor</p>
                        <p className={sortOption === "high-rating" ? "active" : ""} onClick={() => selectOption("high-rating")}>Valoración: mayor a menor</p>
                    </div>
                )}
            </div>
            <div className="review-container">
                {loading && (
                    <>
                        <ReviewSkeleton />
                        <ReviewSkeleton />
                        <ReviewSkeleton />
                    </>
                )}
                {!loading && reviews.slice(0, visibleCount).map((rev) => (
                    <Review review={rev} key={rev.id} />
                ))}
            </div>
            {!loading && reviews.length > visibleCount && (
                <div className="btn-more-reviews-container">
                    <div className='btn-more-reviews' onClick={loadMore}>
                        Ver más valoraciones
                    </div>
                </div>
            )}
        </>
    )
}
