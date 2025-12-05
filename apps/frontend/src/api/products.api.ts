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
