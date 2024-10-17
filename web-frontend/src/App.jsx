import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import Routing from "../components/Routing/Routing";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routing />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
