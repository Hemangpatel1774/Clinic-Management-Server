const mongoose = require('mongoose');
const apptSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true }, // exact date-time of slot
  status: { type: String, enum: ['booked','cancelled','completed'], default: 'booked' }
},{ timestamps: true });

// Index to speed up queries & help uniqueness if using date+doctor unique constraint
apptSchema.index({ doctor: 1, date: 1 }, { unique: false });

module.exports = mongoose.model('Appointment', apptSchema);
