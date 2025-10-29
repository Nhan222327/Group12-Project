import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AddUser from './AddUser';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [errorFetch, setErrorFetch] = useState(null);

  const [editingUser, setEditingUser] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [errorDelete, setErrorDelete] = useState(null);

  const fetchUsers = async () => {
    setLoadingFetch(true);
    setErrorFetch(null);
    try {
      const res = await axios.get('http://localhost:3000/api/users');
      setUsers(res.data);
    } catch (err) {
      setErrorFetch(err?.response?.data?.message || err.message || 'Fetch failed');
    } finally {
      setLoadingFetch(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa user này?')) return;
    setLoadingDelete(true);
    setErrorDelete(null);

    // Optional: optimistic update
    const prev = users;
    setUsers(prev.filter(u => u._id !== id));

    try {
      await axios.delete(`http://localhost:3000/api/users/${id}`);
    } catch (err) {
      // rollback
      setUsers(prev);
      setErrorDelete(err?.response?.data?.message || 'Delete failed');
    } finally {
      setLoadingDelete(false);
    }
  };

  const onSaveComplete = () => {
    setEditingUser(null);
    fetchUsers();
  };

  return (
    <div>
      <h2>Danh sách Users</h2>

      {loadingFetch ? <p>Loading users...</p> : null}
      {errorFetch ? <p style={{color:'red'}}>{errorFetch}</p> : null}

      <AddUser fetchUsers={fetchUsers} editUser={editingUser} onSave={onSaveComplete} />

      {errorDelete && <p style={{color:'red'}}>Delete error: {errorDelete}</p>}

      <ul>
        {users.map(user => (
          <li key={user._id}>
            {user.name} - {user.email}
            <button onClick={() => setEditingUser(user)}>✏️ Sửa</button>
            <button onClick={() => handleDelete(user._id)} disabled={loadingDelete}>
              {loadingDelete ? 'Xóa...' : '❌ Xóa'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
