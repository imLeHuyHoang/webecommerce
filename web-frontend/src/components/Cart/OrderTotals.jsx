import React from "react";

const OrderTotals = ({
  getTotalPriceBeforeDiscount,
  getTotalDiscount,
  getTotalAmount,
  formatPrice,
}) => {
  return (
    <div className="checkout-page-total-card card mb-4 total">
      <div className="checkout-page-total-card-body card-body">
        <p className="checkout-page-total-text card-text">
          <strong>Tổng tiền hàng:</strong>{" "}
          {formatPrice(getTotalPriceBeforeDiscount())}
        </p>
        <p className="checkout-page-total-text card-text">
          <strong>Tổng giảm giá:</strong> {formatPrice(getTotalDiscount())}
        </p>
        <p className="checkout-page-total-text card-text">
          <strong>Tổng tiền thanh toán:</strong> {formatPrice(getTotalAmount())}
        </p>
      </div>
    </div>
  );
};

export default OrderTotals;
