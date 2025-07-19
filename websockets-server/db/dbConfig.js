// backend/db/dbConfig.js
const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      console.log("Already connected to DB.");
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true, // Deprecated, but often seen
      useUnifiedTopology: true, // Deprecated, but often seen
    });
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1); // Exit process on connection failure
  }
};

module.exports = dbConnect;
