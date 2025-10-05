import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Box, Button, TextField, Typography, Paper,
  MenuItem, Select, InputLabel, FormControl,
  Grid, Card, CardContent, CardActions, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip
} from "@mui/material";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const defaultSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [filterSpec, setFilterSpec] = useState("");
  const [filterDay, setFilterDay] = useState("");

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);

  // Add/Edit doctor states
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editDoctorData, setEditDoctorData] = useState(null);
  const [name, setName] = useState("");
  const [spec, setSpec] = useState("");
  const [availability, setAvailability] = useState(daysOfWeek.map(d => ({ day: d, slots: [] })));

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    loadDoctors();
    loadAppointments();
  }, []);

  const loadDoctors = async () => {
    const res = await api.get("/doctors", { headers: { Authorization: `Bearer ${token}` } });
    setDoctors(res.data);
  };

  const loadAppointments = async () => {
    try {
      const res = await api.get("/appointments", { headers: { Authorization: `Bearer ${token}` } });
      setAppointments(res.data);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  const openBooking = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate(null);
    setSelectedTime("");
    setBookingOpen(true);
  };

  const closeBooking = () => {
    setBookingOpen(false);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedTime("");
  };

  const bookAppointment = async () => {
    if (!selectedDate || !selectedTime) return alert("Select date & time");
    const date = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(":").map(Number);
    date.setHours(hours); date.setMinutes(minutes);

    try {
      await api.post("/appointments/book", { doctorId: selectedDoctor._id, date: date.toISOString() },
        { headers: { Authorization: `Bearer ${token}` } });
      alert("Booked successfully!");
      closeBooking();
      loadAppointments();
    } catch (err) {
      alert(err.response?.data?.message || "Error booking");
    }
  };

  const getAvailableSlots = () => {
    if (!selectedDoctor || !selectedDate) return [];
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'short' });
    const dayAvailability = selectedDoctor.availability?.find(a => a.day === dayName);
    if (!dayAvailability) return [];
    const dateStr = selectedDate.toISOString().split('T')[0];
    const booked = appointments
      .filter(a => a.doctor._id === selectedDoctor._id && a.date.startsWith(dateStr))
      .map(a => a.date.slice(11, 16));
    return dayAvailability.slots.filter(s => !booked.includes(s));
  };

  // Filters
  const filteredDoctors = doctors.filter(d => {
    const matchesName = d.name.toLowerCase().includes(filterName.toLowerCase());
    const matchesSpec = d.specialization.toLowerCase().includes(filterSpec.toLowerCase());
    const matchesDay = filterDay
      ? d.availability?.some(a => a.day === filterDay && a.slots.length > 0)
      : true;
    return matchesName && matchesSpec && matchesDay;
  });

  const resetFilters = () => {
    setFilterName("");
    setFilterSpec("");
    setFilterDay("");
  };

  // Add/Edit Doctor Functions
  const addDoctor = async () => {
    const avail = availability.filter(a => a.slots.length > 0);
    await api.post("/doctors", { name, specialization: spec, availability: avail }, { headers: { Authorization: `Bearer ${token}` } });
    setName(""); setSpec(""); setAvailability(daysOfWeek.map(d => ({ day: d, slots: [] }))); setAddOpen(false);
    loadDoctors();
  };

  const openEditDialog = (doctor) => {
    const fullAvailability = daysOfWeek.map(day => {
      const existing = doctor.availability?.find(a => a.day === day);
      return existing ? existing : { day, slots: [] };
    });
    setEditDoctorData({ ...doctor, availability: fullAvailability });
    setEditOpen(true);
  };

  const handleEditChange = (e) => {
    setEditDoctorData({ ...editDoctorData, [e.target.name]: e.target.value });
  };

  const saveDoctor = async () => {
    const avail = editDoctorData.availability.filter(a => a.slots.length > 0);
    await api.put(`/doctors/${editDoctorData._id}`, {
      name: editDoctorData.name,
      specialization: editDoctorData.specialization,
      availability: avail
    }, { headers: { Authorization: `Bearer ${token}` } });
    setEditOpen(false);
    loadDoctors();
  };

  const deleteDoctor = async (id) => {
    await api.delete(`/doctors/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    loadDoctors();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" color="primary" fontWeight={600} letterSpacing={0} style={{textDecoration:'underline'}} width={'100%'} textAlign={'center'} gutterBottom textTransform={'uppercase'}>Doctors</Typography>

      {/* Admin Add Doctor */}
      {user.role === "admin" && (
        <Box sx={{ mb: 3 }}>
          <Button variant="contained" color="primary" onClick={() => setAddOpen(true)}>
            Add New Doctor
          </Button>
        </Box>
      )}

      {/* Filter Section */}
      <Paper sx={{ p: 2, mb: 3, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
        <TextField label="Filter by Name" variant="outlined" value={filterName} onChange={e => setFilterName(e.target.value)} sx={{ minWidth: 200 }} />
        <TextField label="Filter by Specialization" variant="outlined" value={filterSpec} onChange={e => setFilterSpec(e.target.value)} sx={{ minWidth: 200 }} />
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Filter by Day</InputLabel>
          <Select value={filterDay} label="Filter by Day" onChange={e => setFilterDay(e.target.value)}>
            <MenuItem value="">All Days</MenuItem>
            {daysOfWeek.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant="outlined" color="secondary" style={{ height: 56 }} onClick={resetFilters}>Reset Filters</Button>
      </Paper>

      {/* Doctor Cards */}
      <Grid container spacing={2}>
        {filteredDoctors.length > 0 ? filteredDoctors.map(d => (
          <Grid item xs={12} sm={6} md={4} key={d._id}>
            <Card sx={{ borderRadius: 3, boxShadow: 5, transition: "0.3s", "&:hover": { boxShadow: 10, transform: "translateY(-6px)" }, display: "flex", flexDirection: "column", height: "100%" }}>
              <Box sx={{ paddingInline: 3, paddingBlock: 2, bgcolor: "#1976d2", color: "#fff", display: "flex", alignItems: "center" }}>
                <Avatar sx={{ bgcolor: "#fff", color: "#1976d2", width: 56, height: 56, mr: 2 }}>{d.name.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Dr. {d.name}</Typography>
                  <Typography variant="body2">{d.specialization}</Typography>
                </Box>
              </Box>
              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                {d.availability?.some(a => a.slots.length > 0) ? (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.secondary", mb: 1 }}>🗓️ Available Days</Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {d.availability.filter(a => a.slots.length > 0).map(a => (
                        <Chip key={a.day} label={a.day} color="primary" variant="outlined" size="small" sx={{ fontWeight: 500 }} />
                      ))}
                    </Box>
                  </>
                ) : <Typography variant="caption" color="text.disabled">No schedule available</Typography>}
              </CardContent>
              <CardActions sx={{ justifyContent: "center", p: 2 }}>
                {user.role === "patient" && <Button variant="contained" size="medium" sx={{ width: "100%", borderRadius: 2, textTransform: "none", fontWeight: 700, bgcolor: "#1976d2", "&:hover": { bgcolor: "#115293" } }} onClick={() => openBooking(d)}>Book Appointment</Button>}
                {user.role === "admin" && <>
                  <Button variant="outlined" color="primary" onClick={() => openEditDialog(d)}>Edit</Button>
                  <Button variant="outlined" color="error" onClick={() => deleteDoctor(d._id)}>Delete</Button>
                </>}
              </CardActions>
            </Card>
          </Grid>
        )) : (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 3, mx: "auto" }}>No doctors found matching your search or filters.</Typography>
        )}
      </Grid>

      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onClose={closeBooking} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: "hidden", boxShadow: 8 } }}>
        <DialogContent sx={{ p: 2, bgcolor: "#f9f9f9" }}>
          {selectedDoctor && <>
            <Box sx={{ mb: 1, paddingInline: 2, paddingBlock: 1, bgcolor: "#fff", borderRadius: 2, boxShadow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Dr. {selectedDoctor.name}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedDoctor.specialization}</Typography>
            </Box>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mt: 1 }}>Select Date:</Typography>
            <Box sx={{ mb: 1, p: 1, bgcolor: "#fff", borderRadius: 2, boxShadow: 1 }}>
              <Calendar onChange={setSelectedDate} value={selectedDate} minDate={new Date()} />
            </Box>
            <FormControl fullWidth sx={{ mb: 0 }}>
              <InputLabel>Time Slot</InputLabel>
              <Select value={selectedTime} onChange={e => setSelectedTime(e.target.value)} label="Time Slot" sx={{ bgcolor: "#fff", borderRadius: 1, boxShadow: 1 }}>
                <MenuItem value="">--Select--</MenuItem>
                {getAvailableSlots().map(slot => <MenuItem key={slot} value={slot}>{slot}</MenuItem>)}
              </Select>
            </FormControl>
          </>}
        </DialogContent>
        <DialogActions sx={{ p: 3, display: "flex", gap: 2 }}>
          <Button onClick={closeBooking} variant="outlined" color="error" sx={{ flex: 1, textTransform: "none", fontWeight: 600 }}>Cancel</Button>
          <Button onClick={bookAppointment} variant="contained" color="primary" disabled={!selectedTime || !selectedDate} sx={{ flex: 1, textTransform: "none", fontWeight: 700, bgcolor: "#1976d2", "&:hover": { bgcolor: "#115293" } }}>Confirm Booking</Button>
        </DialogActions>
      </Dialog>

      {/* Add Doctor Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Doctor</DialogTitle>
        <DialogContent dividers>
          <TextField margin="normal" label="Name" fullWidth value={name} onChange={e => setName(e.target.value)} />
          <TextField margin="normal" label="Specialization" fullWidth value={spec} onChange={e => setSpec(e.target.value)} />
          <Typography variant="subtitle1" sx={{ mt: 2 }}>Set Availability</Typography>
          {availability.map((day, index) => (
            <FormControl fullWidth key={day.day} sx={{ mb: 1 }}>
              <InputLabel>{day.day}</InputLabel>
              <Select
                multiple
                value={day.slots}
                onChange={e => {
                  const newAvail = [...availability];
                  // Sort slots before saving
                  newAvail[index].slots = e.target.value.sort((a, b) => {
                    const [ah, am] = a.split(":").map(Number);
                    const [bh, bm] = b.split(":").map(Number);
                    return ah * 60 + am - (bh * 60 + bm);
                  });
                  setAvailability(newAvail);
                }}
              >

                {defaultSlots.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={addDoctor}>Add Doctor</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Doctor Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Doctor</DialogTitle>
        <DialogContent dividers>
          <TextField margin="normal" label="Name" name="name" fullWidth value={editDoctorData?.name || ""} onChange={handleEditChange} />
          <TextField margin="normal" label="Specialization" name="specialization" fullWidth value={editDoctorData?.specialization || ""} onChange={handleEditChange} />
          <Typography variant="subtitle1" sx={{ mt: 2 }}>Edit Availability</Typography>
          {editDoctorData?.availability.map((day, index) => (
            <FormControl fullWidth key={day.day} sx={{ mb: 1 }}>
              <InputLabel>{day.day}</InputLabel>
              <Select
                multiple
                value={day.slots}
                onChange={e => {
                  const newAvail = [...editDoctorData.availability];
                  newAvail[index].slots = e.target.value.sort((a, b) => {
                    const [ah, am] = a.split(":").map(Number);
                    const [bh, bm] = b.split(":").map(Number);
                    return ah * 60 + am - (bh * 60 + bm);
                  });
                  setEditDoctorData({ ...editDoctorData, availability: newAvail });
                }}
              >

                {defaultSlots.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveDoctor}>Save</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
