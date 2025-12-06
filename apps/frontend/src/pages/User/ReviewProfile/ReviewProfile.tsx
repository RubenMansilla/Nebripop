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

    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const sortRef = useRef<HTMLDivElement | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const { user } = useContext(AuthContext);

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
        if (!user) return;
        setLoading(true); // activa skeleton antes de pedir las reviews
        getReviews(user?.id, sortOption)
            .then(data => {
                setReviews(data);
                const total = data.length;
                const avg = total
                    ? data.reduce((acc: number, r: ReviewType) => acc + r.rating, 0) / total
                    : 0;
                setVisibleCount(35); // reiniciar al cambiar de orden
                reviewSummaryStore.set({ average: avg, total });

            })
            .finally(() => setLoading(false)); // desactiva skeleton cuando llega la data
    }, [sortOption]);

    // useEffect para ajustar el ancho del dropdown cuando el componente se monta
    useEffect(() => {
        if (sortRef.current && dropdownRef.current) {
            const sortWidth = sortRef.current.getBoundingClientRect().width;
            dropdownRef.current.style.width = `${sortWidth}px`;
        }
    }, [open]); // Ejecutar cuando se abra el dropdown (y cuando 'open' cambie)

    /* info item active */
    const [selected, setSelected] = useState("valoraciones");

    useEffect(() => {
        if (selected === "perfil") {
            navigate("/profile/info");
        }
    }, [selected, navigate]);

    return (
        <>
            <Navbar />
            <div className="navbar-line"></div>
            <CategoriesBar />
            <section className='sidebar-container'>
                <div className='hide-left-sidebar'>
                    <ProfileSideBar />
                </div>
                <div className='sidebar-right'>
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
                                console.log(open);
                            }}
                        >
                            <p>Ordenar por: {selectedLabel}</p>
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
                                <path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 10l5 5m0 0l5-5" />
                            </svg>
                        </div>
                        {open && (
                            <div className="sort-dropdown" ref={dropdownRef}>
                                <p
                                    className={sortOption === "newest" ? "active" : ""}
                                    onClick={() => selectOption("newest")}
                                >
                                    Más recientes
                                </p>
                                <p
                                    className={sortOption === "oldest" ? "active" : ""}
                                    onClick={() => selectOption("oldest")}
                                >
                                    Más antiguas
                                </p>
                                <p
                                    className={sortOption === "low-rating" ? "active" : ""}
                                    onClick={() => selectOption("low-rating")}
                                >
                                    Valoración: menor a mayor
                                </p>
                                <p
                                    className={sortOption === "high-rating" ? "active" : ""}
                                    onClick={() => selectOption("high-rating")}
                                >
                                    Valoración: mayor a menor
                                </p>
                            </div>
                        )}
                    </div>
                    {!loading && reviews.length === 0 && (
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
                    <div className="review-container" {...((!loading && reviews.length === 0) ? { style: { display: 'none' } } : {})}>
                        {loading && (
                            <>
                                <ReviewSkeleton />
                                <ReviewSkeleton />
                                <ReviewSkeleton />
                            </>
                        )}
                        {!loading && reviews.length > 0 &&
                            reviews.slice(0, visibleCount).map((rev) => (
                                <Review review={rev} key={rev.id} />
                            ))
                        }
                    </div>
                    {!loading && reviews.length > visibleCount && (
                        <div className="btn-more-reviews-container">
                            <div className='btn-more-reviews' onClick={loadMore}>
                                Ver más valoraciones
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}
