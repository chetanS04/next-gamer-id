"use client";

import React, { useState } from "react";
import Script from "next/script";
import axios from "../../utils/axios";
import { RazorpayResponse } from "@/common/interface";

interface WalletBalanceProps {
  balance: number;
  onBalanceUpdate?: (newBalance: number) => void;
}

export default function WalletBalance({
  balance,
  onBalanceUpdate,
}: WalletBalanceProps) {
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [amount, setAmount] = useState<number | "">("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchBalance = async () => {
    try {
      const { data } = await axios.get("/api/wallet/balance");
      onBalanceUpdate?.(data.balance);
    } catch (err) {
      console.error("Failed to fetch balance", err);
    }
  };

  const openPayment = async (amountToAdd: number) => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const { data: orderData } = await axios.post("/api/razorpay/order", {
        amount: amountToAdd,
      });

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Add Funds to Wallet",
        description: `Adding ₹${amountToAdd.toFixed(2)} to wallet`,
        order_id: orderData.order_id,
        handler: async function (response: RazorpayResponse) {
          try {
            await axios.post("/api/wallet/add-funds", {
              amount: amountToAdd,
              payment_id: response.razorpay_payment_id,
            });

            setSuccessMessage(`₹${amountToAdd.toFixed(2)} added successfully!`);
            fetchBalance();
            setShowInput(false);
            setAmount("");

            // Hide success message after 3 seconds
            setTimeout(() => {
              setSuccessMessage("");
            }, 3000);
          } catch (err) {
            setError(
              "Payment succeeded but updating wallet failed. Contact support."
            );
            console.error(err);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        theme: { color: "#4B5563" }, // Gray color
      };

      // // @ts-ignore
      // const razorpay = new window.Razorpay(options);

      // @ts-expect-error - Razorpay is not in the TypeScript type definitions for `window`
const razorpay = new window.Razorpay(options);


      razorpay.open();
    } catch (err) {
      console.error(err);
      setError("Failed to initiate payment. Please try again.");
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (amount === "" || amount <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    openPayment(amount as number);
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
      <li className="bg-[rgb(28,28,28)] rounded-2xl shadow-2xl p-10 max-w-2xl mx-auto border-4 border-[rgb(28,28,28)] relative">
        {/* Secure & Provider Banner */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full font-bold text-sm">
              <svg width="20" height="20" fill="none" className="inline">
                <circle cx="10" cy="10" r="9" stroke="white" strokeWidth="2" />
                <path
                  d="M8 12l-3-3 1.41-1.42L8 9.17l5.59-5.59L15 5l-7 7z"
                  fill="white"
                />
              </svg>
              Secure Payment
            </span>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full font-bold text-sm">
              Powered by Razorpay
            </span>
          </div>
          <span className="font-mono text-2xl text-white tracking-wide">
            ₹{Number(balance).toFixed(2)}
          </span>
        </div>

        {/* Compliance and Features */}
        <div className="mb-5 text-gray-300 text-sm flex flex-col gap-1">
          <span>100% PCI DSS Level 1 Secure Gateway</span>
          <span>Encrypted End-to-End | Fraud Detection Enabled</span>
          <span>Multiple Payment Modes: Card, UPI, Wallets, Netbanking</span>
        </div>

        {/* Feedback Messages */}
        {successMessage && (
          <div className="mb-4 p-4 rounded-md bg-green-600/20 text-green-500 text-base border border-green-600 font-semibold">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 rounded-md bg-red-600/20 text-red-500 text-base border border-red-600 font-semibold">
            {error}
          </div>
        )}

        {/* Main Actions */}
        {!showInput && (
          <button
            type="button"
            className="w-full bg-blue-700 text-white py-4 rounded-xl text-xl font-bold hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-400 transition"
            onClick={() => {
              setShowInput(true);
              setError("");
              setSuccessMessage("");
              setAmount("");
            }}
            disabled={loading}
          >
            Add Funds Securely
          </button>
        )}

        {showInput && (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
            <label htmlFor="amount" className="font-bold text-white text-lg">
              Enter Amount (₹)
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="1"
              placeholder="e.g. 500"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value === "" ? "" : Number(e.target.value))
              }
              disabled={loading}
              className="border-2 border-gray-700 rounded-xl px-5 py-3 text-xl bg-gray-900 text-white focus:outline-none focus:ring-4 focus:ring-blue-500"
              required
            />

            <div className="flex gap-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-600 text-white py-4 rounded-xl text-xl font-bold hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-400 transition"
              >
                {loading ? "Processing..." : "Pay with Razorpay"}
              </button>
              <button
                type="button"
                disabled={loading}
                className="flex-1 bg-gray-600 text-white py-4 rounded-xl text-xl hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-400 transition"
                onClick={() => {
                  setShowInput(false);
                  setError("");
                  setSuccessMessage("");
                  setAmount("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </li>
    </>
  );
}
