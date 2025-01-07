// src/utils/image-helper.js
const getImageBaseUrl = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (apiBaseUrl.endsWith("/api")) {
    return apiBaseUrl.slice(0, -4);
  }
  return apiBaseUrl;
};

export const getProductImageUrl = (image) => {
  const imageBaseUrl = getImageBaseUrl();
  return `${imageBaseUrl}/products/${image}`;
};

export const getCategoryImageUrl = (image) => {
  const imageBaseUrl = getImageBaseUrl();
  return `${imageBaseUrl}/category/${image}`;
};
