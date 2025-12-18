// src/utils/subcategoryIcons.ts

// Carga automática de: src/assets/subcategory-icons/**.png
const modules = import.meta.glob("../assets/subcategory-icons/**/*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const DEFAULT_ICON = "/src/assets/subcategory-icons/default.png";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes
    .replace(/&/g, "y")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .trim();

export const getSubcategoryIcon = (categoryName?: string, subcategoryName?: string) => {
  if (!categoryName || !subcategoryName) return DEFAULT_ICON;

  const catSlug = slugify(categoryName);
  const subSlug = slugify(subcategoryName);

  // Ojo: la key del glob es relativa a ESTE fichero
  const key = `../assets/subcategory-icons/${catSlug}/${subSlug}.png`;

  return modules[key] ?? DEFAULT_ICON;
};
