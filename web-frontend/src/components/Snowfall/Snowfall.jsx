// src/components/Snowfall/Snowfall.jsx
import React, { useEffect, useState, useRef } from "react";
import "./Snowfall.css";

// Configuration settings moved outside the component
const INITIAL_SNOWFLAKE_COUNT = 20; // Initial number of snowflakes
const SNOWFLAKE_SIZE = { min: 4, max: 8 }; // Size range in pixels
const FALL_SPEED = { min: 5, max: 10 }; // Fall speed range in seconds
const DRIFT = { min: -50, max: 50 }; // Horizontal drift in pixels
const MAX_SNOWFLAKES = 50; // Maximum number of snowflakes on screen

const Snowfall = () => {
  const [snowflakes, setSnowflakes] = useState([]);
  const snowflakeId = useRef(0);
  const snowflakeCountRef = useRef(0);

  useEffect(() => {
    let isMounted = true;

    const createSnowflake = () => {
      if (isMounted && snowflakeCountRef.current < MAX_SNOWFLAKES) {
        const size =
          Math.random() * (SNOWFLAKE_SIZE.max - SNOWFLAKE_SIZE.min) +
          SNOWFLAKE_SIZE.min;
        const left = Math.random() * 100;
        const duration =
          Math.random() * (FALL_SPEED.max - FALL_SPEED.min) + FALL_SPEED.min;
        const horizontalDrift =
          Math.random() * (DRIFT.max - DRIFT.min) + DRIFT.min;

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

    // Initialize snowflakes with random delays
    for (let i = 0; i < INITIAL_SNOWFLAKE_COUNT; i++) {
      setTimeout(createSnowflake, Math.random() * 10000);
    }

    // Continuously create snowflakes at intervals
    const interval = setInterval(() => {
      createSnowflake();
    }, 2000);

    // Cleanup on unmount
    return () => {
      isMounted = false;
      clearInterval(interval);
      setSnowflakes([]);
      snowflakeCountRef.current = 0;
    };
  }, []); // Empty dependency array since configurations are now stable

  const handleAnimationEnd = (id) => {
    setSnowflakes((prev) => prev.filter((snowflake) => snowflake.id !== id));
    snowflakeCountRef.current -= 1;
  };

  return (
    <div className="snow-container" aria-hidden="true">
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
