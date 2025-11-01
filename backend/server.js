require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI) // lấy từ .env
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/api", userRoutes);

// Health check
app.get("/", (req, res) => res.send("API is running"));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// ... existing code ...
const authRoutes = require("./routes/auth");

// Routes
app.use("/api", userRoutes);
app.use("/api/auth", authRoutes); // Thêm dòng này

// ... rest of code ...
