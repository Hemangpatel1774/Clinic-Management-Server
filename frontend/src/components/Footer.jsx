import React from "react";
import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      sx={{
        mt: 4,
        py: 2,
        backgroundColor: "primary.main",
        color: "white",
        textAlign: "center",
        position: "fixed",
        bottom: 0,
        width: "100%",
      }}
    >
      <Typography variant="body1">
        &copy; {new Date().getFullYear()} Clinic Management System
      </Typography>
    </Box>
  );
}
