export async function createProduct(data: any, images: File[], token: string) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (
            value !== undefined &&
            value !== null &&
            value !== "" &&
            !Number.isNaN(value)
        ) {
            formData.append(key, String(value));
        }
    });

    for (const img of images) {
        formData.append("images", img);
    }

    const res = await fetch("http://localhost:3001/products", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    if (!res.ok) throw new Error("Error al crear producto");
    return res.json();
}

export async function getMyActiveProducts(token: string) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/products/my-products/active`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) throw new Error("Error al obtener productos activos");
    return res.json();
}

export async function getMySoldProducts(token: string) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/products/my-products/sold`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) throw new Error("Error al obtener productos vendidos");
    return res.json();
}

export async function getAllProducts() {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
        method: "GET",
    });

    if (!res.ok) throw new Error("Error al obtener todos los productos");
    return res.json();
}
