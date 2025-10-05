import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box, Dialog, DialogTitle, DialogActions } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setOpenConfirm(false);
    navigate("/login");
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Clinic Management
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            {!user && (
              <>
                <Button color="inherit" component={Link} to="/login">
                  Login
                </Button>
                <Button color="inherit" component={Link} to="/register">
                  Register
                </Button>
              </>
            )}

            {user?.role === "admin" && (
              <>
                <Button color="inherit" component={Link} to="/admin/dashboard">
                  Dashboard
                </Button>
                <Button color="inherit" component={Link} to="/doctors">
                  Manage Doctors
                </Button>
                <Button color="inherit" component={Link} to="/appointments">
                  Appointments
                </Button>
              </>
            )}

            {user?.role === "patient" && (
              <>
                <Button color="inherit" component={Link} to="/patient/dashboard">
                  Dashboard
                </Button>
                <Button color="inherit" component={Link} to="/doctors">
                  Doctors
                </Button>
                <Button color="inherit" component={Link} to="/appointments">
                  My Appointments
                </Button>
              </>
            )}

            {user && (
              <Button color="inherit" onClick={() => setOpenConfirm(true)}>
                Logout
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Logout Confirmation Dialog */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Are you sure you want to logout?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogout} color="error" variant="contained">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
