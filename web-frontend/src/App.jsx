// App.js
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import Routing from "../src/components/Routing/Routing";
import Navbar from "../src/components/Navbar/Navbar";
import Footer from "../src/components/Footer/Footer";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { AuthAdminProvider } from "./context/AuthAdminContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthAdminProvider>
          <CartProvider>
            <Navbar />
            <Routing />
            <Footer />
          </CartProvider>
        </AuthAdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
