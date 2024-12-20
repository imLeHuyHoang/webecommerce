// src/components/charts/ProductsByCategoryChart.jsx
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import apiClient from "../../utils/api-client";

const ProductsByCategoryChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    apiClient
      .get("/statistic/products-by-category")
      .then((res) => {
        const data = res.data.productsByCategory;
        const labels = data.map((item) => item.categoryName);
        const counts = data.map((item) => item.count);

        setChartData({
          labels,
          datasets: [
            {
              label: "Số lượng sản phẩm",
              data: counts,
              backgroundColor: "rgba(54, 162, 235, 0.5)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        });
      })
      .catch((err) => console.error(err));
  }, []);

  if (!chartData) return <p>Loading...</p>;

  return (
    <div style={{ background: "#fff", padding: "20px", borderRadius: "8px" }}>
      <h3>Sản phẩm theo danh mục</h3>
      <Bar data={chartData} />
    </div>
  );
};

export default ProductsByCategoryChart;
