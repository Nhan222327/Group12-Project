const User = require("../models/User");

// Lấy tất cả user
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // lấy từ MongoDB, loại bỏ password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err });
  }
};

// Tạo user mới
exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: "Name required" });
    if (!email || !/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ message: "Valid email required" });

    // Kiểm tra email trùng
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Nếu không có password, tạo password mặc định (hoặc bắt buộc password)
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const newUser = new User({ 
      name: name.trim(), 
      email: email.toLowerCase().trim(),
      password: password
    });
    const savedUser = await newUser.save(); // lưu vào MongoDB

    // Không trả về password
    const userResponse = {
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      avatar: savedUser.avatar,
      createdAt: savedUser.createdAt
    };

    res.status(201).json(userResponse);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Error creating user", error: err.message });
  }

};
exports.updateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.params.id;
    const currentUser = req.user;

    // Kiểm tra quyền: Admin có thể update bất kỳ user nào, user chỉ có thể update chính mình
    if (currentUser.role !== 'admin' && currentUser._id.toString() !== userId) {
      return res.status(403).json({ 
        message: "Bạn không có quyền cập nhật user này. Chỉ Admin hoặc chính user đó mới có quyền." 
      });
    }

    const updateData = {};

    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) {
      // Kiểm tra email trùng (trừ user hiện tại)
      const existingUser = await User.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: userId }
      });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
      updateData.email = email.toLowerCase().trim();
    }
    if (password !== undefined && password !== null && password !== '') {
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      updateData.password = password;
    }

    // Admin có thể thay đổi role, user thường không thể
    if (req.body.role && currentUser.role === 'admin') {
      updateData.role = req.body.role;
    }

    const updated = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
    if(!updated) return res.status(404).json({ message: "User not found" });
    
    // Không trả về password
    const userResponse = {
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      avatar: updated.avatar,
      createdAt: updated.createdAt
    };
    
    res.json(userResponse);
  } catch(err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(400).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUser = req.user;

    // Kiểm tra quyền: Admin có thể xóa bất kỳ user nào, user có thể xóa chính mình
    if (currentUser.role !== 'admin' && currentUser._id.toString() !== userId) {
      return res.status(403).json({ 
        message: "Bạn không có quyền xóa user này. Chỉ Admin hoặc chính user đó mới có quyền." 
      });
    }

    // Không cho phép xóa chính mình nếu là admin duy nhất (tùy chọn - có thể bỏ qua)
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    // Nếu user tự xóa, logout sẽ được xử lý ở frontend
    const deleted = await User.findByIdAndDelete(userId);
    if(!deleted) return res.status(404).json({ message: "User not found" });
    
    res.json({ 
      success: true,
      message: "User deleted successfully" 
    });
  } catch(err) { 
    res.status(400).json({ error: err.message }); 
  }
};
