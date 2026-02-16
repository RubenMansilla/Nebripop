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
                icon: "/assets/subcategories/tecnologia-y-electronica/moviles.webp",
            },
            {
                id: 37,
                name: "Portátiles",
                icon: "/assets/subcategories/tecnologia-y-electronica/portatiles.webp",
            },
            {
                id: 38,
                name: "Auriculares",
                icon: "/assets/subcategories/tecnologia-y-electronica/auriculares.webp",
            },
            {
                id: 39,
                name: "Consolas",
                icon: "/assets/subcategories/tecnologia-y-electronica/consolas.webp",
            },
            {
                id: 40,
                name: "Televisores",
                icon: "/assets/subcategories/tecnologia-y-electronica/televisores.webp",
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
                icon: "/assets/subcategories/hogar-y-jardin/muebles.webp",
            },
            {
                id: 2,
                name: "Decoración",
                icon: "/assets/subcategories/hogar-y-jardin/decoracion.webp",
            },
            {
                id: 3,
                name: "Cocina",
                icon: "/assets/subcategories/hogar-y-jardin/cocina.webp",
            },
            {
                id: 4,
                name: "Baño",
                icon: "/assets/subcategories/hogar-y-jardin/bano.webp",
            },
            {
                id: 5,
                name: "Jardín",
                icon: "/assets/subcategories/hogar-y-jardin/jardin.webp",
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
                icon: "/assets/subcategories/bricolaje/herramientas.webp",
            },
            {
                id: 6,
                name: "Taladros",
                icon: "/assets/subcategories/bricolaje/taladros.webp",
            },
            {
                id: 7,
                name: "Pintura",
                icon: "/assets/subcategories/bricolaje/pintura.webp",
            },
            {
                id: 8,
                name: "Tornillería",
                icon: "/assets/subcategories/bricolaje/tornilleria.webp",
            },
            {
                id: 9,
                name: "Sierras",
                icon: "/assets/subcategories/bricolaje/sierras.webp",
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
                icon: "/assets/subcategories/deporte-y-ocio/fitness.webp",
            },
            {
                id: 12,
                name: "Ciclismo",
                icon: "/assets/subcategories/deporte-y-ocio/ciclismo.webp",
            },
            {
                id: 13,
                name: "Fútbol",
                icon: "/assets/subcategories/deporte-y-ocio/futbol.webp",
            },
            {
                id: 14,
                name: "Running",
                icon: "/assets/subcategories/deporte-y-ocio/running.webp",
            },
            {
                id: 15,
                name: "Otros deportes",
                icon: "/assets/subcategories/deporte-y-ocio/otros-deportes.webp",
            },
        ],
    },

    {
        categoryId: 4,
        categoryName: "Industria y agricultura",
        subcategories: [
            {
                id: 16,
                name: "Maquinaria",
                icon: "/assets/subcategories/industria-y-agricultura/maquinaria.webp",
            },
            {
                id: 17,
                name: "Suministros",
                icon: "/assets/subcategories/industria-y-agricultura/suministros.webp",
            },
            {
                id: 18,
                name: "Materiales",
                icon: "/assets/subcategories/industria-y-agricultura/materiales.webp",
            },
            {
                id: 19,
                name: "Seguridad",
                icon: "/assets/subcategories/industria-y-agricultura/seguridad.webp",
            },
            {
                id: 20,
                name: "Otros",
                icon: "/assets/subcategories/industria-y-agricultura/otros.webp",
            },
        ],
    },

    {
        categoryId: 6,
        categoryName: "Motor y accesorios",
        subcategories: [
            {
                id: 22,
                name: "Piezas",
                icon: "/assets/subcategories/motor-y-accesorios/piezas.webp",
            },
            {
                id: 27,
                name: "Neumáticos",
                icon: "/assets/subcategories/motor-y-accesorios/neumaticos.webp",
            },
            {
                id: 28,
                name: "Audio coche",
                icon: "/assets/subcategories/motor-y-accesorios/audio-coche.webp",
            },
            {
                id: 29,
                name: "Luces",
                icon: "/assets/subcategories/motor-y-accesorios/luces.webp",
            },
            {
                id: 30,
                name: "Averías",
                icon: "/assets/subcategories/motor-y-accesorios/averias.webp",
            },
        ],
    },

    {
        categoryId: 7,
        categoryName: "Moda y accesorios",
        subcategories: [
            {
                id: 31,
                name: "Hombre",
                icon: "/assets/subcategories/moda-y-accesorios/hombre.webp",
            },
            {
                id: 32,
                name: "Mujer",
                icon: "/assets/subcategories/moda-y-accesorios/mujer.webp",
            },
            {
                id: 33,
                name: "Calzado",
                icon: "/assets/subcategories/moda-y-accesorios/calzado.webp",
            },
            {
                id: 34,
                name: "Bolsos",
                icon: "/assets/subcategories/moda-y-accesorios/bolsos.webp",
            },
            {
                id: 23,
                name: "Accesorios",
                icon: "/assets/subcategories/moda-y-accesorios/accesorios.webp",
            },
        ],
    },


];
