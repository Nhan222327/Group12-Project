require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express(); // phải khởi tạo trước khi dùng app.use

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const userRoutes = require('./routes/user'); // router chỉ export router
app.use('/api', userRoutes); // tất cả route trong user.js sẽ có prefix /api

// Health check
app.get('/', (req, res) => res.send('API is running'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
