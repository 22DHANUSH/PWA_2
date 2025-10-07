import { payment_api, payment_api_api } from "../../app/payment.axios";

// Razorpay APIs
export const createRazorpayOrder = async (amount) => {
  try {
    const response = await payment_api.post("CreateOrderUSD", {
      Amount: amount,
    });
    return response;
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw error;
  }
};

export const verifyRazorpayPayment = (paymentDetails) =>
  payment_api.post("VerifyPayment", paymentDetails);

// Braintree APIs (override baseURL)
export const getBraintreeClientToken = () =>
  payment_api.get("GenerateClientToken");

export const processBraintreePayment = (paymentData) =>
  payment_api.post("ProcessPayment", paymentData);

export async function createPayment({
  paymentMethod,
  paymentStatus,
  paymentDate,
  amount,
  orderId,
  userId,
  transactionId,
  paymentGateway,
}) {
  const res = await payment_api_api.post("payments", {
    paymentMethod,
    paymentStatus,
    paymentDate,
    amount,
    orderId,
    userId,
    transactionId,
    paymentGateway,
  });
  return res.data;
}

// export const getPaymentDetails = () =>
//   payment_api_api.get("/payments");
