import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Product, ProfileData } from '../types';
import { motion } from 'motion/react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CheckoutProps {
  products: { product: Product; quantity: number }[];
  profile: ProfileData;
  onBack: () => void;
  onPlaceOrder: () => void;
}

export function Checkout({ products, profile, onBack, onPlaceOrder }: CheckoutProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const total = products.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const address = profile.buyerProfile?.address;

  const handlePlaceOrder = async () => {
    if (!address) return;
    setIsProcessing(true);
    setErrorMsg("");
    
    try {
      const amountPaise = Math.max(Math.round(total * 100), 100);
      
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountPaise, currency: "INR" })
      });
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Backend API is not available. If deployed on Vercel, ensure the API routes are configured correctly.");
      }
      
      const order = await res.json();
      if (!res.ok) throw new Error(order.error || "Failed to create order");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Remix Market",
        description: "Order Checkout",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response)
            });
            
            const verifyContentType = verifyRes.headers.get("content-type");
            if (!verifyContentType || !verifyContentType.includes("application/json")) {
              throw new Error("Backend verification API is not available.");
            }
            
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setIsSuccess(true);
              setTimeout(() => {
                onPlaceOrder();
              }, 2000);
            } else {
              setErrorMsg(verifyData.error || "Payment verification failed");
              setIsProcessing(false);
            }
          } catch (e: any) {
            setErrorMsg(e.message || "Payment verification failed");
            setIsProcessing(false);
          }
        },
        prefill: {
          name: profile.name,
        },
        theme: {
          color: "#111827"
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        setErrorMsg(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (error: any) {
      setErrorMsg(error.message || "Something went wrong");
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6"
        >
          <CheckCircle className="w-12 h-12" />
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          Thank you for your purchase. You will receive an email confirmation shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Delivery Address</h2>
            {address ? (
              <div className="text-gray-600">
                <p className="font-medium text-gray-900">{profile.name}</p>
                <p>{address.buildingNameOrNo}, {address.area1}</p>
                {address.area2 && <p>{address.area2}</p>}
                {address.landmark && <p>Near {address.landmark}</p>}
                <p>{address.city}, {address.state} - {address.pincode}</p>
                <p>{address.country}</p>
              </div>
            ) : (
              <div className="text-yellow-600 bg-yellow-50 p-4 rounded-xl">
                Please update your profile with a delivery address before placing an order.
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {products.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                    {item.product.images?.[0] && (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 line-clamp-1">{item.product.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="font-medium text-gray-900">
                    ₹{(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Items total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery fee</span>
                <span>₹0.00</span>
              </div>
              <div className="h-px bg-gray-100 my-4" />
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl flex gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            <button 
              onClick={handlePlaceOrder}
              disabled={!address || isProcessing}
              className="w-full bg-gray-900 text-white font-bold py-4 px-6 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? "Processing..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
