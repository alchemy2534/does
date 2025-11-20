const mongoose = require('mongoose');
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  skills: [{ type: String }], // e.g., ["Python", "Java"]
  credentials: [{ type: String }], // Store credential IDs or hashes
});
module.exports = mongoose.model('Student', studentSchema);