const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to local MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/projectDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected locally'))
.catch(err => console.log(err));

// ---------------- CONTACT SCHEMA ----------------
const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
}, { timestamps: true });

const Contact = mongoose.model('Contact', contactSchema);

// ---------------- USER SCHEMA ----------------
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// ---------------- POST ROUTES ----------------

// Contact
app.post('/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const newContact = new Contact({ name, email, message });
        await newContact.save();
        res.status(200).json({ message: 'Message sent successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});

// Register
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if(existingUser) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(200).json({ message: 'Registered successfully!' });
  } catch(err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ message: 'User not registered' });

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.status(400).json({ message: 'Invalid password' });

    res.status(200).json({ message: 'Login successful!' });
  } catch(err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

