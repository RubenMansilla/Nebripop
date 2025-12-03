import './Review.css'
import picture from '../../assets/logos/image.png';

/*  Recibir sortOption para saber en que orden mostrar las reviews*/
export default function Review({ sortOption }: { sortOption: string }) {
    return (
        <>
            <div className="review">
                <div className="review-header">
                    <div className="reviewer-pic">
                        <img src="https://zxetwkoirtyweevvatuf.supabase.co/storage/v1/object/sign/userImg/Default_Profile_Picture.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kYWMwYTY1NC1mOTY4LTQyNjYtYmVlYy1lYjdkY2EzNmI2NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ1c2VySW1nL0RlZmF1bHRfUHJvZmlsZV9QaWN0dXJlLnBuZyIsImlhdCI6MTc2NDU4MzQ3OSwiZXhwIjoxNzk2MTE5NDc5fQ.yJUBlEuws9Tl5BK9tIyMNtKp52Jj8reTF_y_a71oR1I" alt="Foto de usuario" />
                    </div>
                    <div className="reviewer-info">
                        <p className="reviewer-name">Juan Pérez</p>
                        <p className="review-date">4 años en Nebripop</p>
                    </div>
                </div>
                <div className="review-body">
                    <div className='review-note'>
                        <div className='stars'>
                            <svg className="star" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                                <path d="M11.074 2.633c.32-.844 1.531-.844 1.852 0l2.07 5.734a.99.99 0 0 0 .926.633h5.087c.94 0 1.35 1.17.611 1.743L18 14a.97.97 0 0 0-.322 1.092L19 20.695c.322.9-.72 1.673-1.508 1.119l-4.917-3.12a1 1 0 0 0-1.15 0l-4.917 3.12c-.787.554-1.83-.22-1.508-1.119l1.322-5.603A.97.97 0 0 0 6 14l-3.62-3.257C1.64 10.17 2.052 9 2.99 9h5.087a.99.99 0 0 0 .926-.633z" />
                            </svg>
                            <svg className="star" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                                <path d="M11.074 2.633c.32-.844 1.531-.844 1.852 0l2.07 5.734a.99.99 0 0 0 .926.633h5.087c.94 0 1.35 1.17.611 1.743L18 14a.97.97 0 0 0-.322 1.092L19 20.695c.322.9-.72 1.673-1.508 1.119l-4.917-3.12a1 1 0 0 0-1.15 0l-4.917 3.12c-.787.554-1.83-.22-1.508-1.119l1.322-5.603A.97.97 0 0 0 6 14l-3.62-3.257C1.64 10.17 2.052 9 2.99 9h5.087a.99.99 0 0 0 .926-.633z" />
                            </svg>
                            <svg className="star" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                                <path d="M11.074 2.633c.32-.844 1.531-.844 1.852 0l2.07 5.734a.99.99 0 0 0 .926.633h5.087c.94 0 1.35 1.17.611 1.743L18 14a.97.97 0 0 0-.322 1.092L19 20.695c.322.9-.72 1.673-1.508 1.119l-4.917-3.12a1 1 0 0 0-1.15 0l-4.917 3.12c-.787.554-1.83-.22-1.508-1.119l1.322-5.603A.97.97 0 0 0 6 14l-3.62-3.257C1.64 10.17 2.052 9 2.99 9h5.087a.99.99 0 0 0 .926-.633z" />
                            </svg>
                            <svg className="star" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                                <path d="M11.074 2.633c.32-.844 1.531-.844 1.852 0l2.07 5.734a.99.99 0 0 0 .926.633h5.087c.94 0 1.35 1.17.611 1.743L18 14a.97.97 0 0 0-.322 1.092L19 20.695c.322.9-.72 1.673-1.508 1.119l-4.917-3.12a1 1 0 0 0-1.15 0l-4.917 3.12c-.787.554-1.83-.22-1.508-1.119l1.322-5.603A.97.97 0 0 0 6 14l-3.62-3.257C1.64 10.17 2.052 9 2.99 9h5.087a.99.99 0 0 0 .926-.633z" />
                            </svg>
                            <svg className="star" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                                <path d="M11.074 2.633c.32-.844 1.531-.844 1.852 0l2.07 5.734a.99.99 0 0 0 .926.633h5.087c.94 0 1.35 1.17.611 1.743L18 14a.97.97 0 0 0-.322 1.092L19 20.695c.322.9-.72 1.673-1.508 1.119l-4.917-3.12a1 1 0 0 0-1.15 0l-4.917 3.12c-.787.554-1.83-.22-1.508-1.119l1.322-5.603A.97.97 0 0 0 6 14l-3.62-3.257C1.64 10.17 2.052 9 2.99 9h5.087a.99.99 0 0 0 .926-.633z" />
                            </svg>
                        </div>
                        <p className='review-date'>Hace 4 días</p>
                    </div>
                    <div className="review-text">
                        <p>Excelente experiencia de compra, el producto llegó en perfectas condiciones y el servicio al cliente fue muy atento.</p>
                    </div>
                    <div className="review-product">
                        <div className="review-product-img">
                            <img src={picture} alt="Foto de producto" />
                        </div>
                        <div className="review-product-info">
                            <p className="review-product-ds">Vendió por envío:</p>
                            <p className="review-product-name">Zapatillas nike nike nike nike</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
