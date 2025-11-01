# README - Nguyễn Hoàng Phúc

## 🎯 Vai trò: Database Developer (MongoDB)

### 🧩 Nhiệm vụ chính:
- Tạo và quản lý cơ sở dữ liệu MongoDB cho dự án **Group12-Project**.
- Thiết lập kết nối giữa backend (Node.js + Express) với MongoDB Atlas.
- Thiết kế **database groupDB** và **collection users** để lưu thông tin người dùng.
- Xây dựng model `User.js` (gồm name, email).
- Cập nhật backend để các API GET/POST hoạt động với MongoDB thật.
- Kiểm thử việc lưu – lấy dữ liệu bằng MongoDB Compass hoặc Atlas UI.

---

## ⚙️ Công cụ & Công nghệ sử dụng:
- **MongoDB Atlas** – cloud database.
- **Mongoose** – thư viện kết nối MongoDB với Node.js.
- **Node.js + Express** – dùng để tạo API tương tác với database.
- **Postman / Insomnia** – test API hoạt động.
- **Git & GitHub** – quản lý mã nguồn, commit và pull request.

---

## 🪜 Các bước thực hiện chính:

### 1️⃣ Tạo database trên MongoDB Atlas
- Đăng ký tài khoản tại [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Tạo **Cluster mới**
- Tạo **Database name:** `groupDB`
- Tạo **Collection name:** `users`

### 2️⃣ Kết nối MongoDB với Backend
- Cài thư viện Mongoose:
  ```bash
  npm install mongoose