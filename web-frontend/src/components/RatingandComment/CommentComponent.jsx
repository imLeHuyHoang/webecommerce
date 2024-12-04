// src/components/RatingandComment/CommentComponent.jsx
import React, { useState, useEffect } from "react";
import { Spinner, Form, Button, Collapse } from "react-bootstrap";
import apiClient from "../../utils/api-client";
import "./CommentComponent.css";

const CommentComponent = ({ productId }) => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // ID của comment đang được trả lời
  const [replyText, setReplyText] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch tất cả các bình luận và trả lời
  const fetchComments = async () => {
    try {
      const response = await apiClient.get(`/products/${productId}/comments`);
      const data = response.data;

      // Xây dựng cây phân cấp từ dữ liệu trả về
      const commentTree = buildCommentTree(data);
      setComments(commentTree);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setMessage("Có lỗi xảy ra khi tải bình luận.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [productId]);

  // Hàm xây dựng cây phân cấp từ danh sách bình luận phẳng
  const buildCommentTree = (comments) => {
    const commentMap = {};
    const tree = [];

    // Tạo một bản đồ để dễ dàng truy cập các bình luận theo ID
    comments.forEach((comment) => {
      comment.replies = []; // Khởi tạo mảng replies
      commentMap[comment._id] = comment;
    });

    // Tạo cây phân cấp
    comments.forEach((comment) => {
      if (comment.parentComment) {
        const parent = commentMap[comment.parentComment];
        if (parent) {
          parent.replies.push(comment);
        } else {
          // Nếu parentComment không tồn tại, thêm vào cây như bình luận cha
          tree.push(comment);
        }
      } else {
        tree.push(comment);
      }
    });

    return tree;
  };

  // Handle thêm bình luận mới
  const handleAddComment = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setMessage("Vui lòng đăng nhập để bình luận.");
      return;
    }

    if (commentText.trim() === "") {
      setMessage("Nội dung bình luận không được để trống.");
      return;
    }

    try {
      const response = await apiClient.post(
        `/products/${productId}/comment`,
        { comment: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        setCommentText("");
        setMessage("Bình luận thành công!");
        fetchComments();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      setMessage("Có lỗi xảy ra khi gửi bình luận.");
    }
  };

  // Handle trả lời bình luận cụ thể
  const handleReply = (parentId) => {
    // Nếu đang trả lời cùng một comment, đóng form
    if (replyingTo === parentId) {
      setReplyingTo(null);
      setReplyText("");
    } else {
      setReplyingTo(parentId);
    }
  };

  // Handle gửi trả lời
  const handleSubmitReply = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setMessage("Vui lòng đăng nhập để trả lời bình luận.");
      return;
    }

    if (replyText.trim() === "") {
      setMessage("Nội dung trả lời không được để trống.");
      return;
    }

    try {
      const response = await apiClient.post(
        `/products/${productId}/comment`,
        { comment: replyText, parentComment: replyingTo },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        setReplyText("");
        setReplyingTo(null);
        setMessage("Trả lời bình luận thành công!");
        fetchComments();
      }
    } catch (error) {
      console.error("Error replying to comment:", error);
      setMessage("Có lỗi xảy ra khi trả lời bình luận.");
    }
  };

  // Hàm để render từng bình luận và trả lời (nếu có)
  const renderComments = (commentsList, depth = 0) => {
    return commentsList.map((comment) => (
      <div key={comment._id} className={`comment-item depth-${depth}`}>
        <div className="comment-content position-relative">
          <div className="comment-header d-flex align-items-center">
            <strong>{comment.user.name}</strong>
            <small className="text-muted ms-2">
              {new Date(comment.createdAt).toLocaleString()}
            </small>
          </div>
          <div className="comment-body">{comment.comment}</div>
          <Button
            variant="link"
            size="sm"
            className="reply-button p-0"
            onClick={() => handleReply(comment._id)}
          >
            Trả lời
          </Button>
        </div>

        {/* Form trả lời dưới từng bình luận */}
        <Collapse in={replyingTo === comment._id}>
          <div className="reply-form mt-2">
            <Form>
              <Form.Group controlId={`reply-${comment._id}`} className="mb-2">
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Viết trả lời"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </Form.Group>
              <Button
                variant="primary"
                size="sm"
                className="me-2"
                onClick={handleSubmitReply}
              >
                Gửi trả lời
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyText("");
                }}
              >
                Hủy
              </Button>
            </Form>
          </div>
        </Collapse>

        {/* Render các trả lời của bình luận hiện tại */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="replies mt-3">
            {renderComments(comment.replies, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (loading)
    return (
      <div className="text-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  return (
    <div className="comment-component">
      <h4 className="ml-10px">Bình luận về sản phẩm</h4>

      <div className="comments-list-container">
        {message && <p className="text-danger">{message}</p>}
        <div className="comments-list">
          {comments.length === 0 ? (
            <p>Chưa có bình luận nào.</p>
          ) : (
            renderComments(comments)
          )}
        </div>
      </div>

      <div className="add-comment-form">
        <Form className="ml-10px">
          <Form.Group controlId="newComment" className="mb-2">
            <Form.Label>Thêm bình luận</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Nhập bình luận của bạn..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
          </Form.Group>
          <Button
            className="ml-10px"
            variant="primary"
            onClick={handleAddComment}
          >
            Gửi bình luận
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default CommentComponent;
