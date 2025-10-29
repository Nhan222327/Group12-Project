import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AddUser({ fetchUsers, editUser, onSave }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Khi chọn "Sửa", tự động điền dữ liệu user vào form
  useEffect(() => {
    if (editUser) {
      setName(editUser.name);
      setEmail(editUser.email);
    }
  }, [editUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !/\S+@\S+\.\S+/.test(email)) {
      alert("Nhập đúng name và email!");
      return;
    }

    try {
      if (editUser) {
        // 👉 PUT để cập nhật user
        await axios.put(`http://localhost:3000/api/users/${editUser._id}`, {
          name,
          email,
        });
        alert("Cập nhật thành công!");
        onSave(); // báo cho UserList biết đã sửa xong
      } else {
        // 👉 POST để thêm user mới
        await axios.post("http://localhost:3000/api/users", { name, email });
        fetchUsers();
        alert("Thêm thành công!");
      }

      // Reset form
      setName("");
      setEmail("");
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">{editUser ? "💾 Lưu" : "➕ Thêm"}</button>
    </form>
  );
}
