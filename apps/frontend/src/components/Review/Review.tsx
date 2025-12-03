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
                        <p className="review-date">Se unio a Nebripop en 2020</p>
                    </div>
                </div>
                <div className="review-body">
                    <div className='review-note'>
                        <div className='stars'>
                            <span>★</span>
                            <span>★</span>
                            <span>★</span>
                            <span>★</span>
                            <span>☆</span>
                        </div>
                        <p className='review-date'>22/10/2025</p>
                    </div>
                    <div className="review-text">
                        <p>Excelente experiencia de compra, el producto llegó en perfectas condiciones y el servicio al cliente fue muy atento.</p>
                    </div>
                    <div className="review-product">
                        <div className="review-product-img">
                            <img src={picture} alt="Foto de producto" />
                        </div>
                        <div className="review-product-info">
                            <p className="review-product-ds">Vendió por envio:</p>
                            <p className="review-product-name">Zapatillas nike nike nike nike</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
