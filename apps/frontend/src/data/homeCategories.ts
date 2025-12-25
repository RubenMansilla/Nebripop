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
                icon: "/assets/subcategories/tecnologia-y-electronica/moviles.png",
            },
            {
                id: 37,
                name: "Portátiles",
                icon: "/assets/subcategories/tecnologia-y-electronica/portatiles.png",
            },
            {
                id: 38,
                name: "Auriculares",
                icon: "/assets/subcategories/tecnologia-y-electronica/auriculares.png",
            },
            {
                id: 39,
                name: "Consolas",
                icon: "/assets/subcategories/tecnologia-y-electronica/consolas.png",
            },
            {
                id: 40,
                name: "Televisores",
                icon: "/assets/subcategories/tecnologia-y-electronica/televisores.png",
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
                icon: "/assets/subcategories/hogar-y-jardin/muebles.png",
            },
            {
                id: 2,
                name: "Decoración",
                icon: "/assets/subcategories/hogar-y-jardin/decoracion.png",
            },
            {
                id: 3,
                name: "Cocina",
                icon: "/assets/subcategories/hogar-y-jardin/cocina.png",
            },
            {
                id: 4,
                name: "Baño",
                icon: "/assets/subcategories/hogar-y-jardin/bano.png",
            },
            {
                id: 5,
                name: "Jardín",
                icon: "/assets/subcategories/hogar-y-jardin/jardin.png",
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
                icon: "/assets/subcategories/bricolaje/herramientas.png",
            },
            {
                id: 6,
                name: "Taladros",
                icon: "/assets/subcategories/bricolaje/taladros.png",
            },
            {
                id: 7,
                name: "Pintura",
                icon: "/assets/subcategories/bricolaje/pintura.png",
            },
            {
                id: 8,
                name: "Tornillería",
                icon: "/assets/subcategories/bricolaje/tornilleria.png",
            },
            {
                id: 9,
                name: "Sierras",
                icon: "/assets/subcategories/bricolaje/sierras.png",
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

    {
        categoryId: 4,
        categoryName: "Industria y agricultura",
        subcategories: [
            {
                id: 16,
                name: "Maquinaria",
                icon: "/assets/subcategories/industria-y-agricultura/maquinaria.png",
            },
            {
                id: 17,
                name: "Suministros",
                icon: "/assets/subcategories/industria-y-agricultura/suministros.png",
            },
            {
                id: 18,
                name: "Materiales",
                icon: "/assets/subcategories/industria-y-agricultura/materiales.png",
            },
            {
                id: 19,
                name: "Seguridad",
                icon: "/assets/subcategories/industria-y-agricultura/seguridad.png",
            },
            {
                id: 20,
                name: "Otros",
                icon: "/assets/subcategories/industria-y-agricultura/otros.png",
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
                icon: "/assets/subcategories/motor-y-accesorios/piezas.png",
            },
            {
                id: 27,
                name: "Neumáticos",
                icon: "/assets/subcategories/motor-y-accesorios/neumaticos.png",
            },
            {
                id: 28,
                name: "Audio coche",
                icon: "/assets/subcategories/motor-y-accesorios/audio-coche.png",
            },
            {
                id: 29,
                name: "Luces",
                icon: "/assets/subcategories/motor-y-accesorios/luces.png",
            },
            {
                id: 30,
                name: "Averías",
                icon: "/assets/subcategories/motor-y-accesorios/averias.png",
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
                icon: "/assets/subcategories/moda-y-accesorios/hombre.png",
            },
            {
                id: 32,
                name: "Mujer",
                icon: "/assets/subcategories/moda-y-accesorios/mujer.png",
            },
            {
                id: 33,
                name: "Calzado",
                icon: "/assets/subcategories/moda-y-accesorios/calzado.png",
            },
            {
                id: 34,
                name: "Bolsos",
                icon: "/assets/subcategories/moda-y-accesorios/bolsos.png",
            },
            {
                id: 23,
                name: "Accesorios",
                icon: "/assets/subcategories/moda-y-accesorios/accesorios.png",
            },
        ],
    },


];
