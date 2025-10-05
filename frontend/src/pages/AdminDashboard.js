import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import {
  Box,
  Card,
  Grid,
  Typography,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";

export default function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [totalDoctors, setTotalDoctors] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalAppointments, setTotalAppointments] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get("/allCounts", { headers: { Authorization: `Bearer ${token}` } });
      setTotalDoctors(res.data.totalDoctors);
      setTotalUsers(res.data.totalUsers);
      setTotalAppointments(res.data.totalBookings);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  const cardData = [
    {
      title: "Total Doctors",
      count: totalDoctors,
      icon: <PersonIcon sx={{ fontSize: 50, color: "#4caf50" }} />,
      color: "#e8f5e9",
    },
    {
      title: "Total Patients",
      count: totalUsers,
      icon: <PeopleIcon sx={{ fontSize: 50, color: "#2196f3" }} />,
      color: "#e3f2fd",
    },
    {
      title: "Total Appointments",
      count: totalAppointments,
      icon: <EventAvailableIcon sx={{ fontSize: 50, color: "#ff9800" }} />,
      color: "#fff3e0",
    },
  ];

  return (
    <Box sx={{ p: 4, bgcolor: "#f5f5f5", minHeight: "calc(100vh - 225px)" }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Admin Dashboard
      </Typography>
      <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
        Welcome, {user?.name}
      </Typography>

      <Grid container spacing={4}>
        {cardData.map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.title}>
            <Card
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 3,
                borderRadius: 3,
                boxShadow: 3,
                bgcolor: card.color,
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": { transform: "translateY(-5px)", boxShadow: 6 },
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {card.title}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>
                  {card.count}
                </Typography>
              </Box>
              <Box>{card.icon}</Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 5 }}>
        <Typography variant="h6" gutterBottom fontStyle={"italic"} sx={{ fontWeight: 600 }} textTransform={"uppercase"} style={{ textDecoration: "underline" }}>
          Quick Actions
        </Typography>
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          <Link
            to="/doctors"
            style={{
              textDecoration: "none",
              padding: "12px 25px",
              backgroundColor: "#4caf50",
              color: "#fff",
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            Manage Doctors
          </Link>
          <Link
            to="/appointments"
            style={{
              textDecoration: "none",
              padding: "12px 25px",
              backgroundColor: "#2196f3",
              color: "#fff",
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            View Appointments
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
