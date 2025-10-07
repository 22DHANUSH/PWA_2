import { Timeline, Typography } from "antd";
import {
  ShoppingCartOutlined,
  DropboxOutlined,
  CarOutlined,
  HomeOutlined,
} from "@ant-design/icons";
 
const { Text } = Typography;
 
const statusIconMap = {
  "Order Placed": <ShoppingCartOutlined />,
  Shipped: <DropboxOutlined />,
  "Out for Delivery": <CarOutlined />,
  Delivered: <HomeOutlined />,
};
 
const statusDescriptions = {
  "Order Placed": "We've received your order and are getting it ready.",
  Shipped: "Your order has been shipped and is on its way.",
  "Out for Delivery": "Your package is now with the delivery courier.",
  Delivered: "Awaiting confirmation of delivery.",
};
 
const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleString("en-IN", { month: "short" });
  const year = date.getFullYear();
  const time = date.toLocaleString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).toUpperCase();
  return `${day} ${month}, ${year}, ${time}`;
};
 
const OrderStatusTimeline = ({ statuses }) => {
  const timelineItems = statuses.map((step) => {
    const isCompleted = !!step.updatedAt;
 
    return {
      dot: (
        <div
          className={`timeline-icon ${
            isCompleted ? "active-icon" : "inactive-icon"
          }`}
        >
          {statusIconMap[step.status]}
        </div>
      ),
      children: (
        <div className="timeline-content">
          <Text strong={isCompleted} className={isCompleted ? "" : "timeline-upcoming"}>
            {step.status}
          </Text>
          <div className={`timeline-desc ${isCompleted ? "" : "timeline-upcoming"}`}>
            {statusDescriptions[step.status] || "Status updated"}
          </div>
          <div className={`timeline-date ${isCompleted ? "" : "timeline-upcoming"}`}>
            {step.updatedAt ? formatDateTime(step.updatedAt) : ""}
          </div>
        </div>
      ),
    };
  });
 
  return (
    <div style={{ paddingTop: 12 }}>
      <Timeline className="order-timeline" items={timelineItems} mode="left" />
    </div>
  );
};
 
 
export default OrderStatusTimeline;