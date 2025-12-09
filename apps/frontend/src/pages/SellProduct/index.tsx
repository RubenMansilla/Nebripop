import Navbar from "../../components/Navbar/Navbar";
import CategoriesBar from "../../components/CategoriesBar/CategoriesBar";
import FormularioProducto from "./FormularioProducto";

export default function SellProduct() {
  return (
    <>
      <Navbar />
      <CategoriesBar />

      <div style={{ paddingTop: "30px", paddingBottom: "50px" }}>
        <FormularioProducto />
      </div>
    </>
  );
}
