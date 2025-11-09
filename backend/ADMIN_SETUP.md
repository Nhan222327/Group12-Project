# Hướng dẫn tạo Admin User

## Cách 1: Sử dụng Script (Khuyến nghị)

Chạy lệnh sau trong thư mục `backend`:

```bash
npm run create-admin
```

Script sẽ tự động tạo admin user với thông tin:
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Role**: `admin`

## Cách 2: Đăng ký và cập nhật role

1. Đăng ký một user bình thường qua frontend hoặc API
2. Sau đó cập nhật role thành `admin` trong MongoDB:

```javascript
// Trong MongoDB shell hoặc MongoDB Compass
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

## Cách 3: Tạo trực tiếp trong MongoDB

```javascript
// Trong MongoDB shell
use your-database-name

db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$...", // Password đã hash (phức tạp, không khuyến nghị)
  role: "admin",
  createdAt: new Date()
})
```

**Lưu ý**: Cách 3 không khuyến nghị vì cần hash password thủ công.

## Đăng nhập Admin

Sau khi tạo admin, bạn có thể đăng nhập với:
- **Email**: `admin@example.com`
- **Password**: `admin123`

Hoặc email/password của admin bạn đã tạo.

## Thay đổi thông tin Admin

Nếu muốn thay đổi email/password của admin, chỉnh sửa file `backend/scripts/createAdmin.js`:

```javascript
const adminEmail = "your-email@example.com";
const adminPassword = "your-password";
const adminName = "Your Admin Name";
```

Sau đó chạy lại: `npm run create-admin`

