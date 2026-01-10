import Navbar from "../../components/Navbar/Navbar";
import CategoriesBar from "../../components/CategoriesBar/CategoriesBar";
import FormularioProducto from "./FormularioProducto";

export default function SellProduct() {
  return (
    <>
      <div className='navbar-and-categoriesbar'>

        <Navbar />
        <CategoriesBar />
      </div>

      <div style={{ paddingTop: "30px", paddingBottom: "50px" }}>
        <FormularioProducto />
      </div>
    </>
  );
}
