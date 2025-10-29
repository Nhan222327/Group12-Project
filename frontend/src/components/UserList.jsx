import React, { useState, useEffect } from "react";
import axios from "axios";
import AddUser from "./AddUser";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null); // user đang được sửa

  // Lấy danh sách user từ backend
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // Xóa user
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/users/${id}`);
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  // Bấm nút "Sửa" → đổ dữ liệu vào form
  const handleEdit = (user) => {
    setEditUser(user);
  };

  // Khi lưu thành công → reset form & reload danh sách
  const handleSave = () => {
    setEditUser(null);
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Danh sách Users</h2>

      {/* form thêm/sửa user */}
      <AddUser fetchUsers={fetchUsers} editUser={editUser} onSave={handleSave} />

      <ul>
        {users.map((user) => (
          <li key={user._id}>
            {user.name} - {user.email}
            <button onClick={() => handleEdit(user)}>✏️ Sửa</button>
            <button onClick={() => handleDelete(user._id)}>❌ Xóa</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
