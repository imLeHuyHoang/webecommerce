import React from "react";

const PaymentMethodSection = ({ paymentMethod, setPaymentMethod }) => {
  return (
    <div className="checkout-page-payment-card card mb-4 pay-information">
      <div className="checkout-page-payment-card-body card-body">
        <div className="mb-3 checkout-page-payment-method-group">
          <label className="form-label">Phương thức thanh toán</label>
          <select
            className="checkout-page-payment-select form-select"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option className="zalopay" value="zalopay">
              ZaloPay
            </option>
            <option className="cod" value="cod">
              Thanh toán khi nhận hàng
            </option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSection;
