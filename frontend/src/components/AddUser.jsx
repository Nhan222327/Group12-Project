import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Helper validation
const validateUser = ({ name, email, password, isEdit }) => {
  const errors = {};
  if (!name || !name.trim()) errors.name = 'Name không được để trống';
  if (!email || !/\S+@\S+\.\S+/.test(email)) errors.email = 'Email không hợp lệ';
  // Chỉ yêu cầu password khi tạo mới, không bắt buộc khi chỉnh sửa
  if (!isEdit && (!password || password.length < 6)) {
    errors.password = 'Password phải có ít nhất 6 ký tự';
  } else if (password && password.length < 6) {
    errors.password = 'Password phải có ít nhất 6 ký tự';
  }
  return { ok: Object.keys(errors).length === 0, errors };
};

export default function AddUser({ fetchUsers, editUser, onSave }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localErrors, setLocalErrors] = useState({});
  const [loadingSave, setLoadingSave] = useState(false);
  const [errorSave, setErrorSave] = useState(null);

  useEffect(() => {
    if (editUser) {
      setName(editUser.name || '');
      setEmail(editUser.email || '');
      setPassword('');
      setLocalErrors({});
      setErrorSave(null);
    } else {
      setName('');
      setEmail('');
      setPassword('');
    }
  }, [editUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorSave(null);
    const { ok, errors } = validateUser({ name, email, password, isEdit: !!editUser });
    setLocalErrors(errors);
    if (!ok) return;

    setLoadingSave(true);
    try {
      if (editUser) {
        // PUT - chỉ gửi password nếu có thay đổi
        const updateData = { name: name.trim(), email: email.trim() };
        if (password) updateData.password = password;
        const userId = editUser._id || editUser.id;
        await axios.put(`http://localhost:3000/api/users/${userId}`, updateData);
        if (typeof onSave === 'function') onSave();
      } else {
        // POST - bắt buộc password
        await axios.post('http://localhost:3000/api/users', { name: name.trim(), email: email.trim(), password });
        if (typeof fetchUsers === 'function') fetchUsers();
      }
      // reset form if added
      if (!editUser) { setName(''); setEmail(''); setPassword(''); }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Lưu không thành công';
      setErrorSave(errorMessage);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleCancel = () => {
    setName(''); setEmail(''); setPassword(''); setLocalErrors({}); if (typeof onSave === 'function') onSave();
  };

  return (
    <div className="card" style={{ marginBottom: '20px', backgroundColor: editUser ? '#fff3cd' : 'white' }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>
        {editUser ? '✏️ Chỉnh sửa User' : '➕ Thêm User mới'}
      </h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label className="label">Tên</label>
          <input
            type="text"
            className="input"
            placeholder="Nhập tên"
            value={name}
            onChange={e => setName(e.target.value)}
            aria-label="Name"
          />
          {localErrors.name && <div className="error-message">{localErrors.name}</div>}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            placeholder="Nhập email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            aria-label="Email"
          />
          {localErrors.email && <div className="error-message">{localErrors.email}</div>}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="label">Mật khẩu</label>
          <input
            type="password"
            className="input"
            placeholder={editUser ? "Để trống nếu không đổi mật khẩu" : "Nhập mật khẩu (tối thiểu 6 ký tự)"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            aria-label="Password"
          />
          {localErrors.password && <div className="error-message">{localErrors.password}</div>}
        </div>

        {errorSave && <div className="error-message" style={{ fontSize: '14px', marginBottom: '15px' }}>{errorSave}</div>}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="submit" 
            disabled={loadingSave}
            className="btn btn-success"
          >
            {loadingSave ? 'Đang lưu...' : (editUser ? '💾 Lưu thay đổi' : '➕ Thêm User')}
          </button>

          {editUser && (
            <button 
              type="button" 
              onClick={handleCancel} 
              disabled={loadingSave}
              className="btn btn-secondary"
            >
              Hủy
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
