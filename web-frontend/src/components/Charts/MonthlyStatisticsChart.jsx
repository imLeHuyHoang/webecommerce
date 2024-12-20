// src/components/charts/MonthlyStatisticsChart.jsx
import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import apiClient from "../../utils/api-client";
import "./MonthlyStatisticsChart.css"; // Import CSS

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement
);

const MonthlyStatisticsChart = () => {
  const [dataChart, setDataChart] = useState(null);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(), // mặc định năm hiện tại
    startDate: "",
    endDate: "",
    excludeCancelled: false,
  });

  const fetchData = () => {
    const params = new URLSearchParams();

    // Nếu có startDate, endDate thì dùng chúng
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    // Nếu không có startDate, endDate thì sử dụng year
    if (!filters.startDate && !filters.endDate && filters.year) {
      params.append("year", filters.year);
    }

    if (filters.excludeCancelled) {
      params.append("excludeCancelled", "true");
    }

    apiClient
      .get(`/statistic/monthly-statistics?${params.toString()}`)
      .then((res) => {
        const data = res.data.monthlyStatistics;
        const labels = data.map((item) => `Tháng ${item._id.month}`);
        const totalRevenue = data.map((item) => item.totalRevenue);
        const totalOrders = data.map((item) => item.totalOrders);
        console.log(data);

        setDataChart({
          labels,
          datasets: [
            {
              type: "bar",
              label: "Số đơn hàng",
              data: totalOrders,
              backgroundColor: "rgba(54, 162, 235, 0.5)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
              yAxisID: "y2",
            },
            {
              type: "line",
              label: "Doanh thu",
              data: totalRevenue,
              backgroundColor: "rgba(255, 99, 132, 0.5)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 2,
              yAxisID: "y1",
              fill: false,
              tension: 0.1,
            },
          ],
        });
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchData(); // Gọi lần đầu khi mount
  }, []);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  if (!dataChart) return <p>Loading...</p>;

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              if (context.dataset.yAxisID === "y1") {
                label += new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(context.parsed.y);
              } else {
                label += context.parsed.y;
              }
            }
            return label;
          },
        },
      },
    },
    scales: {
      y1: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Doanh thu (VND)",
        },
        ticks: {
          callback: function (value) {
            if (value >= 1000000) {
              return value / 1000000 + "M";
            } else if (value >= 1000) {
              return value / 1000 + "K";
            }
            return value;
          },
        },
      },
      y2: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "Số đơn hàng",
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          beginAtZero: true,
        },
      },
    },
  };

  return (
    <div className="monthly-statistics-chart-container">
      <h3>Thống kê theo tháng</h3>
      <form onSubmit={handleSubmit} className="filter-form">
        <div className="filter-form-group">
          <div className="filter-form-item">
            <label>
              Year:
              <input
                type="number"
                name="year"
                value={filters.year}
                onChange={handleChange}
                disabled={filters.startDate || filters.endDate}
                // disable year input nếu đã chọn startDate/endDate
              />
            </label>
          </div>
          <div className="filter-form-item">
            <label>
              Start Date:
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleChange}
              />
            </label>
          </div>
          <div className="filter-form-item">
            <label>
              End Date:
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleChange}
              />
            </label>
          </div>
          <div className="filter-form-item">
            <label>
              Exclude Cancelled:
              <input
                type="checkbox"
                name="excludeCancelled"
                checked={filters.excludeCancelled}
                onChange={handleChange}
              />
            </label>
          </div>
          <button type="submit" className="filter-form-button">
            Lọc
          </button>
        </div>
      </form>
      <Bar data={dataChart} options={options} />
    </div>
  );
};

export default MonthlyStatisticsChart;
