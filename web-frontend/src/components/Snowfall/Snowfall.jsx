// Snowfall.jsx
import React, { useEffect, useState, useRef } from "react";
import "./Snowfall.css";

const Snowfall = ({
  snowflakeCount = 20, // Số lượng bông tuyết ban đầu
  snowflakeSize = { min: 2, max: 6 }, // Kích thước bông tuyết (tối thiểu và tối đa)
  fallSpeed = { min: 5, max: 10 }, // Tốc độ rơi của bông tuyết (tối thiểu và tối đa)
  drift = { min: -100, max: 100 }, // Độ lệch ngang của bông tuyết (tối thiểu và tối đa)
  maxSnowflakes = 100, // Số lượng bông tuyết tối đa trên màn hình
}) => {
  const [snowflakes, setSnowflakes] = useState([]);
  const snowflakeId = useRef(0);
  const snowflakeCountRef = useRef(0);

  useEffect(() => {
    let isMounted = true;

    const createSnowflake = () => {
      if (isMounted && snowflakeCountRef.current < maxSnowflakes) {
        const size =
          Math.random() * (snowflakeSize.max - snowflakeSize.min) +
          snowflakeSize.min;
        const left = Math.random() * 100; // Vị trí ngang dưới dạng phần trăm
        const duration =
          Math.random() * (fallSpeed.max - fallSpeed.min) + fallSpeed.min;
        const horizontalDrift =
          Math.random() * (drift.max - drift.min) + drift.min;

        const newSnowflake = {
          id: snowflakeId.current++,
          size,
          left,
          duration,
          drift: horizontalDrift,
        };

        setSnowflakes((prev) => [...prev, newSnowflake]);
        snowflakeCountRef.current += 1;
      }
    };

    // Tạo các bông tuyết ban đầu với độ trễ ngẫu nhiên
    for (let i = 0; i < snowflakeCount; i++) {
      setTimeout(createSnowflake, Math.random() * 10000);
    }

    // Liên tục tạo bông tuyết theo khoảng thời gian
    const interval = setInterval(() => {
      createSnowflake();
    }, 2000); // Điều chỉnh khoảng thời gian tạo bông tuyết mới

    // Dọn dẹp khi component bị unmount
    return () => {
      isMounted = false;
      clearInterval(interval);
      setSnowflakes([]);
      snowflakeCountRef.current = 0;
    };
  }, [snowflakeCount, snowflakeSize, fallSpeed, drift, maxSnowflakes]);

  // Hàm xử lý khi animation kết thúc
  const handleAnimationEnd = (id) => {
    setSnowflakes((prev) => prev.filter((snowflake) => snowflake.id !== id));
    snowflakeCountRef.current -= 1;
  };

  return (
    <div className="snow-container">
      {snowflakes.map((snowflake) => (
        <div
          key={snowflake.id}
          className="snowflake"
          style={{
            width: `${snowflake.size}px`,
            height: `${snowflake.size}px`,
            left: `${snowflake.left}%`,
            animationDuration: `${snowflake.duration}s`,
            "--drift": `${snowflake.drift}px`,
          }}
          onAnimationEnd={() => handleAnimationEnd(snowflake.id)}
        />
      ))}
    </div>
  );
};

export default Snowfall;
