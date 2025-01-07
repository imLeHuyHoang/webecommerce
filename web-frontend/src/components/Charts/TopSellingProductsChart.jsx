// src/components/charts/TopSellingProductsChart.jsx
import React, { useEffect, useState } from "react";
import apiClient from "../../utils/api-client";

const TopSellingProductsChart = () => {
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    apiClient

      .get("/statistic/top-selling-products")
      .then((res) => {
        setTopProducts(res.data.topSellingProducts);
      })
      .catch((err) => console.error(err));
  }, []);

  if (!topProducts.length) return <p>Loading...</p>;
  console.log(topProducts);

  return (
    <div style={{ background: "#fff", padding: "20px", borderRadius: "8px" }}>
      <h3>Top 10 Sản phẩm bán chạy</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
              Sản phẩm
            </th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
              Số lượng bán
            </th>
          </tr>
        </thead>
        <tbody>
          {topProducts.map((item, index) => (
            <tr key={index}>
              <td style={{ borderBottom: "1px solid #eee" }}>
                {item.productName}
              </td>
              <td style={{ borderBottom: "1px solid #eee" }}>
                {item.totalSold}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopSellingProductsChart;
