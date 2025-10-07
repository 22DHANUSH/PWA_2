import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, message } from "antd";
import { CreditCardOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dropin from "braintree-web-drop-in";
import {
  getBraintreeClientToken,
  processBraintreePayment,
  createPayment,
} from "../Payment/payment.api";
import { clearCartByUser } from "../Cart/cart.api.js";
import { updateOrder } from "../Orders/order.api.js";
import { useCart } from "../Cart/CartContext";

export default function BraintreePayment({
  amount,
  firstName,
  emailId,
  orderId,
  userId,
  address,
}) {
  const [clientToken, setClientToken] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(true);
  const dropinContainerRef = useRef(null);
  const instanceRef = useRef(null);
  const navigate = useNavigate();
  const { refreshCartCount } = useCart();

  useEffect(() => {
    getBraintreeClientToken()
      .then((res) => setClientToken(res.data.clientToken))
      .catch(() => message.error("Failed to fetch Braintree token"));
  }, []);

  useEffect(() => {
    if (!isModalVisible || !clientToken || !dropinContainerRef.current) return;

    dropin.create(
      {
        authorization: clientToken,
        container: dropinContainerRef.current,
        paymentOptionPriority: ["paypal", "card"],
      },
      (err, instance) => {
        if (err) {
          console.error("Drop-in error:", err);
          message.error("Failed to load Braintree UI");
          return;
        }
        instanceRef.current = instance;
      }
    );

    return () => {
      instanceRef.current?.teardown().catch(() => {});
      instanceRef.current = null;
    };
  }, [clientToken, isModalVisible]);

  const handleBraintreeSubmit = () => {
    if (!instanceRef.current) {
      message.error("Braintree UI not ready");
      return;
    }

    instanceRef.current.requestPaymentMethod(async (err, payload) => {
      if (err) {
        console.error("Payment method error:", err);
        message.error("Failed to get payment method");
        return;
      }

      const paymentData = {
        paymentMethodNonce: payload.nonce,
        amount: amount,
        firstName: firstName,
        email: emailId,
        BillingAddress: {
          streetAddress: address.addressLine1 + address.addressLine2,
          locality: address.city,
          postalCode: address.zip,
          countryCodeAlpha2: "IN",
        },
      };

      try {
        const result = await processBraintreePayment(paymentData);

        if (result.data.success) {
          message.success("Payment succeeded!");
        } else {
          message.error(`Payment failed: ${result.data.message || "Unknown"}`);
        }

        setIsModalVisible(false);

        // Create payment record
        try {
          const payData = {
            paymentMethod: "card",
            paymentStatus: result.data.success.toString(),
            paymentDate: new Date().toISOString(),
            amount: paymentData.amount,
            orderId: orderId,
            userId: userId,
            transactionId: result.data.transactionId,
            paymentGateway: "BrainTree",
          };

          const paymentRes = await createPayment(payData);
          console.log("Payment logged:", paymentRes);
        } catch (paymentErr) {
          console.error("Failed to create payment:", paymentErr);
          message.error("Could not save payment record. Contact support.");
          return; // stop execution
        }

        // Update order
        try {
          const orderUpdateData = {
            status: result.data.success
              ? "Payment Successful"
              : "Payment Failed",
            totalAmount: paymentData.amount,
            orderDate: new Date().toISOString(),
            userId: userId,
            addressId: address.addressId,
          };
          console.log("Order updated:", orderUpdateData);
          const updatedOrder = await updateOrder(orderId, orderUpdateData);
          console.log("Order updated:", updatedOrder);
        } catch (orderErr) {
          console.error("Failed to update order:", orderErr);
          message.error(
            result.data.success
              ? "Payment succeeded, but order status could not be updated."
              : "Payment failed, and order status could not be updated."
          );
        }

        // Clear cart
        try {
          await clearCartByUser(userId);
          await refreshCartCount();
        } catch (cartErr) {
          console.error("Failed to clear cart:", cartErr);
          message.warning("Cart was not cleared automatically.");
        }

        // Navigate after everything
        navigate(`/order-tracking/${orderId}`);
      } catch (err) {
        console.error("Transaction error:", err);
        message.error("Payment processing error. Please try again.");
      }
    });
  };

  return (
    <Modal
      title="Braintree Payment"
      open={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      footer={[
        <Button key="cancel" onClick={() => setIsModalVisible(false)}>
          Cancel Payment
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<CreditCardOutlined />}
          onClick={handleBraintreeSubmit}
        >
          Pay ${amount}
        </Button>,
      ]}
      centered
    >
      <div ref={dropinContainerRef} style={{ minHeight: "200px" }} />
    </Modal>
  );
}
