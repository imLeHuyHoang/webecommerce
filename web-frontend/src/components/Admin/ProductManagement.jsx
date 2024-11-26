import React, { useState } from "react";
import ManageProducts from "./manage/ManageProducts";
import ManageCategories from "./manage/ManageCategories";
import ManageAttributes from "./manage/ManageAttributes";
import ManageInventory from "./manage/ManageInventory";
import ManageDiscounts from "./manage/ManageDiscounts";
import "./ProductManagement.css"; // Import file CSS

const ProductManagement = () => {
  const [activeKey, setActiveKey] = useState("products");

  const renderContent = () => {
    switch (activeKey) {
      case "products":
        return <ManageProducts />;
      case "categories":
        return <ManageCategories />;
      case "attributes":
        return <ManageAttributes />;
      case "inventory":
        return <ManageInventory />;
      case "discounts":
        return <ManageDiscounts />;
      default:
        return <ManageProducts />;
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12 col-md-2 bg-dark text-white sidebar">
          <div
            className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark"
            style={{ width: "100%" }}
          >
            <a
              href="/"
              className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
            >
              <svg className="bi me-2" width="40" height="32">
                <use xlinkHref="#bootstrap"></use>
              </svg>
              <span className="fs-4">Sidebar</span>
            </a>
            <hr />
            <ul className="nav nav-pills flex-column mb-auto">
              <li className="nav-item">
                <a
                  className={`nav-link ${
                    activeKey === "products" ? "active" : "text-white"
                  }`}
                  onClick={() => setActiveKey("products")}
                >
                  <svg className="bi me-2" width="16" height="16">
                    <use xlinkHref="#grid"></use>
                  </svg>
                  Manage Products
                </a>
              </li>
              <li>
                <a
                  className={`nav-link ${
                    activeKey === "categories" ? "active" : "text-white"
                  }`}
                  onClick={() => setActiveKey("categories")}
                >
                  <svg className="bi me-2" width="16" height="16">
                    <use xlinkHref="#table"></use>
                  </svg>
                  Manage Categories
                </a>
              </li>
              <li>
                <a
                  className={`nav-link ${
                    activeKey === "attributes" ? "active" : "text-white"
                  }`}
                  onClick={() => setActiveKey("attributes")}
                >
                  <svg className="bi me-2" width="16" height="16">
                    <use xlinkHref="#speedometer2"></use>
                  </svg>
                  Manage Attributes
                </a>
              </li>
              <li>
                <a
                  className={`nav-link ${
                    activeKey === "inventory" ? "active" : "text-white"
                  }`}
                  onClick={() => setActiveKey("inventory")}
                >
                  <svg className="bi me-2" width="16" height="16">
                    <use xlinkHref="#people-circle"></use>
                  </svg>
                  Manage Inventory
                </a>
              </li>
              <li>
                <a
                  className={`nav-link ${
                    activeKey === "discounts" ? "active" : "text-white"
                  }`}
                  onClick={() => setActiveKey("discounts")}
                >
                  <svg className="bi me-2" width="16" height="16">
                    <use xlinkHref="#people-circle"></use>
                  </svg>
                  Manage Discounts
                </a>
              </li>
            </ul>

            <hr />
            <div className="dropdown">
              <ul
                className="dropdown-menu dropdown-menu-dark text-small shadow"
                aria-labelledby="dropdownUser1"
              >
                <li>
                  <a className="dropdown-item" href="#">
                    New project...
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Settings
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Profile
                  </a>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Sign out
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-10 content">{renderContent()}</div>
      </div>
    </div>
  );
};

export default ProductManagement;
