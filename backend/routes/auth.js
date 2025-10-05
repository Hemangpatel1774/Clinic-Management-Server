const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req,res)=>{
  console.log(req.body);
  const { name, email, password, role } = req.body;
  try{
    if(await User.findOne({email})) return res.status(400).json({message:'Email exists'});
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password: hash, role });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({ token, user: { id:user._id, name:user.name, email:user.email, role:user.role }});
  }catch(err){ res.status(500).json({message:err.message}) }
});

router.post('/login', async (req,res)=>{
  const { email, password } = req.body;
  try{
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({message:'Invalid credentials'});
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.status(400).json({message:'Invalid credentials'});
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({ token, user: { id:user._id, name:user.name, email:user.email, role:user.role }});
  }catch(err){ res.status(500).json({message:err.message})}
});

module.exports = router;
