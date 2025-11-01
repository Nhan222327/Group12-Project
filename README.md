# Group12-Project - Authentication & User Management System

Ứng dụng web hoàn chỉnh với Authentication & User Management sử dụng Node.js, MongoDB, và React.

## 🎯 Tính năng chính

### 1. Authentication (Xác thực)
- ✅ Đăng ký (Sign Up) - Kiểm tra email trùng, mã hóa mật khẩu bằng bcrypt
- ✅ Đăng nhập (Login) - Xác thực email/password, trả về JWT token
- ✅ Đăng xuất (Logout) - Xóa token phía client

### 2. Quản lý thông tin cá nhân
- ✅ Xem thông tin cá nhân (View Profile)
- ✅ Cập nhật thông tin cá nhân (Update Profile) - Name, Password
- ✅ Upload Avatar - Lưu trên Cloudinary

### 3. Quản lý User (Admin)
- ✅ Danh sách người dùng (User List - chỉ Admin)
- ✅ Xóa tài khoản (Delete User - Admin hoặc tự xóa)
- ✅ Phân quyền (RBAC) - User thường và Admin

### 4. Tính năng nâng cao
- ✅ Quên mật khẩu (Forgot Password) - Gửi token reset
- ✅ Đổi mật khẩu với token reset (Reset Password)

## 🛠 Công nghệ sử dụng

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Image storage
- **Multer** - File upload handling

### Frontend
- **React** - UI library
- **React Router** - Routing
- **Axios** - HTTP client
- **Context API** - State management

## 📋 Yêu cầu hệ thống

- Node.js >= 14.x
- MongoDB (local hoặc Atlas)
- npm hoặc yarn
- Tài khoản Cloudinary (cho avatar upload)

## 🚀 Cài đặt và chạy

### 1. Clone repository
```bash
git clone <repository-url>
cd Group12-Project
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Tạo file `.env` trong thư mục `backend/`:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/group12-auth
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

Chạy backend:
```bash
npm run dev
```

Backend sẽ chạy tại `http://localhost:3000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Chạy frontend:
```bash
npm start
```

Frontend sẽ chạy tại `http://localhost:3001`

## 📁 Cấu trúc Project

```
Group12-Project/
├── backend/
│   ├── controllers/
│   │   ├── authController.js      # Authentication logic
│   │   ├── profileController.js   # Profile & middleware
│   │   └── userController.js      # User management
│   ├── models/
│   │   └── User.js                # User schema
│   ├── routes/
│   │   ├── auth.js                # Auth routes
│   │   ├── profile.js             # Profile routes
│   │   └── user.js                # User routes
│   ├── utils/
│   │   └── cloudinary.js          # Cloudinary config
│   ├── server.js                  # Express server
│   └── .env                       # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/              # Auth components
│   │   │   ├── profile/           # Profile components
│   │   │   └── admin/             # Admin components
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Auth context
│   │   └── App.js                 # Main app component
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Reset mật khẩu

### Profile
- `GET /api/users/profile` - Lấy thông tin profile (Protected)
- `PUT /api/users/profile` - Cập nhật profile (Protected)
- `POST /api/users/upload-avatar` - Upload avatar (Protected)

### User Management (Admin only)
- `GET /api/users` - Lấy danh sách users (Admin only)
- `DELETE /api/users/:id` - Xóa user (Admin hoặc tự xóa)

## 📝 Ví dụ Request/Response

### Sign Up
**Request:**
```json
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sign up successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Login
**Request:**
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "avatar": ""
  }
}
```

### Get Profile (Protected)
**Request:**
```
GET /api/users/profile
Headers: Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "avatar": "https://cloudinary.com/...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🧪 Testing với Postman

1. Import collection từ file `postman_collection.json` (nếu có)
2. Hoặc tạo requests thủ công theo các endpoints trên
3. Để test protected routes, copy JWT token từ response login/signup và thêm vào Header:
   ```
   Authorization: Bearer <your_token_here>
   ```

## 👥 Phân quyền (RBAC)

- **User**: Có thể xem và cập nhật profile của chính mình, xóa tài khoản của mình
- **Admin**: Có thể xem danh sách tất cả users, xóa bất kỳ user nào

## 🔐 Bảo mật

- Mật khẩu được hash bằng bcrypt (10 rounds)
- JWT token với expiration time
- Protected routes yêu cầu Bearer token
- Role-based access control (RBAC)
- Password reset token có thời hạn (10 phút)

## 📸 Screenshots

(Xem các file screenshot trong thư mục `screenshots/` nếu có)

## 🐛 Troubleshooting

### Lỗi kết nối MongoDB
- Kiểm tra MongoDB đang chạy: `mongod`
- Kiểm tra `MONGO_URI` trong `.env`

### Lỗi JWT
- Kiểm tra `JWT_SECRET` đã được set trong `.env`
- Kiểm tra token có hợp lệ và chưa hết hạn

### Lỗi Cloudinary upload
- Kiểm tra các biến `CLOUDINARY_*` trong `.env`
- Kiểm tra tài khoản Cloudinary còn hoạt động

### CORS Error
- Đảm bảo backend đã enable CORS
- Kiểm tra frontend URL đúng với backend

## 📚 Tài liệu tham khảo

- [Hướng dẫn chi tiết](./HUONG_DAN_BUOI5.md)
- [Checklist triển khai](./CHECKLIST_IMPLEMENTATION.md)
- [Code Reference](./CODE_REFERENCE.md)

## 👨‍💻 Thành viên nhóm

- Sinh viên 1 - Backend Developer
- Sinh viên 2 - Frontend Developer
- Sinh viên 3 - Database & Git Manager

## 📄 License

MIT

## 🙏 Acknowledgments

- Express.js documentation
- React documentation
- MongoDB documentation
- Cloudinary documentation

---

**Lưu ý**: Đây là project học tập. Không sử dụng trong môi trường production mà không có các biện pháp bảo mật bổ sung.
