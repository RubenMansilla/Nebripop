// Categorías → iconos
export const categoryIcons: Record<string, string> = {
  "Hogar y jardín": "/src/assets/category-icons/hogar-y-jardin.png",
  "Bricolaje": "/src/assets/category-icons/bricolaje.png",
  "Deporte y ocio": "/src/assets/category-icons/deporte-y-ocio.png",
  "Industria y agricultura": "/src/assets/category-icons/industria-y-agricultura.png",
  "Motos": "/src/assets/category-icons/motos.png",
  "Motor y accesorios": "/src/assets/category-icons/motor-y-accesorios.png",
  "Moda y accesorios": "/src/assets/category-icons/moda-y-accesorios.png",
  "Tecnología y electrónica": "/src/assets/category-icons/tecnologia-y-electronica.png",
  "Mascotas": "/src/assets/category-icons/mascotas.png",
  "Electrodomésticos": "/src/assets/category-icons/electrodomesticos.png",
};

export const getCategoryIcon = (categoryName?: string) => {
  if (!categoryName) return "/src/assets/category-icons/default.png";
  return categoryIcons[categoryName] ?? "/src/assets/category-icons/default.png";
};
