import React, { useEffect, useState } from "react";
import apiClient from "../../utils/api-client";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await apiClient.get("/user/profile");
        setUser(response.data);
      } catch (error) {
        console.error("Profile error:", error);
        setError("Error fetching profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Lắng nghe sự kiện localStorage khi logout
  useEffect(() => {
    const handleLogout = () => {
      setUser(null); // Xóa thông tin người dùng khỏi state
      navigate("/login", { replace: true }); // Chuyển hướng đến login
    };

    const logoutListener = (event) => {
      if (event.key === "logout") {
        handleLogout();
      }
    };

    window.addEventListener("storage", logoutListener); // Lắng nghe sự kiện

    return () => {
      window.removeEventListener("storage", logoutListener); // Xóa listener khi unmount
    };
  }, [navigate]);

  if (loading) return <p>Đang tải thông tin người dùng...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <section className="vh-100 profile-section">
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col col-lg-6 mb-4 mb-lg-0">
            <div className="card mb-3 profile-card">
              <div className="row g-0">
                <div className="col-md-4 gradient-custom text-center text-white profile-image-container">
                  <img
                    src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp"
                    alt="Avatar"
                    className="img-fluid my-5 profile-image"
                  />
                  <h5 className="profile-name">{user?.name}</h5>
                  <p className="profile-gender">{user?.gender}</p>
                  <i className="far fa-edit mb-5 profile-edit-icon"></i>
                </div>
                <div className="col-md-8">
                  <div className="card-body p-4">
                    <h6 className="profile-info-title">Information</h6>
                    <hr className="mt-0 mb-4" />
                    <div className="row pt-1">
                      <div className="col-6 mb-3">
                        <h6 className="profile-info-label">Email</h6>
                        <p className="text-muted profile-info-value">
                          {user?.email}
                        </p>
                      </div>
                      <div className="col-6 mb-3">
                        <h6 className="profile-info-label">Phone</h6>
                        <p className="text-muted profile-info-value">
                          {user?.phone}
                        </p>
                      </div>
                    </div>
                    <button
                      className="btn btn-outline-light btn-lg px-5 mt-4 profile-back-button"
                      onClick={() => navigate("/")}
                    >
                      Quay lại Trang Chủ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
