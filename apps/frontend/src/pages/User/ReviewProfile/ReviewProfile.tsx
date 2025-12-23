import './ReviewProfile.css'
import { useRef, useState, useEffect, useContext } from 'react';
import Review from '../../../components/Review/Review';
import { getReviews } from "../../../api/reviews.api";
import type { ReviewType } from '../../../types/review';
import ReviewSkeleton from '../../../components/ReviewSkeleton/ReviewSkeleton';
import { reviewSummaryStore } from '../../../store/reviewSummaryStore';
import { AuthContext } from '../../../context/AuthContext';
import noReviewsImg from '../../../assets/profile/pop-no-reviews.svg';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar/Navbar'
import CategoriesBar from '../../../components/CategoriesBar/CategoriesBar'
import ProfileSideBar from '../../../components/Profile/ProfileSideBar/ProfileSideBar';

export default function ReviewProfile() {

    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const sortRef = useRef<HTMLDivElement | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const [open, setOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState("Más recientes");
    type SortOption = "newest" | "oldest" | "low-rating" | "high-rating";
    const [sortOption, setSortOption] = useState<SortOption>("newest");

    // --- State para la lógica de carga ---
    const [reviews, setReviews] = useState<ReviewType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSkeleton, setShowSkeleton] = useState(false); // Control visual

    const [visibleCount, setVisibleCount] = useState(35);

    const selectOption = (value: SortOption) => {
        setSortOption(value);
        switch (value) {
            case "newest": setSelectedLabel("Más recientes"); break;
            case "oldest": setSelectedLabel("Más antiguas"); break;
            case "low-rating": setSelectedLabel("Valoración: menor a mayor"); break;
            case "high-rating": setSelectedLabel("Valoración: mayor a menor"); break;
        }
        setOpen(false);
    };

    const loadMore = () => {
        setVisibleCount(prev => prev + 35);
    };

    useEffect(() => {
        if (!user) return;

        setLoading(true);
        setShowSkeleton(false);

        const skeletonTimer = setTimeout(() => {
            setShowSkeleton(true);
        }, 300);

        getReviews(user.id, sortOption)
            .then(data => {
                setReviews(data);
                const total = data.length;
                const avg = total
                    ? data.reduce((acc: number, r: ReviewType) => acc + r.rating, 0) / total
                    : 0;

                setVisibleCount(35);

                // --- CAMBIO AQUÍ ---
                // Ahora pasamos el user.id para firmar los datos
                if (user) {
                    reviewSummaryStore.set({ average: avg, total }, user.id);
                }
            })
            .catch(err => console.error(err))
            .finally(() => {
                clearTimeout(skeletonTimer);
                setLoading(false);
            });

        return () => clearTimeout(skeletonTimer);

    }, [sortOption, user]);

    // useEffect para ajustar el ancho del dropdown
    useEffect(() => {
        if (sortRef.current && dropdownRef.current) {
            const sortWidth = sortRef.current.getBoundingClientRect().width;
            dropdownRef.current.style.width = `${sortWidth}px`;
        }
    }, [open]);

    /* info item active */
    const [selected, setSelected] = useState("valoraciones");

    useEffect(() => {
        if (selected === "perfil") {
            navigate("/profile/info");
        }
    }, [selected, navigate]);

    return (
        <>
            <div className="info-section">
                <div className="info-container">
                    <div className="title">
                        <h1>Tu perfil</h1>
                    </div>
                    <div className="description">
                        <p>Aquí podrás ver y editar los datos de tu perfil</p>
                    </div>
                </div>
                <div className="logout" onClick={logout}>
                    <p>Cerrar sesión</p>
                </div>
            </div>
            <div className="info-selector">
                <div className="info-items">
                    <div
                        className={`info-item ${selected === "perfil" ? "active" : ""}`}
                        onClick={() => setSelected("perfil")}
                    >
                        <p>Perfil</p>
                    </div>
                    <div
                        className={`info-item ${selected === "valoraciones" ? "active" : ""}`}
                        onClick={() => setSelected("valoraciones")}
                    >
                        <p>Valoraciones</p>
                    </div>
                </div>
            </div>

            <div className="sort-by-container">
                <div
                    className={`sort-by ${(!loading && reviews.length === 0) ? "disabled" : ""}`}
                    ref={sortRef}
                    onClick={() => {
                        if (!loading && reviews.length === 0) return;
                        setOpen(!open);
                    }}
                >
                    <p>Ordenar por: {selectedLabel}</p>
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
                        <path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 10l5 5m0 0l5-5" />
                    </svg>
                </div>
                {open && (
                    <div className="sort-dropdown" ref={dropdownRef}>
                        <p className={sortOption === "newest" ? "active" : ""} onClick={() => selectOption("newest")}>Más recientes</p>
                        <p className={sortOption === "oldest" ? "active" : ""} onClick={() => selectOption("oldest")}>Más antiguas</p>
                        <p className={sortOption === "low-rating" ? "active" : ""} onClick={() => selectOption("low-rating")}>Valoración: menor a mayor</p>
                        <p className={sortOption === "high-rating" ? "active" : ""} onClick={() => selectOption("high-rating")}>Valoración: mayor a menor</p>
                    </div>
                )}
            </div>

            {/* --- RENDERIZADO CONDICIONAL LIMPIO --- */}

            {/* CASO 1: Cargando Lento -> Skeleton */}
            {loading && showSkeleton ? (
                <div className="review-container">
                    <ReviewSkeleton />
                    <ReviewSkeleton />
                    <ReviewSkeleton />
                </div>
            ) : (
                /* CASO 2: Carga terminada (o muy rápida) */
                <>
                    {/* Sub-caso: No hay reviews */}
                    {reviews.length === 0 && !loading && (
                        <div className="no-reviews">
                            <img
                                src={noReviewsImg}
                                alt="Sin valoraciones"
                                className="no-reviews-img"
                            />
                            <h3>Nadie ha opinado todavía</h3>
                            <p>
                                Después de una transacción pide que te valoren.
                                Las opiniones inspiran confianza.
                            </p>
                        </div>
                    )}

                    {/* Sub-caso: Hay reviews */}
                    {reviews.length > 0 && (
                        <>
                            <div className="review-container">
                                {reviews.slice(0, visibleCount).map((rev) => (
                                    <Review review={rev} key={rev.id} />
                                ))}
                            </div>

                            {reviews.length > visibleCount && (
                                <div className="btn-more-reviews-container">
                                    <div className='btn-more-reviews' onClick={loadMore}>
                                        Ver más valoraciones
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </>
    )
}