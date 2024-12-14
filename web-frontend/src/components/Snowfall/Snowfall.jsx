// src/components/Snowfall/Snowfall.jsx
import React, { useEffect, useState, useRef } from "react";
import "./Snowfall.css";

const Snowfall = ({
  snowflakeCount = 100, // Default value
  snowflakeSize = { min: 5, max: 15 },
  fallSpeed = { min: 5, max: 10 },
  drift = { min: -2, max: 2 },
  maxSnowflakes = 200,
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
        const left = Math.random() * 100;
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

    // Create initial snowflakes with random delay
    for (let i = 0; i < snowflakeCount; i++) {
      setTimeout(createSnowflake, Math.random() * 10000);
    }

    // Continuously create snowflakes
    const interval = setInterval(() => {
      createSnowflake();
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      setSnowflakes([]);
      snowflakeCountRef.current = 0;
    };
  }, [snowflakeCount, snowflakeSize, fallSpeed, drift, maxSnowflakes]);

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
