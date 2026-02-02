import { useState } from 'react';
import './PublicReview.css';
import { createReview } from '../../api/reviews.api';
import { BiX } from "react-icons/bi";
import { useNotificationSettings } from '../../context/NotificationContext';
import { toast } from 'react-toastify';

interface PublicReviewProps {
    onClose: () => void;
    onSuccess?: () => void;
    productName: string;
    productId?: number;
    productImage?: string;
    seller_id?: string | number;
}

export default function PublicReview({ onClose, onSuccess, productName, productId, productImage, seller_id }: PublicReviewProps) {

    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [text, setText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [errors, setErrors] = useState<{ rating?: string; text?: string; general?: string }>({});

    const { notify } = useNotificationSettings();

    const handleSubmit = async () => {

        // Limpiar errores previos
        setErrors({});

        if (rating === 0) {
            setErrors({ rating: "Debes seleccionar una valoración" });
            return;
        }

        // Validación: Texto
        if (!text.trim()) {
            setErrors({ text: "Debes escribir una opinión sobre el producto" });
            return;
        }

        setIsSubmitting(true);

        if (!productId) {
            setErrors({ general: "No se ha podido identificar el producto para la reseña" });
            setIsSubmitting(false);
            return;
        }

        try {
            await createReview({
                owner_id: Number(seller_id),
                rating: rating,
                comment: text,
                product_id: Number(productId)
            });

            notify("newReview", "Reseña publicada con éxito", "success");

            if (onSuccess) {
                onSuccess();
            } else {
                onClose();
            }

        } catch (error: any) {
            console.error(error);
            toast.error("Error al publicar la reseña");

        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>

                <button className="atm-close-btn" onClick={onClose}><BiX size={24} /></button>

                <div className="public-review-container">

                    <div className="product-review-data">
                        <div className="product-image-container">
                            <img src={productImage} alt="Producto" />
                        </div>
                        <div className="product-info-review">
                            <h2>¿En qué estado estaba el producto?</h2>
                            <p className="product-name-review">{productName}</p>
                        </div>
                    </div>

                    <div className="product-note">
                        {[...Array(5)].map((_, index) => {
                            const ratingValue = index + 1;
                            return (
                                <label key={index}>
                                    <input
                                        type="radio"
                                        name="rating"
                                        value={ratingValue}
                                        onClick={() => setRating(ratingValue)}
                                        style={{ display: 'none' }}
                                    />
                                    <svg
                                        className="star-icon"
                                        onMouseEnter={() => setHover(ratingValue)}
                                        onMouseLeave={() => setHover(0)}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill={ratingValue <= (hover || rating) ? "#d6c9b4" : "transparent"}
                                        stroke={ratingValue <= (hover || rating) ? "#d6c9b4" : "#d6c9b4"}
                                    >
                                        <path d="M11.074 2.633c.32-.844 1.531-.844 1.852 0l2.07 5.734a.99.99 0 0 0 .926.633h5.087c.94 0 1.35 1.17.611 1.743L18 14a.97.97 0 0 0-.322 1.092L19 20.695c.322.9-.72 1.673-1.508 1.119l-4.917-3.12a1 1 0 0 0-1.15 0l-4.917 3.12c-.787.554-1.83-.22-1.508-1.119l1.322-5.603A.97.97 0 0 0 6 14l-3.62-3.257C1.64 10.17 2.052 9 2.99 9h5.087a.99.99 0 0 0 .926-.633z" />
                                    </svg>
                                </label>
                            );
                        })}
                    </div>

                    <div className="review-form">
                        <label>Escribe una reseña</label>
                        <div className="textarea-container">
                            <textarea
                                placeholder="Escribe tu opinión sobre el producto..."
                                maxLength={500}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            ></textarea>
                            <div className="char-counter">{text.length} / 500</div>
                        </div>
                    </div>

                    {(errors.rating || errors.text || errors.general) && (
                        <div className="error-box-inline">
                            {errors.rating}
                            {errors.text}
                            {errors.general}
                        </div>
                    )}

                    <div className="submit-container-review">
                        <button
                            className="submit-btn-review"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Enviando..." : "Enviar"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}