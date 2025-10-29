import React, { useState, useEffect } from "react";
import axios from "axios";
import AddUser from "./AddUser";

export default function UserList() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/users"); // backend port
      setUsers(res.data);
      console.log("Fetched users:", res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Danh sách Users</h2>
      <AddUser fetchUsers={fetchUsers} />
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}