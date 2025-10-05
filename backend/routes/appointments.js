// routes/appointments.js
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Book appointment (patient)
router.post('/book', auth, role(['patient']), async (req,res)=>{
  const { doctorId, date } = req.body;
  const apptDate = new Date(date);

  const doctor = await Doctor.findById(doctorId);
  if(!doctor) return res.status(400).json({message:'Doctor not found'});

  // Prevent double booking
  const existing = await Appointment.findOne({ doctor: doctorId, date: apptDate, status: 'booked' });
  if(existing) return res.status(400).json({message:'Slot already booked'});

  const patientConflict = await Appointment.findOne({ patient: req.user._id, date: apptDate, status: 'booked' });
  if(patientConflict) return res.status(400).json({message:'You already have appointment at this time'});

  const appt = await Appointment.create({ doctor: doctorId, patient: req.user._id, date: apptDate, status: 'booked' });
  res.json(appt);
});

// Cancel
router.post('/:id/cancel', auth, async (req,res)=>{
  const appt = await Appointment.findById(req.params.id);
  if(!appt) return res.status(404).json({message:'Not found'});
  if(req.user.role === 'patient' && appt.patient.toString() !== req.user._id.toString())
    return res.status(403).json({message:'Forbidden'});
  appt.status = 'cancelled';
  await appt.save();
  res.json(appt);
});

// Get appointments (patient or admin)
router.get('/', auth, role(['admin','patient']), async (req,res)=>{
  let appts;
  if(req.user.role === 'admin'){
    appts = await Appointment.find().populate('doctor').populate('patient');
  } else {
    appts = await Appointment.find({ patient: req.user._id, status: 'booked' }).populate('doctor');
  }
  res.json(appts);
});
router.get('/my', auth, role(['patient']), async (req,res)=>{
  const appts = await Appointment.find({ patient: req.user._id }).populate('doctor');
  res.json(appts);
});


module.exports = router;
