import api from "./api";

// Create a Razorpay order for a confirmed booking
export const createRazorpayOrder = (bookingId) =>
  api.post("/payment/create-order", { bookingId }).then((r) => r.data);

// Verify payment signature after Razorpay checkout completes
export const verifyPayment = (data) =>
  api.post("/payment/verify", data).then((r) => r.data);

// Get payment history for current user / owner
export const fetchPaymentHistory = () =>
  api.get("/payment/history").then((r) => r.data);

// Get single payment detail
export const fetchPaymentById = (paymentId) =>
  api.get(`/payment/${paymentId}`).then((r) => r.data);

/**
 * Load the Razorpay checkout script dynamically.
 * Returns a promise that resolves when the script is ready.
 */
export const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script  = document.createElement("script");
    script.src    = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/**
 * Open Razorpay checkout modal.
 *
 * @param {object} options
 *   order       — Razorpay order object { id, amount, currency }
 *   keyId       — Razorpay Key ID
 *   bookingInfo — { id, lawnName, eventDate, amount }
 *   user        — { name, email, phone }
 *   onSuccess   — callback(paymentData)
 *   onFailure   — callback(error)
 */
export const openRazorpayCheckout = ({
  order,
  keyId,
  bookingInfo,
  user,
  onSuccess,
  onFailure,
}) => {
  const options = {
    key:         keyId,
    amount:      order.amount,      // paise
    currency:    order.currency,
    name:        "WeddingLawn 💍",
    description: `Booking for ${bookingInfo.lawnName}`,
    order_id:    order.id,
    prefill: {
      name:    user.name,
      email:   user.email,
      contact: user.phone || "",
    },
    theme: { color: "#7B2D8B" },
    modal: {
      ondismiss: () => {
        onFailure?.({ message: "Payment cancelled by user" });
      },
    },
    handler: (response) => {
      // Called by Razorpay after successful payment
      onSuccess?.({
        bookingId:         bookingInfo.id,
        razorpayOrderId:   response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      });
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on("payment.failed", (response) => {
    onFailure?.({ message: response.error.description });
  });
  rzp.open();
};