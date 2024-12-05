import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "./assets/styles/App.css"; // Import CSS tùy chỉnh
import Routing from "./components/Routing/Routing";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import { AuthProvider } from "./context/AuthContext";
import CartProvider from "./context/CartContext";
import { ToastProvider } from "./components/ToastNotification/ToastContext";
import { AuthAdminProvider } from "./context/AuthAdminContext";
import ScrollToTop from "./components/ScrollToTop";
import Snowfall from "../src/components/Snowfall/Snowfall";
import "./assets/styles/App.css";
function App() {
  return (
    <Router>
      <ScrollToTop />
      <Snowfall
        snowflakeCount={150}
        snowflakeSize={{ min: 2, max: 8 }}
        fallSpeed={{ min: 5, max: 10 }}
        drift={{ min: -50, max: 50 }}
      />
      <AuthProvider>
        <AuthAdminProvider>
          <CartProvider>
            <ToastProvider>
              <div className="app-container">
                <Navbar />
                <div className="content">
                  <Routing />
                </div>
                <Footer />
              </div>
            </ToastProvider>
          </CartProvider>
        </AuthAdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
