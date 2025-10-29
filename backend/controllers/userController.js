const User = require("../models/User");

// Lấy tất cả user
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find(); // lấy từ MongoDB
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err });
  }
};

// Tạo user mới
exports.createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: "Name required" });
    if (!email || !/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ message: "Valid email required" });

    const newUser = new User({ name: name.trim(), email: email.trim() });
    const savedUser = await newUser.save(); // lưu vào MongoDB

    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ message: "Error creating user", error: err });
  }

};
exports.updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if(!updated) return res.status(404).json({ message: "User not found" });
    res.json(updated);
  } catch(err){ res.status(400).json({ error: err.message }); }
};

exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if(!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch(err){ res.status(400).json({ error: err.message }); }
};
