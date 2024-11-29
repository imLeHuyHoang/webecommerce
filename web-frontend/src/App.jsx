import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "./assets/styles/App.css";
import Routing from "../src/components/Routing/Routing";
import Navbar from "../src/components/Navbar/Navbar";
import Footer from "../src/components/Footer/Footer";
import { AuthProvider } from "./context/AuthContext";
import CartProvider from "./context/CartContext";
import { ToastProvider } from "./components/ToastNotification/ToastContext";
import { AuthAdminProvider } from "./context/AuthAdminContext";

function App() {
  return (
    <Router>
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
