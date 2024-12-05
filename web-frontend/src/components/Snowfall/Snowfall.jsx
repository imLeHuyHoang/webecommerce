// Snowfall.jsx
import React, { useEffect } from "react";
import "./Snowfall.css";

const Snowfall = ({
  snowflakeCount = 2, // Số lượng bông tuyết
  snowflakeSize = { min: 2, max: 4 }, // Kích thước bông tuyết (tối thiểu và tối đa)
  fallSpeed = { min: 1, max: 2 }, // Tốc độ rơi của bông tuyết (tối thiểu và tối đa)
  drift = { min: -50, max: 50 }, // Độ lệch ngang của bông tuyết (tối thiểu và tối đa)
}) => {
  useEffect(() => {
    const snowContainer = document.querySelector(".snow-container"); // Lấy phần tử chứa bông tuyết

    const createSnowflake = () => {
      const snowflake = document.createElement("div"); // Tạo phần tử bông tuyết
      snowflake.classList.add("snowflake"); // Thêm lớp CSS cho bông tuyết

      // Kích thước ngẫu nhiên
      const size =
        Math.random() * (snowflakeSize.max - snowflakeSize.min) +
        snowflakeSize.min;
      snowflake.style.width = `${size}px`;
      snowflake.style.height = `${size}px`;

      // Vị trí ngẫu nhiên
      snowflake.style.left = `${Math.random() * 100}%`;

      // Thời gian hoạt ảnh ngẫu nhiên
      const duration =
        Math.random() * (fallSpeed.max - fallSpeed.min) + fallSpeed.min;
      snowflake.style.animationDuration = `${duration}s`;

      // Độ lệch ngang ngẫu nhiên
      const horizontalDrift =
        Math.random() * (drift.max - drift.min) + drift.min;
      snowflake.style.setProperty("--drift", `${horizontalDrift}px`);

      snowContainer.appendChild(snowflake); // Thêm bông tuyết vào container

      // Xóa bông tuyết sau khi hoạt ảnh kết thúc
      snowflake.addEventListener("animationend", () => {
        snowflake.remove();
      });
    };

    // Tạo các bông tuyết ban đầu
    for (let i = 0; i < snowflakeCount; i++) {
      setTimeout(createSnowflake, Math.random() * 5000);
    }

    // Liên tục tạo bông tuyết
    const interval = setInterval(createSnowflake, 200);

    // Dọn dẹp khi component bị unmount
    return () => {
      clearInterval(interval);
      snowContainer.innerHTML = "";
    };
  }, [snowflakeCount, snowflakeSize, fallSpeed, drift]);

  return <div className="snow-container"></div>; // Trả về phần tử chứa bông tuyết
};

export default Snowfall;
