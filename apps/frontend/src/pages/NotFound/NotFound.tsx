import './NotFound.css'
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar'
import CategoriesBar from '../../components/CategoriesBar/CategoriesBar';
import noReviewsImg from '../../assets/profile/not-found.png';

export default function NotFound() {

    const navigate = useNavigate();

    return (
        <>
            <Navbar />
            <CategoriesBar />
            <section className='not-found-container'>
                <div className="not-found">
                    <img
                        src={noReviewsImg}
                        alt="Sin valoraciones"
                        className="no-reviews-img"
                    />
                    <h3>Nada por aquí...</h3>
                    <p>Esta página no existe en Nebripop, lo que sí que existen son miles de oportunidades esperándote.</p>
                    <div className="back-home" onClick={() => navigate('/')}>
                        <p>Ver productos</p>
                    </div>
                </div>
            </section>
        </>
    )
}
