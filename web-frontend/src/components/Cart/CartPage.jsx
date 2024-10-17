import React from "react";
import "./CartPage.css";

const CartPage = () => {
  return (
    <div className="cart_container container">
      <h1 className="cart_title text-center my-4">Shopping Cart</h1>
      <table className="cart_table table table-hover table-bordered text-center">
        <thead className="thead-dark">
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div className="cart_product d-flex align-items-center">
                <img
                  src="https://via.placeholder.com/100"
                  alt="Product"
                  className="img-fluid mr-3"
                />
                <span>Product 1</span>
              </div>
            </td>
            <td>$79.00</td>
            <td>
              <input
                type="number"
                className="quantity_input form-control text-center"
                defaultValue={3}
                min={1}
              />
            </td>
            <td>
              <button className="remove_button btn">🗑️</button>
            </td>
          </tr>
          {/* Thêm sản phẩm khác nếu cần */}
        </tbody>
      </table>

      <div className="cart_container_bottom row mt-5">
        {/* Thay thế Coupon Section bằng User Info */}
        <div className="user_info_section col-md-6 mb-4">
          <h2>User Information</h2>
          <form className="user_info_form">
            <div className="form-group">
              <label>Full Name:</label>
              <input
                type="text"
                className="form-control"
                placeholder="John Doe"
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                className="form-control"
                placeholder="john.doe@example.com"
              />
            </div>
            <div className="form-group">
              <label>Phone Number:</label>
              <input
                type="text"
                className="form-control"
                placeholder="+1 234 567 890"
              />
            </div>
            <div className="form-group">
              <label>Address:</label>
              <input
                type="text"
                className="form-control"
                placeholder="123 Main St, City, Country"
              />
            </div>
          </form>
        </div>

        {/* Order Summary Section */}
        <div className="order_summary col-md-6">
          <h2>Order Summary</h2>
          <div className="order_summary_details">
            <p className="d-flex justify-content-between">
              Order Subtotal <span>$390.00</span>
            </p>
            <p className="d-flex justify-content-between">
              Shipping and handling <span>$10.00</span>
            </p>
            <p className="d-flex justify-content-between">
              Tax <span>$0.00</span>
            </p>
            <p className="d-flex justify-content-between font-weight-bold">
              Total <span>$400.00</span>
            </p>
          </div>
          <button className="checkout_button btn btn-primary btn-block mt-4">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
