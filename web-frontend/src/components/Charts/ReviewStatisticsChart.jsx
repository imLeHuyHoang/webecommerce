// src/components/charts/ReviewStatisticsChart.jsx
import React, { useEffect, useState } from "react";
import apiClient from "../../utils/api-client";

const ReviewStatisticsChart = () => {
  const [stats, setStats] = useState({ totalReviews: null, avgRating: null });

  useEffect(() => {
    apiClient
      .get("/statistic/reviews-statistics")
      .then((res) => {
        setStats({
          totalReviews: res.data.totalReviews,
          avgRating: res.data.avgRating,
        });
      })
      .catch((err) => console.error(err));
  }, []);

  if (stats.totalReviews === null || stats.avgRating === null)
    return <p>Loading...</p>;

  return (
    <div style={{ background: "#fff", padding: "20px", borderRadius: "8px" }}>
      <h3>Thống kê đánh giá</h3>
      <p>Tổng số đánh giá: {stats.totalReviews}</p>
      <p>Đánh giá trung bình: {stats.avgRating.toFixed(2)} / 5</p>
    </div>
  );
};

export default ReviewStatisticsChart;
