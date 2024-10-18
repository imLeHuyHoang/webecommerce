import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import Routing from "../src/components/Routing/Routing";
import Navbar from "../src/components/Navbar/Navbar";
import Footer from "../src/components/Footer/Footer";
import { AuthProvider } from "./Services/authContext";
import { ToastContainer } from "react-toastify"; // Import ToastContainer

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <Routing />
          <Footer />
        </div>
      </Router>
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;
