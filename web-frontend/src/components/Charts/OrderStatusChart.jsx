// src/components/charts/OrderStatusChart.jsx
import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import apiClient from "../../utils/api-client";

const OrderStatusChart = () => {
  const [dataChart, setDataChart] = useState(null);

  useEffect(() => {
    apiClient
      .get("/statistic/order-counts")
      .then((res) => {
        const data = res.data;
        const labels = ["Chưa xác nhận", "Đang chuẩn bị", "Đã giao", "Đã hủy"];
        const counts = [
          data.unconfirmedCount,
          data.preparingCount,
          data.shippedCount,
          data.cancelledCount,
        ];

        setDataChart({
          labels,
          datasets: [
            {
              data: counts,
              backgroundColor: [
                "rgba(255, 206, 86, 0.5)", // vàng (unconfirmed)
                "rgba(54, 162, 235, 0.5)", // xanh (preparing)
                "rgba(75, 192, 192, 0.5)", // xanh ngọc (shipped)
                "rgba(255, 99, 132, 0.5)", // đỏ (cancelled)
              ],
              borderWidth: 1,
            },
          ],
        });
      })
      .catch((err) => console.error(err));
  }, []);

  if (!dataChart) return <p>Loading...</p>;

  return (
    <div style={{ background: "#fff", padding: "20px", borderRadius: "8px" }}>
      <h3>Đơn hàng theo trạng thái</h3>
      <Pie data={dataChart} />
    </div>
  );
};

export default OrderStatusChart;
