// UserInfoForm.jsx
import React, { useState } from "react";
import apiClient from "../../utils/api-client";

const UserInfoForm = ({ initialData, onSave }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    phone: initialData.phone || "",
    gender: initialData.gender || "male",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Gọi API để cập nhật thông tin
      const response = await apiClient.put("/user/profile", formData);
      onSave(response.data);
    } catch (error) {
      console.error("Error updating user info:", error);
      alert("Lỗi khi cập nhật thông tin người dùng.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Các trường thông tin người dùng */}
      <div className="form-group">
        <label>Họ tên</label>
        <input
          type="text"
          className="form-control"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Số điện thoại</label>
        <input
          type="text"
          className="form-control"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">
        {saving ? "Đang lưu..." : "Lưu thông tin"}
      </button>
    </form>
  );
};

export default UserInfoForm;
