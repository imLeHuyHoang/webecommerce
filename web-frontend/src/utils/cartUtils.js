// src/utils/cartUtils.js

import apiClient from "./api-client";

// Hàm lấy số lượng sản phẩm trong giỏ hàng
export const getCartCount = async () => {
  const token = localStorage.getItem("accessToken");

  try {
    if (token) {
      // Lấy giỏ hàng từ API nếu đã đăng nhập
      const response = await apiClient.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const totalQuantity = response.data.products.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      return totalQuantity;
    } else {
    }
  } catch (error) {
    console.error("Lỗi khi tải giỏ hàng:", error);
    return 0;
  }
};
