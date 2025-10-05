const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');
const role = require('../middleware/role'); // <-- remove the ()
// Create doctor (admin)
router.post('/', auth, role(['admin']), async (req,res)=>{
  const doctor = await Doctor.create(req.body);
  res.json(doctor);
});

// Edit
router.put('/:id', auth, role(['admin']), async (req,res)=>{
  const doc = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(doc);
});

// Delete
router.delete('/:id', auth, role(['admin']), async (req,res)=>{
  await Doctor.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Public: list doctors (with optional specialization filter)
router.get('/', auth, async (req,res)=>{
  const { specialization } = req.query;
  const filter = specialization ? { specialization } : {};
  const doctors = await Doctor.find(filter);
  res.json(doctors);
});

module.exports = router;
