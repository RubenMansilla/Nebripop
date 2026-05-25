// Categorías → iconos (servidos desde /public)
export const categoryIcons: Record<string, string> = {
  "Hogar y jardín": "/category-icons/hogar-y-jardin.png",
  "Bricolaje": "/category-icons/bricolaje.png",
  "Deporte y ocio": "/category-icons/deporte-y-ocio.png",
  "Industria y agricultura": "/category-icons/industria-y-agricultura.png",
  "Motos": "/category-icons/motos.png",
  "Motor y accesorios": "/category-icons/motor-y-accesorios.png",
  "Moda y accesorios": "/category-icons/moda-y-accesorios.png",
  "Tecnología y electrónica": "/category-icons/tecnologia-y-electronica.png",
  "Mascotas": "/category-icons/mascotas.png",
  "Electrodomésticos": "/category-icons/electrodomesticos.png",
};

export const getCategoryIcon = (categoryName?: string) => {
  if (!categoryName) return "/category-icons/default.png";
  return categoryIcons[categoryName] ?? "/category-icons/default.png";
};
