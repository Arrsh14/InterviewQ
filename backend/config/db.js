const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options silence deprecation warnings
      serverSelectionTimeoutMS: 5000,   // fail fast if Atlas unreachable
      socketTimeoutMS:          45000,  // close sockets after 45s of inactivity
    });

    console.log(`✅ MongoDB Atlas connected: ${conn.connection.host}`);

    // ── Connection event listeners ──────────────────────────────────────────
    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected. Attempting reconnect…");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB error:", err.message);
    });

  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1); // kill the server — no point running without DB
  }
};

module.exports = connectDB;