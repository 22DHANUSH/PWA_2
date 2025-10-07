import { message } from "antd";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createPayment,
} from "../Payment/payment.api";
import { clearCartByUser } from "../Cart/cart.api.js";
import { updateOrder } from "../Orders/order.api.js";
import { useCart } from "../Cart/CartContext";

const checkout_url = import.meta.env.VITE_RAZOR_CHECKOUT_URL;

export async function handleRazorpayPayment({
  amount,
  userId,
  orderId,
  userName,
  phoneNumber,
  emailId,
  address,
  navigate,
}) {
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = checkout_url;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const isScriptLoaded = await loadRazorpayScript();
  if (!isScriptLoaded) {
    message.error("Razorpay SDK failed to load. Please try again.");
    return;
  }

  try {
    const response = await createRazorpayOrder(amount);
    const {
      orderAmount,
      currency,
      key,
      orderId: razorpayOrderId,
    } = response.data;

    const verifyPayment = async ({
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    }) => {
      try {
        const verifyData = await verifyRazorpayPayment({
          PaymentId: razorpay_payment_id,
          OrderId: razorpay_order_id,
          Signature: razorpay_signature,
        });

        try {
          const payData = {
            paymentMethod: verifyData.data.paymentMethod,
            paymentStatus: verifyData.data.success.toString(),
            paymentDate: new Date().toISOString(),
            amount: orderAmount / 100,
            orderId,
            userId,
            transactionId: verifyData.data.transactionId,
            paymentGateway: "Razorpay",
          };
          await createPayment(payData);
          console.log("Payment logged:", payData);
        } catch (paymentErr) {
          console.error("Failed to create payment record:", paymentErr);
          message.error("Could not save payment record. Contact support.");
          return;
        }

        // 2️⃣ Update order
        try {
          const orderUpdateData = {
            status: "Payment Successful",
            totalAmount: orderAmount / 100,
            userId: userId,
            orderDate: new Date().toISOString(),

            addressId: address.addressId,
          };

          const updatedOrder = await updateOrder(orderId, orderUpdateData);
          console.log("Order updated:", updatedOrder);
        } catch (orderErr) {
          console.error("Failed to update order:", orderErr);
          message.error(
            verifyData.data.success
              ? "Payment succeeded, but order status could not be updated."
              : "Payment failed, and order status could not be updated."
          );
        }
        const { refreshCartCount } = useCart();
        // 3️⃣ Clear cart
        try {
          await clearCartByUser(userId);
          await refreshCartCount();
        } catch (cartErr) {
          console.error("Failed to clear cart:", cartErr);
          message.warning("Cart was not cleared automatically.");
        }

        // 4️⃣ Show messages & navigate
        if (verifyData.data.success) {
          message.success(verifyData.data.message);
        } else {
          message.error(verifyData.data.message || "Payment failed.");
        }

        navigate(`/order-tracking/${orderId}`);
      } catch (err) {
        console.error("Verification error:", err);
        message.error("Payment verification failed. Please contact support.");
      }
    };

    const options = {
      key,
      amount: orderAmount,
      currency,
      name: "Columbia Sportswear",
      description: "Order Payment",
      order_id: razorpayOrderId,
      handler: async (response) => {
        await verifyPayment(response);
      },
      prefill: {
        name: userName,
        email: emailId,
        contact: phoneNumber,
      },
      theme: {
        color: "#528FF0",
      },
    };

    const razorpayInstance = new window.Razorpay(options);

    razorpayInstance.on("payment.failed", async (response) => {
      const { payment_id, order_id } = response.error.metadata;
      await verifyPayment({
        razorpay_payment_id: payment_id,
        razorpay_order_id: order_id,
        razorpay_signature: null,
      });
    });

    razorpayInstance.open();
  } catch (error) {
    console.error("Payment error:", error);
    message.error("Unable to initiate payment.");
  }
}
