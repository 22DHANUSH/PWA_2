import React, { useState, useEffect } from "react";
import {
  Typography,
  Divider,
  Rate,
  Input,
  Button,
  Space,
  Card,
  Pagination,
  Flex,
} from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import {
  getUserNameById,
  addReview,
  editReview,
  deleteReview,
  getReviewsByProductId,
} from "../../products.api.js";

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

const ProductReviews = ({ reviews, setReviews, selectedSku }) => {
  const userId = useSelector((state) => state.auth?.userId);
  const [newReviewText, setNewReviewText] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [userMap, setUserMap] = useState({});
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  const reloadReviews = async () => {
    if (!selectedSku?.productId) return;
    try {
      const latestReviews = await getReviewsByProductId(selectedSku.productId);
      setReviews(latestReviews);
    } catch (error) {
      console.error("Error reloading reviews:", error);
    }
  };

  useEffect(() => {
    const fetchUserNames = async () => {
      const map = {};
      await Promise.all(
        reviews.map(async (review) => {
          if (review.userId && !map[review.userId]) {
            try {
              map[review.userId] = await getUserNameById(review.userId);
            } catch (error) {
              console.error("Error fetching user:", error);
              map[review.userId] = "Unknown User";
            }
          }
        })
      );
      setUserMap(map);
    };

    if (reviews.length > 0) {
      fetchUserNames();
    }
  }, [reviews]);

  const handleAddReview = async () => {
    if (
      newReviewText.trim() === "" ||
      newRating === 0 ||
      !selectedSku ||
      !userId
    )
      return;

    try {
      const existingReview = reviews.find(
        (r) =>
          String(r.userId) === String(userId) &&
          String(r.productSkuId) === String(selectedSku.productSkuId)
      );

      if (editingReviewId || existingReview) {
        const reviewIdToEdit = editingReviewId || existingReview?.reviewId;

        await editReview({
          reviewId: reviewIdToEdit,
          reviewText: newReviewText,
          rating: newRating,
          productSkuId: selectedSku.productSkuId,
          userId,
        });

        setReviews((prevReviews) =>
          prevReviews.map((r) =>
            r.reviewId === reviewIdToEdit
              ? { ...r, reviewText: newReviewText, rating: newRating }
              : r
          )
        );

        setEditingReviewId(null);
      } else {
        await addReview({
          reviewText: newReviewText,
          rating: newRating,
          productSkuId: selectedSku.productSkuId,
          userId,
        });

        await reloadReviews();
      }

      setNewReviewText("");
      setNewRating(0);
    } catch (error) {
      console.error("Error submitting review:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Status:", error.response.status);
        console.error("Headers:", error.response.headers);
      }
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      await reloadReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const startEditing = (review) => {
    setEditingReviewId(review.reviewId);
    setNewReviewText(review.reviewText);
    setNewRating(review.rating);
  };

  const paginatedReviews = [...reviews]
    .reverse()
    .slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage);

  return (
    <div style={{ marginTop: "48px" }}>
      <Divider />
      <Title level={4}>Customer Reviews</Title>

      {userId && (
        <Card style={{ marginTop: 24 }}>
          <Title level={5}>
            {editingReviewId ? "Edit Review" : "Add Your Review"}
          </Title>
          <TextArea
            rows={3}
            placeholder="Your review"
            value={newReviewText}
            onChange={(e) => setNewReviewText(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <Rate
            value={newRating}
            onChange={setNewRating}
            style={{ marginBottom: 12 }}
          />
          <Button type="primary" onClick={handleAddReview}>
            {editingReviewId ? "Update Review" : "Submit Review"}
          </Button>
        </Card>
      )}

      {reviews.length === 0 ? (
        <Text type="secondary">No reviews yet.</Text>
      ) : (
        <>
          {paginatedReviews.map((review, idx) => (
            <Card
              key={idx}
              style={{ marginTop: 16 }}
              bodyStyle={{ position: "relative" }}
            >
              <Text type="secondary">
                {userMap[review.userId] || "Loading..."}
              </Text>
              <Paragraph style={{ marginTop: 8 }}>
                {review.reviewText}
              </Paragraph>
              <Rate value={review.rating} disabled />

              {String(review.userId) === String(userId) && (
                <Space style={{ position: "absolute", top: 16, right: 16 }}>
                  <Button
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => startEditing(review)}
                  />
                  <Button
                    icon={<DeleteOutlined />}
                    size="small"
                    danger
                    onClick={() => handleDeleteReview(review.reviewId)}
                  />
                </Space>
              )}
            </Card>
          ))}
          <Pagination
            current={currentPage}
            pageSize={reviewsPerPage}
            total={reviews.length}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
            style={{
              marginTop: 24,
              marginBottom: 24,
              textAlign: "center",
              display: Flex,
              justifyContent: "center",
            }}
          />
        </>
      )}
    </div>
  );
};

export default ProductReviews;
