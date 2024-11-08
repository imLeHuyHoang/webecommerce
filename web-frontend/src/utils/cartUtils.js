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
      //  Lấy giỏ hàng từ localStorage nếu chưa đăng nhập
      // const localCart = JSON.parse(localStorage.getItem("cart")) || [];
      // console.log("localCart:", localCart);
      // const totalQuantity = localCart.reduce(
      //   (sum, item) => sum + item.quantity,
      //   0
      // );
      // return totalQuantity;
    }
  } catch (error) {
    console.error("Lỗi khi tải giỏ hàng:", error);
    return 0;
  }
};
