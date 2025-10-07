export function mapToRequestPayload(filters) {
  const payload = {};

  if (Array.isArray(filters.brandIds) && filters.brandIds.length > 0) {
    payload.BrandIds = filters.brandIds;
  }

  if (Array.isArray(filters.categoryIds) && filters.categoryIds.length > 0) {
    payload.CategoryIds = filters.categoryIds;
  }

  if (Array.isArray(filters.colors) && filters.colors.length > 0) {
    payload.Colors = filters.colors;
  }

  if (Array.isArray(filters.sizes) && filters.sizes.length > 0) {
    payload.Sizes = filters.sizes;
  }

  if (Array.isArray(filters.genders) && filters.genders.length > 0) {
    payload.Genders = filters.genders;
  }

  if (typeof filters.minPrice === "number" && filters.minPrice > 0) {
    payload.MinPrice = filters.minPrice;
  }

  if (typeof filters.maxPrice === "number" && filters.maxPrice < 100000) {
    payload.MaxPrice = filters.maxPrice;
  }

  if (typeof filters.searchTerm === "string" && filters.searchTerm.trim() !== "") {
    payload.SearchTerm = filters.searchTerm.trim();
  }

  return payload;
}
