// src/data/homeCategories.ts

export type HomeSubcategory = {
  id: number;
  name: string;
  icon: string;
};

export type HomeCategoryBlock = {
  categoryId: number;
  categoryName: string;
  subcategories: HomeSubcategory[];
};

export const HOME_CATEGORIES: HomeCategoryBlock[] = [
  // 💻 Tecnología y electrónica
  {
    categoryId: 8,
    categoryName: "Tecnología y electrónica",
    subcategories: [
      {
        id: 36,
        name: "Móviles",
        icon: "/assets/subcategory-icons/tecnologia-y-electronica/moviles.svg",
      },
      {
        id: 37,
        name: "Portátiles",
        icon: "/assets/subcategory-icons/tecnologia-y-electronica/portatiles.svg",
      },
      {
        id: 38,
        name: "Auriculares",
        icon: "/assets/subcategory-icons/tecnologia-y-electronica/auriculares.svg",
      },
      {
        id: 39,
        name: "Consolas",
        icon: "/assets/subcategory-icons/tecnologia-y-electronica/consolas.svg",
      },
      {
        id: 40,
        name: "Televisores",
        icon: "/assets/subcategory-icons/tecnologia-y-electronica/televisores.svg",
      },
    ],
  },

  // 🌿 Hogar y jardín
  {
    categoryId: 1,
    categoryName: "Hogar y jardín",
    subcategories: [
      {
        id: 1,
        name: "Muebles",
        icon: "/assets/subcategory-icons/hogar-y-jardin/muebles.svg",
      },
      {
        id: 2,
        name: "Decoración",
        icon: "/assets/subcategory-icons/hogar-y-jardin/decoracion.svg",
      },
      {
        id: 3,
        name: "Cocina",
        icon: "/assets/subcategory-icons/hogar-y-jardin/cocina.svg",
      },
      {
        id: 4,
        name: "Baño",
        icon: "/assets/subcategory-icons/hogar-y-jardin/bano.svg",
      },
      {
        id: 5,
        name: "Jardín",
        icon: "/assets/subcategory-icons/hogar-y-jardin/jardin.svg",
      },
    ],
  },

  // 🔨 Bricolaje
  {
    categoryId: 2,
    categoryName: "Bricolaje",
    subcategories: [
      {
        id: 10,
        name: "Herramientas",
        icon: "/assets/subcategory-icons/bricolaje/herramientas.svg",
      },
      {
        id: 6,
        name: "Taladros",
        icon: "/assets/subcategory-icons/bricolaje/taladros.svg",
      },
      {
        id: 7,
        name: "Pintura",
        icon: "/assets/subcategory-icons/bricolaje/pintura.svg",
      },
      {
        id: 8,
        name: "Tornillería",
        icon: "/assets/subcategory-icons/bricolaje/tornilleria.svg",
      },
      {
        id: 9,
        name: "Sierras",
        icon: "/assets/subcategory-icons/bricolaje/sierras.svg",
      },
    ],
  },

  // 🏃 Deporte y ocio
  {
    categoryId: 3,
    categoryName: "Deporte y ocio",
    subcategories: [
      {
        id: 11,
        name: "Fitness",
        icon: "/assets/subcategories/deporte-y-ocio/fitness.png",
      },
      {
        id: 12,
        name: "Ciclismo",
        icon: "/assets/subcategories/deporte-y-ocio/ciclismo.png",
      },
      {
        id: 13,
        name: "Fútbol",
        icon: "/assets/subcategories/deporte-y-ocio/futbol.png",
      },
      {
        id: 14,
        name: "Running",
        icon: "/assets/subcategories/deporte-y-ocio/running.png",
      },
      {
        id: 15,
        name: "Otros deportes",
        icon: "/assets/subcategories/deporte-y-ocio/otros-deportes.png",
      },
    ],
  },
];
