// Import các thư viện
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

// Khởi tạo ứng dụng
const app = express();

// Middleware cho phép nhận dữ liệu JSON
app.use(express.json());

// Cấu hình cổng chạy server
const PORT = process.env.PORT || 3000;

// Khởi động server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
