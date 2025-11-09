require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    createAdmin();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

async function createAdmin() {
  try {
    const adminEmail = "admin@example.com";
    const adminPassword = "admin123"; // Password mặc định
    const adminName = "Admin User";

    // Kiểm tra xem admin đã tồn tại chưa
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      // Nếu đã tồn tại, cập nhật role thành admin
      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        await existingAdmin.save();
        console.log("✅ Đã cập nhật user thành Admin!");
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
      } else {
        console.log("ℹ️  Admin user đã tồn tại!");
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
      }
    } else {
      // Tạo admin mới
      const admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: "admin"
      });

      console.log("✅ Đã tạo Admin user thành công!");
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
      console.log(`   Role: ${admin.role}`);
    }

    console.log("\n📝 Thông tin đăng nhập Admin:");
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log("\n🚀 Bạn có thể đăng nhập ngay bây giờ!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi khi tạo admin:", error);
    process.exit(1);
  }
}

