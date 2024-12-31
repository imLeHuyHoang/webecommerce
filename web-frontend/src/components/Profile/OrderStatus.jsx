import React from "react";

const OrderStatus = ({ orderStatusCounts }) => {
  return (
    <div className="order-status-section mb-4">
      <h2 className="h4 font-weight-bold mb-3">Tình trạng đơn hàng</h2>
      <div className="row">
        <div className="col-md-3 mb-3">
          <div className="bg-light p-3 rounded shadow-sm text-center">
            <h3 className="h5 font-weight-bold">Chờ xác nhận</h3>
            <p className="display-4 font-weight-bold">
              {orderStatusCounts.processing}
            </p>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="bg-light p-3 rounded shadow-sm text-center">
            <h3 className="h5 font-weight-bold">Đang giao</h3>
            <p className="display-4 font-weight-bold">
              {orderStatusCounts.shipping}
            </p>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="bg-light p-3 rounded shadow-sm text-center">
            <h3 className="h5 font-weight-bold">Đã giao</h3>
            <p className="display-4 font-weight-bold">
              {orderStatusCounts.shipped}
            </p>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="bg-light p-3 rounded shadow-sm text-center">
            <h3 className="h5 font-weight-bold">Đã hủy</h3>
            <p className="display-4 font-weight-bold">
              {orderStatusCounts.cancelled}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;
