import React, { useState, useEffect } from "react";
import { Spinner, Form, Collapse } from "react-bootstrap";
import apiClient from "../../utils/api-client";
import "./CommentComponent.css";

const CommentComponent = ({ productId }) => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Retrieve userInfo from localStorage (key "user")
    const storedUserString = localStorage.getItem("user");
    if (storedUserString) {
      try {
        const storedUser = JSON.parse(storedUserString);
        setCurrentUser(storedUser);
      } catch (err) {
        console.error("Parse user error:", err);
      }
    }
    fetchComments();
  }, [productId]);

  // Fetch comments from API
  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/products/${productId}/comments`);
      const data = res.data;
      const tree = buildCommentTree(data);
      setComments(tree);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setMessage("Có lỗi xảy ra khi tải bình luận.");
    } finally {
      setLoading(false);
    }
  };

  // Build comment tree
  const buildCommentTree = (list) => {
    const map = {};
    const tree = [];
    list.forEach((c) => {
      c.replies = [];
      map[c._id] = c;
    });
    list.forEach((c) => {
      if (c.parentComment) {
        const parent = map[c.parentComment];
        if (parent) {
          parent.replies.push(c);
        } else {
          tree.push(c);
        }
      } else {
        tree.push(c);
      }
    });
    return tree;
  };

  // Add new comment
  const handleAddComment = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setMessage("Vui lòng đăng nhập để bình luận.");
      return;
    }
    if (!commentText.trim()) {
      setMessage("Nội dung bình luận không được để trống.");
      return;
    }

    try {
      const res = await apiClient.post(
        `/products/${productId}/comment`,
        { comment: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 201) {
        setCommentText("");
        setMessage("Bình luận thành công!");
        fetchComments();
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      setMessage("Có lỗi xảy ra khi gửi bình luận.");
    }
  };

  // Toggle reply form
  const handleReply = (parentId) => {
    if (replyingTo === parentId) {
      setReplyingTo(null);
      setReplyText("");
    } else {
      setReplyingTo(parentId);
    }
  };

  // Submit reply
  const handleSubmitReply = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setMessage("Vui lòng đăng nhập để trả lời bình luận.");
      return;
    }
    if (!replyText.trim()) {
      setMessage("Nội dung trả lời không được để trống.");
      return;
    }

    try {
      const res = await apiClient.post(
        `/products/${productId}/comment`,
        { comment: replyText, parentComment: replyingTo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 201) {
        setReplyText("");
        setReplyingTo(null);
        setMessage("Trả lời bình luận thành công!");
        fetchComments();
      }
    } catch (err) {
      console.error("Error replying to comment:", err);
      setMessage("Có lỗi xảy ra khi trả lời bình luận.");
    }
  };

  // Enter edit mode
  const handleEditClick = (comment) => {
    setEditingCommentId(comment._id);
    setEditingCommentText(comment.comment);
  };

  // Save edited comment
  const handleSaveEdit = async (commentId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setMessage("Vui lòng đăng nhập để chỉnh sửa bình luận.");
      return;
    }
    if (!editingCommentText.trim()) {
      setMessage("Nội dung sửa không được để trống.");
      return;
    }

    try {
      const res = await apiClient.put(
        `/products/${productId}/comment/${commentId}`,
        { comment: editingCommentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 200) {
        setMessage("Sửa bình luận thành công!");
        setEditingCommentId(null);
        setEditingCommentText("");
        fetchComments();
      }
    } catch (err) {
      console.error("Error editing comment:", err);
      // Check for 403 error
      if (err.response && err.response.status === 403) {
        setMessage("Bạn không có quyền sửa bình luận này.");
      } else {
        setMessage("Có lỗi xảy ra khi sửa bình luận.");
      }
    }
  };

  // Delete comment
  const handleDeleteComment = async (comment) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa bình luận này?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setMessage("Vui lòng đăng nhập để xóa bình luận.");
      return;
    }
    try {
      const res = await apiClient.delete(
        `/products/${productId}/comment/${comment._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 200) {
        setMessage("Xóa bình luận thành công!");
        fetchComments();
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      // Check for 403 error
      if (err.response && err.response.status === 403) {
        setMessage("Bạn không có quyền xóa bình luận này.");
      } else {
        setMessage("Có lỗi xảy ra khi xóa bình luận.");
      }
    }
  };

  // Log current user roles
  console.log(currentUser);

  // Recursive render for comments
  const renderComments = (commentsList, depth = 0) => {
    return commentsList.map((comment) => {
      // Check ownership
      const userIdOnClient = currentUser?.id || currentUser?._id;
      const userIdOnComment = comment.user?._id;

      const isOwner =
        userIdOnClient && userIdOnComment && userIdOnComment === userIdOnClient;

      // Admin check
      const isAdmin = currentUser?.roles?.includes("admin");

      // Permissions
      const canEdit = isOwner;
      const canDelete = isOwner || isAdmin;

      return (
        <div key={comment._id} className={`comment-item depth-${depth}`}>
          <div className="comment-content">
            <div className="comment-header">
              <strong>{comment.user?.name || "Unknown"}</strong>
              <small className="comment-time">
                {new Date(comment.createdAt).toLocaleString()}
              </small>
            </div>

            <div className="comment-body">
              {editingCommentId === comment._id ? (
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={editingCommentText}
                  onChange={(e) => setEditingCommentText(e.target.value)}
                />
              ) : (
                comment.comment
              )}
            </div>

            {/* Buttons */}
            <div className="comment-actions">
              {/* Reply */}
              <button
                className="comment-button comment-button-reply"
                onClick={() => handleReply(comment._id)}
              >
                Trả lời
              </button>

              {/* Edit */}
              {canEdit && editingCommentId !== comment._id && (
                <button
                  className="comment-button comment-button-edit"
                  onClick={() => handleEditClick(comment)}
                >
                  Sửa
                </button>
              )}

              {editingCommentId === comment._id && (
                <>
                  <button
                    className="comment-button comment-button-save"
                    onClick={() => handleSaveEdit(comment._id)}
                  >
                    Lưu
                  </button>
                  <button
                    className="comment-button comment-button-cancel"
                    onClick={() => {
                      setEditingCommentId(null);
                      setEditingCommentText("");
                    }}
                  >
                    Hủy
                  </button>
                </>
              )}

              {/* Delete */}
              {canDelete && (
                <button
                  className="comment-button comment-button-delete"
                  onClick={() => handleDeleteComment(comment)}
                >
                  Xóa
                </button>
              )}
            </div>
          </div>

          {/* Reply form */}
          <Collapse in={replyingTo === comment._id}>
            <div className="reply-form">
              <Form>
                <Form.Group controlId={`reply-${comment._id}`} className="mb-2">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Viết trả lời..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                </Form.Group>
                <div className="reply-buttons">
                  <button
                    className="comment-button comment-button-primary"
                    onClick={handleSubmitReply}
                  >
                    Gửi trả lời
                  </button>
                  <button
                    className="comment-button comment-button-secondary"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText("");
                    }}
                  >
                    Hủy
                  </button>
                </div>
              </Form>
            </div>
          </Collapse>

          {/* Render replies */}
          {comment.replies?.length > 0 && (
            <div className="replies">
              {renderComments(comment.replies, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="comment-component">
      <h4 className="comment-title">Bình luận về sản phẩm</h4>

      <div className="comments-list-container">
        {message && <p className="message">{message}</p>}
        <div className="comments-list">
          {comments.length === 0 ? (
            <p>Chưa có bình luận nào.</p>
          ) : (
            renderComments(comments)
          )}
        </div>
      </div>

      <div className="add-comment-form">
        <Form>
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
          <button
            className="comment-button comment-button-primary"
            onClick={handleAddComment}
          >
            Gửi bình luận
          </button>
        </Form>
      </div>
    </div>
  );
};

export default CommentComponent;
