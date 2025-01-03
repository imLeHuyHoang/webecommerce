// src/components/charts/CustomerStatisticsChart.jsx
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import apiClient from "../../utils/api-client";

const CustomerStatisticsChart = () => {
  const [dataChart, setDataChart] = useState(null);

  useEffect(() => {
    const year = new Date().getFullYear();
    apiClient
      .get(`/statistic/customer-statistics?year=${year}`)
      .then((res) => {
        const data = res.data.customerStatistics;
        const labels = data.map((item) => `Tháng ${item._id.month}`);
        const counts = data.map((item) => item.newCustomers);

        setDataChart({
          labels,
          datasets: [
            {
              label: "Khách hàng mới",
              data: counts,
              backgroundColor: "rgba(153, 102, 255, 0.5)",
              borderColor: "rgba(153, 102, 255, 1)",
              borderWidth: 1,
            },
          ],
        });
      })
      .catch((err) => console.error(err));
  }, []);

  if (!dataChart) return <p>Loading...</p>;
  console.log(dataChart);
  return (
    <div style={{ background: "#fff", padding: "20px", borderRadius: "8px" }}>
      <h3>Khách hàng đăng ký mới</h3>
      <Bar data={dataChart} />
    </div>
  );
};

export default CustomerStatisticsChart;
