// App.js
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "./assets/styles/App.css"; // Custom CSS
import Routing from "./components/Routing/Routing";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import { AuthProvider } from "./context/AuthContext";
import CartProvider from "./context/CartContext";
import { ToastProvider } from "./components/ToastNotification/ToastContext";
import { AuthAdminProvider } from "./context/AuthAdminContext";
import ScrollToTop from "./components/ScrollToTop";
import Snowfall from "./components/Snowfall/Snowfall";

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthAdminProvider>
          <CartProvider>
            <ToastProvider>
              <ScrollToTop />
              <Snowfall
                snowflakeCount={100} // Ensure you pass necessary props
                snowflakeSize={{ min: 5, max: 15 }}
                fallSpeed={{ min: 5, max: 10 }}
                drift={{ min: -2, max: 2 }}
                maxSnowflakes={200}
              />
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
