import React, { useEffect, useState } from "react";
import { Spin, message } from "antd";
import { useParams } from "react-router-dom";
import { getOrderItems, getOrderStatusTimeline,getOrderTracking } from "../../order.api";
import OrderStatusTimeline from "../Components/OrderStatusTimeline";
import OrderSummary from "../Components/OrderSummary";
import "../../order.css"
 
const OrderTracking = () => {
  const { orderId } = useParams();
  const userId = localStorage.getItem("userId");
  const [statuses, setStatuses] = useState([]);
  const [trackingDetails, setTrackingDetails] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        setLoading(true);
        const [statusTimeline, trackingData, orderItems] = await Promise.all([
          getOrderStatusTimeline(orderId),
          getOrderTracking(userId, orderId),
          getOrderItems(orderId),
        ]);
        const allowedStatuses = [
          "Order Placed",
          "Shipped",
          "Out for Delivery",
          "Delivered",
        ];
        const statusMap = {};
        statusTimeline.forEach((s) => {
          if (allowedStatuses.includes(s.historyStatus)) {
            statusMap[s.historyStatus] = s.updatedAt;
          }
        });
        const orderedSteps = [];
        let allowNext = true;
        for (const status of allowedStatuses) {
          if (allowNext && statusMap[status]) {
            orderedSteps.push({ status, updatedAt: statusMap[status] });
          } else {
            allowNext = false;
            orderedSteps.push({ status, updatedAt: null });
          }
        }
        setStatuses(orderedSteps);
        setTrackingDetails(trackingData[0] || null);
        setItems(orderItems);
      } catch (error) {
        message.error("Failed to fetch order tracking details.");
      } finally {
        setLoading(false);
      }
    };
    if (orderId && userId) fetchTrackingData();
  }, [orderId, userId]);
 
  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }
 
  if (!trackingDetails) {
    return <div className="no-tracking-info">No tracking info found.</div>;
  }
 
  return (
   
    <div className="order-tracking-page">
      <div className="order-header">
        <h2 className="order-number">Order #{orderId}</h2>
        <h1 className="order-title-inline">Your Order is on its Way</h1>
      </div>
      <div className="order-content-row">
        {/* LEFT: Status Timeline */}
        <div className="status-container">
          <div className="order-status-header">
            {/* Order Placed */}
            <div className="status-date-block">
              <div className="status-label">Order Placed</div>
              <div className="status-date">
                {statuses[0]?.updatedAt
                  ? new Date(statuses[0].updatedAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A"}
              </div>
            </div>
            {/* Last Updated */}
            <div className="status-date-block" style={{ textAlign: "right" }}>
              <div className="status-label">Last Updated</div>
              <div className="status-date">
                {statuses
                  .filter((s) => s.updatedAt)
                  .map((s) =>
                    new Date(s.updatedAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  )
                  .slice(-1)[0] || "N/A"}
              </div>
            </div>
          </div>
 
          {/* Scrollable Timeline */}
          <div className="timeline-wrapper">
         
          <OrderStatusTimeline statuses={statuses} />
          </div>
         
          </div>
 
        {/* RIGHT: Order Summary */}
        <div className="summary-container">
          <div className="order-summary-title">Order Summary</div>
          <OrderSummary
            products={items}
            totalAmount={trackingDetails.totalAmount}
            shipping={{
              name: trackingDetails.name,
              addressLine1: trackingDetails.addressLine1,
              addressLine2: trackingDetails.addressLine2,
              city: trackingDetails.city,
              state: trackingDetails.state,
              zip: trackingDetails.zip,
              country: trackingDetails.country,
            }}
          />
        </div>
      </div>
    </div>
  );
};
 
export default OrderTracking;