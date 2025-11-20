const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000 // 10 seconds timeout
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('DB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
