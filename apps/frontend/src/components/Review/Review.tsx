import './Review.css'
import type { ReviewType } from '../../types/review';
import { formatRelativeTime } from '../../utils/date';
import { formatAccountAge } from "../../utils/accountAge";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Review({ review }: { review: ReviewType }) {

    const createSlug = (name: string) => {
        return name
            .toString()
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar tildes
            .trim()
            .replace(/\s+/g, '-') // Espacios a guiones
            .replace(/[^\w-]+/g, '') // Borrar caracteres raros
            .replace(/--+/g, '-'); // Quitar guiones dobles
    };


    const navigate = useNavigate();

    const [isExpanded, setIsExpanded] = useState(false);

    const isLongText = review.comment.length > 150;

    const defaultProfile = "https://zxetwkoirtyweevvatuf.supabase.co/storage/v1/object/sign/userImg/Default_Profile_Picture.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kYWMwYTY1NC1mOTY4LTQyNjYtYmVlYy1lYjdkY2EzNmI2NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ1c2VySW1nL0RlZmF1bHRfUHJvZmlsZV9QaWN0dXJlLnBuZyIsImlhdCI6MTc2NDU4MzQ3OSwiZXhwIjoxNzk2MTE5NDc5fQ.yJUBlEuws9Tl5BK9tIyMNtKp52Jj8reTF_y_a71oR1I";

    return (
        <>
            <div className="review">
                <div className="review-header">
                    <div className="reviewer-pic">
                        <img
                            src={review.reviewer?.profilePicture || defaultProfile}
                            alt="Foto de usuario"
                            onClick={() => {
                                const slug = createSlug(review.reviewer.fullName);
                                navigate(`/users/${slug}-${review.reviewer.id}`);
                            }}
                        />
                    </div>
                    <div className="reviewer-info">
                        <p className="reviewer-name">{review.reviewer.fullName}</p>
                        <p className="review-date">
                            {formatAccountAge(review.reviewer.createdAt)}
                        </p>
                    </div>
                </div>
                <div className="review-body">
                    <div className='review-note'>
                        <div className='stars'>
                            <div className="stars">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <svg
                                        key={n}
                                        className={`star ${n <= review.rating ? 'filled' : ''}`}
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M11.074 2.633c.32-.844 1.531-.844 1.852 0l2.07 5.734a.99.99 0 0 0 .926.633h5.087c.94 0 1.35 1.17.611 1.743L18 14a.97.97 0 0 0-.322 1.092L19 20.695c.322.9-.72 1.673-1.508 1.119l-4.917-3.12a1 1 0 0 0-1.15 0l-4.917 3.12c-.787.554-1.83-.22-1.508-1.119l1.322-5.603A.97.97 0 0 0 6 14l-3.62-3.257C1.64 10.17 2.052 9 2.99 9h5.087a.99.99 0 0 0 .926-.633z" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                        <p className="review-date">{formatRelativeTime(review.created_at)}</p>
                    </div>
                    <div className={`review-text ${isExpanded ? 'expanded' : 'collapsed'}`}>
                        <p>{review.comment}</p>
                        {isLongText && (
                            <button
                                className="read-more-btn"
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                {isExpanded ? 'Ver menos' : 'Ver más'}
                            </button>
                        )}
                    </div>
                    <div className="review-product"
                        onClick={() => { navigate(`/product/${review.product.id}`); }}
                    >
                        <div className="review-product-img">
                            <img
                                src={review.product.images[0]?.image_url || defaultProfile}
                                alt="Foto de producto"
                            />
                        </div>
                        <div className="review-product-info">
                            <p className="review-product-ds">Compró por envío:</p>
                            <p className="review-product-name">{review.product.name}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
