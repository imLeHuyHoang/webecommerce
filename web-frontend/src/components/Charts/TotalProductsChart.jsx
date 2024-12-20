// src/components/charts/TotalProductsChart.jsx
import React, { useEffect, useState } from "react";
import apiClient from "../../utils/api-client";

const TotalProductsChart = () => {
  const [totalProducts, setTotalProducts] = useState(null);

  useEffect(() => {
    apiClient
      .get("/statistic/total-products")
      .then((res) => {
        setTotalProducts(res.data.totalProducts);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ background: "#fff", padding: "20px", borderRadius: "8px" }}>
      <h3>Tổng Số Sản Phẩm</h3>
      {totalProducts === null ? (
        <p>Loading...</p>
      ) : (
        <h1 style={{ fontSize: "2rem", margin: 0 }}>{totalProducts}</h1>
      )}
    </div>
  );
};

export default TotalProductsChart;
