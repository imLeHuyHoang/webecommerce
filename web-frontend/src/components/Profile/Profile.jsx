import React, { useEffect, useState } from "react";
import apiClient from "../../utils/api-client";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        alert("Bạn cần đăng nhập để xem thông tin cá nhân.");
        navigate("/login");
        return;
      }

      try {
        const response = await apiClient.get("/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`, // Gửi token trong header
          },
        });
        setUser(response.data); // Lưu thông tin người dùng vào state
      } catch (error) {
        setError("Không thể tải thông tin người dùng.");
        console.error("Profile error:", error);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  if (error) return <p>{error}</p>;

  if (!user) return <p>Đang tải thông tin người dùng...</p>;

  return (
    <div>
      <h1>Thông Tin Cá Nhân</h1>
      <p>Tên: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Phone: {user.phone}</p>
      <p>Giới tính: {user.gender}</p>
      <button onClick={() => navigate("/")}>Quay lại Trang Chủ</button>
    </div>
  );
};

export default Profile;
