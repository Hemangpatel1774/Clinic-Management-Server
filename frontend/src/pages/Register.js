import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Avatar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

export default function Register({ setUser }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (token && savedUser) {
      setUser(savedUser);
      navigate(
        savedUser.role === "admin" ? "/admin/dashboard" : "/patient/dashboard",
        { replace: true }
      );
    }
  }, [navigate, setUser]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);

      navigate(
        res.data.user.role === "admin"
          ? "/admin/dashboard"
          : "/patient/dashboard",
        { replace: true }
      );
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{ minHeight: "calc(100vh - 160px)", backgroundColor: "#f5f5f5" }}
    >
      <Grid item xs={11} sm={8} md={5} lg={4}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "primary.main", width: 50, height: 50 }}>
              <PersonAddIcon />
            </Avatar>
            <Typography variant="h6" component="h1" gutterBottom>
              Register
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleRegister} sx={{ mt: 0.5 }}>
            <TextField
              margin="dense"
              fullWidth
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              size="small"
            />
            <TextField
              margin="dense"
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              size="small"
            />
            <TextField
              margin="dense"
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              size="small"
            />

            <FormControl fullWidth margin="dense" size="small">
              <InputLabel>Role</InputLabel>
              <Select
                value={role}
                label="Role"
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="patient">Patient</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 1, mb: 1.5 }}
              size="large"
            >
              Register
            </Button>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}
