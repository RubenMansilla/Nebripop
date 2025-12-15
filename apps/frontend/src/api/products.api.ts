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

export async function getAllProducts(token?: string | null) {
  const headers: any = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
    method: "GET",
    headers,
  });

  if (!res.ok) throw new Error("Error al obtener todos los productos");
  return res.json();
}

export async function getProductById(productId: string) {
  const token = localStorage.getItem('token'); // O desde el contexto de autenticación

  const res = await fetch(`${import.meta.env.VITE_API_URL}/products/${productId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`, // Pasar el token aquí
    },
  });

  if (!res.ok) {
    throw new Error("Error al obtener el producto");
  }
  return res.json();
}

export async function deleteProduct(productId: number, token: string) {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/products/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      // Intentamos leer el JSON de error del backend
      const errorData = await res.json().catch(() => ({}));
      // Lanzamos el mensaje del backend o uno por defecto
      throw new Error(errorData.message || `Error ${res.status}: No se pudo eliminar`);
    }

    // Si es 204 No Content, no intentes hacer .json()
    if (res.status === 204) return true;

    return res.json();
  } catch (error: any) {
    console.error("Error al eliminar el producto:", error);
    // CORRECCIÓN: Relanzamos el mensaje original para que el componente lo vea
    throw new Error(error.message || "Hubo un problema al eliminar el producto.");
  }
}

// Obtener mis productos COMPRADOS (Historial de compras)
export async function getMyPurchasedProducts(token: string) {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/products/my-products/purchased`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Error al obtener productos comprados");
    }

    return res.json();
  } catch (error: any) {
    console.error("Error en getMyPurchasedProducts:", error);
    throw new Error(error.message || "Error de conexión al obtener compras");
  }
}

// Obtener productos en PROCESO DE COMPRA
export async function getMyBuyingProcessProducts(token: string) {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/products/my-products/buying-process`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Error al obtener procesos de compra");
    }

    return res.json();
  } catch (error: any) {
    console.error("Error en getMyBuyingProcessProducts:", error);
    throw new Error(error.message || "Error de conexión");
  }
}

// Obtener productos en PROCESO DE VENTA
export async function getMySellingProcessProducts(token: string) {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/products/my-products/selling-process`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Error al obtener procesos de venta");
    }

    return res.json();
  } catch (error: any) {
    console.error("Error en getMySellingProcessProducts:", error);
    throw new Error(error.message || "Error de conexión");
  }
}