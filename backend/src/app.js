const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const becknRoutes = require('./routes/beckn.routes');
const authRoutes = require('./routes/auth.routes');

dotenv.config();
const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors({ origin: 'http://127.0.0.1:5500' })); // Match your frontend port

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB(); // wait until MongoDB connects
    console.log('Backend running');

    app.use('/api/beckn', becknRoutes);
    app.use('/api/auth', authRoutes);

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
  }
})();