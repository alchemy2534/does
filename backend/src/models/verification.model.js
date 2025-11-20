const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  order_id: { type: String, required: true, unique: true },
  student_id: { type: String, required: true },
  status: { type: String, enum: ['searched', 'selected', 'initiated', 'confirmed', 'fulfilled'], default: 'searched' },
  verified_data: { type: Object, default: {} },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Verification', verificationSchema);