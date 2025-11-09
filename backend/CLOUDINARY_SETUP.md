# Hướng dẫn cấu hình Cloudinary

## Bước 1: Tạo tài khoản Cloudinary

1. Truy cập: https://cloudinary.com/
2. Đăng ký tài khoản miễn phí
3. Vào Dashboard để lấy thông tin:
   - Cloud Name
   - API Key
   - API Secret

## Bước 2: Cấu hình Environment Variables

Thêm vào file `.env` trong thư mục `backend`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:3001
```

## Bước 3: Test Upload

Sau khi cấu hình, bạn có thể test upload avatar qua:
- Frontend: Trang Profile → Upload Avatar
- Postman: POST `/api/users/upload-avatar` với form-data (field: `avatar`)

## Lưu ý

- Cloudinary free tier có giới hạn storage và bandwidth
- Ảnh sẽ được tự động resize về 500x500px
- Format được convert sang JPG để tối ưu

