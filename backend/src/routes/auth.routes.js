const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Student = require('../models/student.model');

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const student = new Student({ name, email });
    await student.save();
    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET);
    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;