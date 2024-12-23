// src/components/HomePage/ServicesAndTestimonials.jsx
import React, { useEffect, useState, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import "./ServicesAndTestimonials.css";
import apiClient from "../../utils/api-client";
import { ToastContext } from "../ToastNotification/ToastContext";
import { useAuth } from "../../context/AuthContext";

function ServicesAndTestimonials() {
  // States cho phần Testimonials
  const [comments, setComments] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isFading, setIsFading] = useState(false);
  const { addToast } = useContext(ToastContext);
  const { auth } = useAuth();

  useEffect(() => {
    fetchComments();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (comments.length > 4 && !isFading) {
        setIsFading(true);
        setTimeout(() => {
          setCurrentSlide((prev) => (prev + 4) % comments.length);
          setIsFading(false);
        }, 500);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [comments, isFading]);

  const fetchComments = async () => {
    try {
      const response = await apiClient.get("/shop/comments");
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching shop comments:", error);
      addToast("Không thể tải đánh giá khách hàng.", "danger");
    }
  };

  // Xóa bình luận
  const handleDeleteComment = async (commentId) => {
    try {
      await apiClient.delete(`/shop/comments/${commentId}`);
      setComments((prevComments) =>
        prevComments.filter((comment) => comment._id !== commentId)
      );
      addToast("Đã xóa bình luận thành công!", "success");
    } catch (error) {
      console.error("Error deleting comment:", error);
      addToast("Không thể xóa bình luận.", "danger");
    }
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNewComment("");
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (newComment.trim() === "") {
      addToast("Nội dung bình luận không được để trống.", "warning");
      return;
    }

    try {
      const response = await apiClient.post("/shop/comments", {
        text: newComment,
      });
      setComments([response.data, ...comments]);
      addToast("Cảm ơn bạn đã đánh giá!", "success");
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting comment:", error);
      addToast("Không thể gửi bình luận.", "danger");
    }
  };

  // Xác định các bình luận hiển thị trong slide hiện tại
  const displayedComments = comments.slice(currentSlide, currentSlide + 4);
  if (displayedComments.length < 4 && comments.length >= 4) {
    displayedComments.push(...comments.slice(0, 4 - displayedComments.length));
  }

  // Dữ liệu dịch vụ
  const services = [
    {
      icon: "fas fa-shipping-fast",
      title: "Giao Hàng Nhanh",
      description: "Sản phẩm được giao nhanh chóng đến tận nhà.",
    },
    {
      icon: "fas fa-headset",
      title: "Hỗ Trợ 24/7",
      description: "Chúng tôi luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi.",
    },
    {
      icon: "fas fa-sync-alt",
      title: "Đổi Trả Dễ Dàng",
      description: "Không hài lòng? Đổi trả sản phẩm dễ dàng.",
    },
    {
      icon: "fas fa-lock",
      title: "Thanh Toán An Toàn",
      description: "Mọi giao dịch đều được mã hóa và bảo mật tuyệt đối.",
    },
    {
      icon: "fas fa-gift",
      title: "Ưu Đãi Đặc Biệt",
      description: "Nhận ngay các ưu đãi và giảm giá đặc biệt",
    },
    {
      icon: "fas fa-certificate",
      title: "Chất Lượng Đảm Bảo",
      description: "Sản phẩm luôn đạt chất lượng cao nhất.",
    },
  ];

  return (
    <section className="sat-section py-5 bg-light">
      <Container className="Container-services">
        {/* Phần Dịch Vụ */}
        <h2 className="sat-title text-center mb-5">Dịch Vụ Của Chúng Tôi</h2>
        <Row>
          {services.map((service, index) => (
            <Col key={index} md={4} className="text-center mb-4">
              <Card className="sat-service-card">
                <Card.Body>
                  <i
                    className={`${service.icon} fa-3x mb-3 sat-service-icon`}
                  ></i>
                  <Card.Title className="sat-service-title">
                    {service.title}
                  </Card.Title>
                  <Card.Text className="sat-service-description">
                    {service.description}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Phần Đánh Giá Khách Hàng */}
        <h2 className="sat-testimonials-title text-center mb-4">
          Khách hàng của chúng tôi đánh giá như nào?
        </h2>
        <Row
          className={`sat-testimonial-row ${
            isFading ? "sat-fade-out" : "sat-fade-in"
          }`}
        >
          {displayedComments.map((comment) => (
            <Col key={comment._id} md={3} sm={6} className="mb-4">
              <Card className="sat-testimonial-card h-100">
                <Card.Body>
                  <p className="sat-testimonial-text">"{comment.text}"</p>
                  <h5 className="sat-testimonial-author mt-3">
                    - {comment.author.name}
                  </h5>

                  {/* Nút xóa (chỉ hiển thị nếu user là admin) */}
                  {auth.user && auth.user.roles.includes("admin") && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteComment(comment._id)}
                    >
                      Xóa
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Comment Submission Section */}
        <div className="sat-comment-section text-center mt-4 mb-4">
          <p>
            Bạn đã từng mua hàng? Hãy cho chúng tôi đánh giá thực tế từ bạn.
          </p>
          {auth.user ? (
            <Button variant="primary" onClick={handleShowModal}>
              Để lại bình luận
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => (window.location.href = "/login")}
            >
              Vui lòng đăng nhập để để lại bình luận
            </Button>
          )}
        </div>

        {/* Modal for Adding a Comment */}
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Để lại bình luận</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmitComment}>
            <Modal.Body>
              <Form.Group controlId="commentText">
                <Form.Label>Bình luận của bạn</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Nhập bình luận ở đây..."
                  required
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Đóng
              </Button>
              <Button variant="primary" type="submit">
                Gửi bình luận
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </section>
  );
}

export default ServicesAndTestimonials;