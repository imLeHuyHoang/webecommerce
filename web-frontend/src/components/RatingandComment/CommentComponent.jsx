import React, { useState, useEffect } from "react";
import { Spinner, Form, Button, Collapse } from "react-bootstrap";
import apiClient from "../../utils/api-client";
import "./CommentComponent.css";

const CommentComponent = ({ productId }) => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // ID of the comment being replied to
  const [replyText, setReplyText] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch all comments and replies
  const fetchComments = async () => {
    try {
      const response = await apiClient.get(`/products/${productId}/comments`);
      const data = response.data;

      // Build hierarchical tree from flat comment list
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

  // Function to build hierarchical tree from flat comment list
  const buildCommentTree = (comments) => {
    const commentMap = {};
    const tree = [];

    // Create a map for easy access to comments by ID
    comments.forEach((comment) => {
      comment.replies = []; // Initialize replies array
      commentMap[comment._id] = comment;
    });

    // Build the tree
    comments.forEach((comment) => {
      if (comment.parentComment) {
        const parent = commentMap[comment.parentComment];
        if (parent) {
          parent.replies.push(comment);
        } else {
          // If parentComment doesn't exist, add as a top-level comment
          tree.push(comment);
        }
      } else {
        tree.push(comment);
      }
    });

    return tree;
  };

  // Handle adding a new comment
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

  // Handle replying to a specific comment
  const handleReply = (parentId) => {
    // If replying to the same comment, toggle off
    if (replyingTo === parentId) {
      setReplyingTo(null);
      setReplyText("");
    } else {
      setReplyingTo(parentId);
    }
  };

  // Handle submitting a reply
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

  // Function to render each comment and its replies
  const renderComments = (commentsList, depth = 0) => {
    return commentsList.map((comment) => (
      <div key={comment._id} className={`comment-item depth-${depth}`}>
        <div className="comment-content">
          <div className="comment-header">
            <strong>{comment.user.name}</strong>
            <small className="comment-time">
              {new Date(comment.createdAt).toLocaleString()}
            </small>
          </div>
          <div className="comment-body">{comment.comment}</div>
          <button
            className="reply-button"
            onClick={() => handleReply(comment._id)}
          >
            Trả lời
          </button>
        </div>

        {/* Reply form under each comment */}
        <Collapse in={replyingTo === comment._id}>
          <div className="reply-form">
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
              <div className="reply-buttons">
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
              </div>
            </Form>
          </div>
        </Collapse>

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="replies">
            {renderComments(comment.replies, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (loading)
    return (
      <div className="spinner-container">
        <Spinner animation="border" variant="primary" />
      </div>
    );

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
          <Button variant="primary" onClick={handleAddComment}>
            Gửi bình luận
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default CommentComponent;
