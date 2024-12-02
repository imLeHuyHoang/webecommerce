// components/RatingandComment/CommentComponent.jsx
import React, { useState, useEffect } from "react";
import apiClient from "../../utils/api-client";
import "./CommentComponent.css"; // Import CSS riêng cho component

const CommentComponent = ({ productId }) => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // ID của comment đang được trả lời
  const [replyText, setReplyText] = useState("");
  const [message, setMessage] = useState("");

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
          <div className="comment-header">
            <strong>{comment.user.name}</strong>{" "}
            <small className="text-muted">
              {new Date(comment.createdAt).toLocaleString()}
            </small>
          </div>
          <div className="comment-body">{comment.comment}</div>
          <button
            className="btn btn-sm btn-link reply-button"
            onClick={() => handleReply(comment._id)}
          >
            Trả lời
          </button>
        </div>

        {/* Form trả lời dưới từng bình luận */}
        {replyingTo === comment._id && (
          <div className="reply-form">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Viết trả lời"
              className="form-control mb-2"
            ></textarea>
            <button
              className="btn btn-primary btn-sm me-2"
              onClick={handleSubmitReply}
            >
              Gửi trả lời
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setReplyingTo(null);
                setReplyText("");
              }}
            >
              Hủy
            </button>
          </div>
        )}

        {/* Render các trả lời của bình luận hiện tại */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="replies">
            {renderComments(comment.replies, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="comment-component my-4">
      <h4>Bình luận</h4>
      <div className="mb-3">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Viết bình luận"
          className="form-control mb-2"
        ></textarea>
        <button className="btn btn-primary" onClick={handleAddComment}>
          Gửi bình luận
        </button>
      </div>
      {message && <p className="mt-2 text-success">{message}</p>}
      <div>
        {comments.length === 0 ? (
          <p>Chưa có bình luận nào.</p>
        ) : (
          renderComments(comments)
        )}
      </div>
    </div>
  );
};

export default CommentComponent;
