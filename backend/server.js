require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Register API routes first
app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));

// Then add a GET handler for the root path
app.get('/', (req, res) => res.send('API Running'));

// GET /api/all - dashboard totals
app.get("/api/allCounts", async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const totalUsers = await User.find({role:'patient'}).countDocuments();
    const totalBookings = await Appointment.countDocuments();

    res.json({ totalDoctors, totalUsers, totalBookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server running on http://localhost:${PORT}`));
