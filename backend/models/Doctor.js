const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  day: { type: String, required: true }, // e.g., "Mon", "Tue"
  slots: { type: [String], default: [] } // e.g., ["09:00","09:30","10:00"]
});

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  availability: { type: [slotSchema], default: [] }
},{ timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
