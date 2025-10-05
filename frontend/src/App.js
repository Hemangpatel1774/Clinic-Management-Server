import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorList from "./pages/DoctorList";
import MyAppointments from "./pages/MyAppointments";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./App.css";
function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check localStorage for saved user
    const token = localStorage.getItem("token");
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");

    if (token && savedUser) {
      setUser(savedUser); // auto-login
    }
  }, []);

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />
      <div className="mainComponent">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/doctors" element={<DoctorList />} />
        <Route path="/appointments" element={<MyAppointments />} />
        <Route path="*" element={<h2>404 - Page Not Found</h2>} />
      </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
