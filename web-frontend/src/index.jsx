import React from "react";
import ReactDOM from "react-dom/client"; // Sử dụng từ 'react-dom/client' trong React 18
import App from "./App";
import "./index.css";
import { CartProvider } from "./context/CartContext";

// Thay thế ReactDOM.render bằng createRoot
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
