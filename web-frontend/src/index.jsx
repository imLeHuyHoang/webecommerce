import React from "react";
import ReactDOM from "react-dom/client"; // Sử dụng từ 'react-dom/client' trong React 18
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "./assets/styles/index.css"; // Import CSS tùy chỉnh nếu có

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
