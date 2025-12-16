// =========================
// PRODUCTS API
// =========================

// ---------- CREAR PRODUCTO ----------
export async function createProduct(
  data: any,
  images: File[],
  token: string
) {
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

  const res = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Error al crear producto");
  }

  return res.json();
}

// ---------- MIS PRODUCTOS ACTIVOS ----------
export async function getMyActiveProducts(token: string) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/products/my-products/active`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Error al obtener productos activos");
  }

  return res.json();
}

// ---------- MIS PRODUCTOS VENDIDOS ----------
export async function getMySoldProducts(token: string) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/products/my-products/sold`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Error al obtener productos vendidos");
  }

  return res.json();
}

// ---------- TODOS LOS PRODUCTOS (HOME) ----------
export async function getAllProducts(token?: string | null) {
  const headers: any = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    throw new Error("Error al obtener todos los productos");
  }

  return res.json();
}

// ---------- PRODUCTO POR ID ----------
export async function getProductById(productId: string) {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/products/${productId}`,
    {
      method: "GET",
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : undefined,
    }
  );

  if (!res.ok) {
    throw new Error("Error al obtener el producto");
  }

  return res.json();
}

// ---------- ELIMINAR PRODUCTO ----------
export async function deleteProduct(productId: number, token: string) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/products/${productId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || "No se pudo eliminar el producto"
    );
  }

  if (res.status === 204) {
    return true;
  }

  return res.json();
}

// ---------- MIS COMPRAS FINALIZADAS ----------
export async function getMyPurchasedProducts(token: string) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/products/my-products/purchased`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || "Error al obtener productos comprados"
    );
  }

  return res.json();
}

// ---------- PROCESO DE COMPRA ----------
export async function getMyBuyingProcessProducts(token: string) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/products/my-products/buying-process`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        "Error al obtener productos en proceso de compra"
    );
  }

  return res.json();
}

// ---------- PROCESO DE VENTA ----------
export async function getMySellingProcessProducts(token: string) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/products/my-products/selling-process`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        "Error al obtener productos en proceso de venta"
    );
  }

  return res.json();
}

// ---------- PRODUCTOS PÚBLICOS DE UN USUARIO ----------
export async function getPublicProductsByUser(userId: number) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/products/public/user/${userId}`
  );

  if (!res.ok) {
    throw new Error("Error obteniendo productos del usuario");
  }

  return res.json();
}
