const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

/**
 * Resolves a Strapi image object (v4 or v5 shape) to an absolute URL.
 */
function resolveImageUrl(imageField) {
  const imageData = imageField?.data ?? imageField;
  const imageAttrs = imageData?.attributes ?? imageData;
  return imageAttrs?.url
    ? imageAttrs.url.startsWith("http")
      ? imageAttrs.url
      : `${STRAPI_URL}${imageAttrs.url}`
    : null;
}

/**
 * Fetches data from Strapi REST API.
 *
 * Uses Next.js cache tagging instead of time-based revalidation.
 * All fetches are tagged "menu" so that a single revalidateTag("menu") call
 * — triggered by the Strapi webhook at /api/revalidate — purges every cached
 * Strapi response at once. Until that webhook fires, responses are served
 * from the static cache indefinitely (as fast as a CDN file).
 */
async function fetchStrapi(path, params = {}) {
  const url = new URL(`${STRAPI_URL}/api${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  const res = await fetch(url.toString(), {
    next: { tags: ["menu"] },
  });

  if (!res.ok) {
    throw new Error(`Strapi fetch failed: ${res.status} ${res.statusText} — ${url}`);
  }

  return res.json();
}

/**
 * Fetches all sections for a given locale, ordered by `order` asc.
 * Returns documentId (stable across locales) alongside the numeric id.
 */
export async function getSections(locale) {
  const data = await fetchStrapi("/sections", {
    locale,
    "pagination[pageSize]": 100,
    "fields[0]": "name",
    "fields[1]": "order",
    "sort": "order:asc",
  });

  return (data.data || []).map((item) => {
    const attrs = item.attributes ?? item;
    return {
      id: item.id,
      documentId: item.documentId ?? String(item.id),
      name: attrs.name ?? item.name,
      order: attrs.order ?? 0,
    };
  });
}

/**
 * Fetches all categories for a given locale, including their section relation.
 * Returns documentId (stable across locales) alongside the numeric id.
 */
export async function getCategories(locale) {
  const data = await fetchStrapi("/categories", {
    locale,
    "pagination[pageSize]": 100,
    "fields[0]": "name",
    "fields[1]": "slug",
    "populate[0]": "image",
    "populate[1]": "section",
    "sort": "order:asc",
  });

  return (data.data || []).map((item) => {
    const attrs = item.attributes ?? item;

    const imageUrl = resolveImageUrl(attrs.image);

    const sectionData = attrs.section?.data ?? attrs.section;
    const sectionAttrs = sectionData?.attributes ?? sectionData;

    return {
      id: item.id,
      documentId: item.documentId ?? attrs.slug ?? String(item.id),
      name: attrs.name ?? item.name,
      slug: attrs.slug ?? item.slug,
      imageUrl,
      sectionId: sectionData?.id ?? null,
      sectionName: sectionAttrs?.name ?? null,
    };
  });
}

/**
 * Fetches all available menu items for a given locale.
 * Items where isAvailable is false are filtered out.
 */
export async function getMenuItems(locale) {
  const data = await fetchStrapi("/menu-items", {
    locale,
    "filters[isAvailable][$eq]": "true",
    "populate[0]": "image",
    "populate[1]": "category",
    "pagination[pageSize]": 200,
    "sort": "order:asc",
  });

  return (data.data || []).map(normalizeMenuItem);
}

/**
 * Fetches a single menu item by documentId for a given locale.
 */



/**
 * Normalizes a Strapi item response (handles both v4 and v5 shapes).
 */
function normalizeMenuItem(item) {
  const attrs = item.attributes ?? item;

  const imageData = attrs.image?.data ?? attrs.image;
  const imageAttrs = imageData?.attributes ?? imageData;
  const imageUrl = resolveImageUrl(attrs.image);

  const categoryData = attrs.category?.data ?? attrs.category;
  const categoryAttrs = categoryData?.attributes ?? categoryData;

  return {
    id: item.documentId ?? item.id,
    numericId: item.id,
    name: attrs.name,
    description: attrs.description,
    price: attrs.price,
    isAvailable: attrs.isAvailable ?? true,
    imageUrl,
    imageAlt: imageAttrs?.alternativeText || attrs.name,
    categoryId: categoryData?.id ?? null,
    categoryName: categoryAttrs?.name ?? null,
    categorySlug: categoryAttrs?.slug ?? null,
  };
}