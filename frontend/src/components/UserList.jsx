import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AddUser from './AddUser';

export default function UserList() {
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();
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
      // Backend returns array directly, or object with users array
      const usersData = Array.isArray(res.data) ? res.data : (res.data.users || []);
      setUsers(usersData);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Không thể tải danh sách users';
      setErrorFetch(errorMsg);
      console.error('Fetch users error:', err);
    } finally {
      setLoadingFetch(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    const userToDelete = users.find(u => (u._id || u.id) === id);
    const isSelfDelete = currentUser?._id === id || currentUser?.id === id;
    
    const confirmMessage = isSelfDelete 
      ? 'Bạn có chắc muốn xóa tài khoản của chính mình? Bạn sẽ bị đăng xuất ngay lập tức!'
      : `Bạn có chắc muốn xóa user "${userToDelete?.name || userToDelete?.email}"?`;
    
    if (!window.confirm(confirmMessage)) return;
    
    setLoadingDelete(true);
    setErrorDelete(null);

    // Optional: optimistic update
    const prevUsers = users;
    setUsers(users.filter(u => (u._id || u.id) !== id));

    try {
      await axios.delete(`http://localhost:3000/api/users/${id}`);
      
      // Nếu user tự xóa, logout và redirect
      if (isSelfDelete) {
        await logout();
        navigate('/login');
        return;
      }
      
      // Refresh list after successful delete
      await fetchUsers();
    } catch (err) {
      // rollback
      setUsers(prevUsers);
      const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Không thể xóa user';
      setErrorDelete(errorMsg);
      console.error('Delete user error:', err);
    } finally {
      setLoadingDelete(false);
    }
  };

  const onSaveComplete = () => {
    setEditingUser(null);
    fetchUsers();
  };

  return (
    <div className="page-content">
      <div className="card">
        <h2 style={{ marginTop: 0, marginBottom: '24px', color: '#333' }}>Danh sách Users</h2>

        {loadingFetch && <div className="loading">Đang tải danh sách users</div>}
        {errorFetch && <div className="error-message" style={{ fontSize: '14px', marginBottom: '15px' }}>{errorFetch}</div>}

        <AddUser fetchUsers={fetchUsers} editUser={editingUser} onSave={onSaveComplete} />

        {errorDelete && <div className="error-message" style={{ fontSize: '14px', marginBottom: '15px' }}>Lỗi xóa: {errorDelete}</div>}

        {!loadingFetch && users.length === 0 && !errorFetch && (
          <div className="empty-state">Không có users nào.</div>
        )}

        {!loadingFetch && users.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {users.map(user => (
                <li 
                  key={user._id || user.id}
                  style={{
                    padding: '16px',
                    marginBottom: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div>
                      <strong style={{ color: '#333', fontSize: '16px' }}>{user.name}</strong>
                      <span style={{ color: '#666', marginLeft: '12px' }}>{user.email}</span>
                    </div>
                    <span 
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: user.role === 'admin' ? '#dc3545' : '#6c757d',
                        color: 'white',
                        textTransform: 'uppercase'
                      }}
                    >
                      {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                    </span>
                    {(user._id === currentUser?._id || user.id === currentUser?.id) && (
                      <span style={{ 
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        backgroundColor: '#fff3cd',
                        color: '#856404',
                        fontWeight: '500'
                      }}>
                        (Bạn)
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => setEditingUser(user)}
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '13px' }}
                    >
                      ✏️ Sửa
                    </button>
                    <button 
                      onClick={() => handleDelete(user._id || user.id)} 
                      disabled={loadingDelete}
                      className="btn btn-danger"
                      style={{ padding: '6px 12px', fontSize: '13px' }}
                    >
                      {loadingDelete ? 'Đang xóa...' : '❌ Xóa'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
