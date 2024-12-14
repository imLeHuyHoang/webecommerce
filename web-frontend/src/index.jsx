// index.js
import React from "react";
import ReactDOM from "react-dom/client"; // Correct for React 18
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap CSS
import "./assets/styles/index.css"; // Custom CSS

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
