import React from "react";

const OrderItemsList = ({ cart, formatPrice }) => {
  return (
    <div className="checkout-page-order-card card mb-4 card-information">
      <div className="checkout-page-order-card-body card-body">
        {cart && cart.products && cart.products.length > 0 ? (
          <>
            <div className="checkout-page-order-header row mb-3 infor">
              <div className="checkout-page-order-header-name col-4 text-name-product">
                <strong>Tên sản phẩm</strong>
              </div>
              <div className="checkout-page-order-header-quantity col-2 text-quantity">
                <strong>Số lượng</strong>
              </div>
              <div className="checkout-page-order-header-price col-3 text-price">
                <strong>Đơn giá</strong>
              </div>
              <div className="checkout-page-order-header-total col-3 text-total">
                <strong>Thành tiền</strong>
              </div>
            </div>
            {cart.products.map((item) => {
              const discountAmount = item.discount
                ? item.discount.isPercentage
                  ? (item.price * item.discount.value * item.quantity) / 100
                  : item.discount.value * item.quantity
                : 0;
              return (
                <div
                  className="checkout-page-order-item row mb-3 product-infor"
                  key={item.product._id}
                >
                  <div className="checkout-page-order-item-name col-4 product-name">
                    • {item.product.name}
                  </div>
                  <div className="checkout-page-order-item-quantity col-2 product-quantity">
                    {item.quantity}
                  </div>
                  <div className="checkout-page-order-item-price col-3 product-price">
                    {formatPrice(item.price)}
                  </div>
                  <div className="checkout-page-order-item-total col-3 product-total">
                    {formatPrice(item.price * item.quantity - discountAmount)}
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <p className="checkout-page-empty-cart">
            Giỏ hàng của bạn đang trống.
          </p>
        )}
      </div>
    </div>
  );
};

export default OrderItemsList;
