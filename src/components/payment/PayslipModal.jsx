import { useRef, useEffect, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Spinner from "../ui/Spinner";
import { fetchPaymentById } from "../../services/paymentService";

const PayslipModal = ({ paymentId, bookingData, onClose }) => {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const receiptRef = useRef(null);

  useEffect(() => {
    if (paymentId) {
      setLoading(true);
      fetchPaymentById(paymentId)
        .then((d) => setPayment(d.payment))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (bookingData) {
      // If we passed booking data directly (for summary payslip)
      setPayment({
        bookingId: bookingData,
        amount: bookingData.paidAmount,
        paidAt: bookingData.updatedAt || new Date(),
        razorpayPaymentId: bookingData.paymentId?._id || "SUMMARY",
        isSummary: true
      });
      setLoading(false);
    }
  }, [paymentId, bookingData]);

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    setDownloading(true);
    try {
      const element = receiptRef.current;
      const canvas = await html2canvas(element, {
        scale: 3, // Higher scale for clarity but we will resize it to fit
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      
      // Center the image on the page
      const xOffset = (pdfWidth - finalWidth) / 2;
      const yOffset = 10; // Small top margin

      pdf.addImage(imgData, "PNG", xOffset, yOffset, finalWidth, finalHeight);
      
      const fileName = `Payslip_${payment?.razorpayPaymentId || "Receipt"}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("PDF Generation error:", error);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-10 max-w-sm w-full text-center">
          <Spinner text="Generating payslip..." />
        </div>
      </div>
    );
  }

  if (!payment) return null;

  const booking = payment.bookingId;
  const lawn = booking?.lawnId;
  const user = booking?.userId;

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4A1D6E;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #2C1A3E;
        }
      `}</style>
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full my-8 relative animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors flex items-center gap-2 font-semibold text-sm"
        >
          <span>✕ Close</span>
        </button>

        {/* Modal Actions */}
        <div className="flex justify-between items-center p-3 border-b bg-gray-50 rounded-t-2xl">
          <h2 className="font-bold text-dark flex items-center gap-2 text-sm">
            <span className="text-lg">🧾</span> Payment Receipt
          </h2>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-all text-xs font-bold disabled:opacity-50 shadow-md"
          >
            {downloading ? "Generating..." : "⬇️ Download PDF"}
          </button>
        </div>

        {/* Receipt Container (Internal Scroll) */}
        <div className="p-4 bg-gray-100 rounded-b-2xl">
          <div 
            className="overflow-y-auto custom-scrollbar bg-white shadow-lg mx-auto"
            style={{ maxHeight: "75vh", width: "100%", maxWidth: "500px" }}
          >
            <div 
              ref={receiptRef}
              className="bg-white"
              style={{ width: "100%" }}
            >
              {/* The Actual UI (Matching Email Design) */}
              <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", width: "100%", backgroundColor: "#fff" }}>
                
                {/* Header */}
                <div style={{ background: "linear-gradient(135deg, #4A1D6E 0%, #2C1A3E 100%)", padding: "25px 20px", textAlign: "center", color: "#fff" }}>
                  <div style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "3px", letterSpacing: "1px" }}>💍 WeddingLawn</div>
                  <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", color: "#D4A843", fontWeight: "600" }}>Official Payment Receipt</div>
                </div>

                <div style={{ padding: "25px 25px" }}>
                  {/* Receipt Info */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "25px", borderBottom: "1px solid #f0f0f0", paddingBottom: "15px" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: "10px", color: "#999", textTransform: "uppercase", fontWeight: "bold" }}>Billed To</p>
                      <p style={{ margin: "3px 0 0", fontSize: "15px", color: "#333", fontWeight: "600" }}>{user?.name || "Customer"}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#666" }}>{user?.email}</p>
                    </div>
                    <div style={{ flex: 1, textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: "10px", color: "#999", textTransform: "uppercase", fontWeight: "bold" }}>Receipt No.</p>
                      <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#4A1D6E", fontFamily: "monospace", fontWeight: "bold" }}>
                        #{ (payment.razorpayPaymentId || "0").slice(-8).toUpperCase() }
                      </p>
                      <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#666" }}>
                        {new Date(payment.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div style={{ marginBottom: "20px" }}>
                    <h3 style={{ fontSize: "13px", color: "#4A1D6E", marginBottom: "10px", borderLeft: "3px solid #D4A843", paddingLeft: "8px", fontWeight: "bold" }}>Booking Summary</h3>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#f9f9f9" }}>
                          <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #eee", fontSize: "11px", color: "#777" }}>Description</th>
                          <th style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #eee", fontSize: "11px", color: "#777" }}>Event Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: "10px 12px", borderBottom: "1px solid #eee" }}>
                            <div style={{ fontWeight: "600", color: "#333", fontSize: "13px" }}>{lawn?.name || "Venue Reservation"}</div>
                            <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>Location: {lawn?.city}</div>
                          </td>
                          <td style={{ padding: "10px 12px", borderBottom: "1px solid #eee", textAlign: "right", fontSize: "12px", color: "#555" }}>
                            {new Date(booking?.eventDate).toDateString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Amounts */}
                  <div style={{ marginLeft: "auto", maxWidth: "240px", backgroundColor: "#fdfbf7", borderRadius: "8px", padding: "15px", border: "1px solid #f3e8d2" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "12px", color: "#666" }}>Total Amount</span>
                      <span style={{ fontSize: "12px", color: "#333", fontWeight: "600" }}>₹{booking?.totalAmount?.toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "12px", color: "#16A34A", fontWeight: "600" }}>{payment.isSummary ? "Total Paid" : "Amount Paid"}</span>
                      <span style={{ fontSize: "12px", color: "#16A34A", fontWeight: "600" }}>- ₹{payment.amount?.toLocaleString()}</span>
                    </div>
                    <div style={{ borderTop: "1px dashed #dcdde1", margin: "10px 0", paddingTop: "10px", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "13px", color: "#333", fontWeight: "bold" }}>Balance Due</span>
                      <span style={{ fontSize: "15px", color: (booking?.remainingAmount === 0 || (booking?.totalAmount - booking?.paidAmount === 0)) ? "#16A34A" : "#DC2626", fontWeight: "800" }}>
                        ₹{ (booking?.remainingAmount ?? (booking?.totalAmount - (booking?.paidAmount || 0)))?.toLocaleString() }
                      </span>
                    </div>
                  </div>

                  {/* Badge */}
                  <div style={{ marginTop: "30px", textAlign: "center" }}>
                     {(booking?.remainingAmount === 0 || (booking?.totalAmount - booking?.paidAmount === 0)) ? (
                      <div style={{ display: "inline-block", padding: "8px 20px", border: "2px solid #16A34A", color: "#16A34A", fontSize: "18px", fontWeight: "900", textTransform: "uppercase", borderRadius: "6px", transform: "rotate(-5deg)", opacity: 0.8, letterSpacing: "1px" }}>
                        Fully Paid
                      </div>
                    ) : (
                      <div style={{ display: "inline-block", padding: "8px 20px", border: "2px solid #D4A843", color: "#D4A843", fontSize: "16px", fontWeight: "900", textTransform: "uppercase", borderRadius: "6px", transform: "rotate(-3deg)", opacity: 0.8, letterSpacing: "1px" }}>
                        Partial
                      </div>
                    )}
                  </div>

                  {/* Footer Notes */}
                  <div style={{ marginTop: "30px", backgroundColor: "#f9f9f9", borderRadius: "6px", padding: "12px", fontSize: "10px", color: "#999", border: "1px solid #eee" }}>
                    <div style={{ marginBottom: "3px" }}><strong>Transaction ID:</strong> {payment.razorpayPaymentId}</div>
                    <div><strong>Gateway:</strong> Razorpay Secure · WeddingLawn</div>
                    <div style={{ marginTop: "8px", fontStyle: "italic" }}>Note: This is a system-generated receipt.</div>
                  </div>
                </div>

                {/* PDF Footer */}
                <div style={{ backgroundColor: "#f5f5f5", padding: "15px 20px", textAlign: "center", borderTop: "1px solid #e0e0e0" }}>
                  <p style={{ margin: 0, fontSize: "9px", color: "#aaa" }}>
                    © {new Date().getFullYear()} WeddingLawn Platform by Abhijit Nikam
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Modal Info Footer */}
        <div className="p-4 bg-purple-50 text-center rounded-b-2xl border-t">
          <p className="text-xs text-purple-700 font-medium italic">
            "A copy of this receipt has also been sent to your registered email address."
          </p>
        </div>
      </div>
    </div>
  );
};

export default PayslipModal;
