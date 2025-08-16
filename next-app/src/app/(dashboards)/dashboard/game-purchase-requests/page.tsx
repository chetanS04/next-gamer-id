"use client";

import React, { useEffect, useState } from "react";
import axios from "../../../../../utils/axios";
import { Order, TopupOrder } from "@/common/interface";
import Image from "next/image";

const basePath = process.env.NEXT_PUBLIC_UPLOAD_BASE;

export default function AdminOrdersDashboard() {
  const [gamerOrders, setGamerOrders] = useState<Order[]>([]);
  const [topupOrders, setTopupOrders] = useState<TopupOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"gamer" | "topup">("gamer");

  useEffect(() => {
    Promise.all([fetchGamerOrders(), fetchTopupOrders()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const fetchGamerOrders = async () => {
    try {
      const res = await axios.get("/api/orders/details");
      setGamerOrders(res.data.data || []);
    } catch (error) {
      console.error("Error fetching gamer orders:", error);
    }
  };

  const fetchTopupOrders = async () => {
    try {
      const res = await axios.get("/api/orders-detail-purchase");
      setTopupOrders(res.data.data || []);
    } catch (error) {
      console.error("Error fetching topup orders:", error);
    }
  };

  const handleAdminConfirm = async (orderId: number) => {
    if (
      !window.confirm("Are you sure you want to release payment to the seller?")
    )
      return;

    try {
      const res = await axios.post(`/api/orders/${orderId}/admin-confirm`);
      if (res.data.status) {
        alert("✅ Payment released successfully!");
        // Update UI instantly
        setGamerOrders((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? { ...order, admin_confirmations: true, status: "completed" }
              : order
          )
        );
      } else {
        alert(`⚠️ ${res.data.message}`);
      }
    } catch (error) {
      console.error("Error confirming order:", error);
      alert("Something went wrong!");
    }
  };

  if (loading) return <p className="text-center mt-4">Loading orders...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📦 Orders Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "gamer"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveTab("gamer")}
        >
          🎮 Gamer Purchases
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "topup"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveTab("topup")}
        >
          💰 Top-up Purchases
        </button>
      </div>

      {/* Gamer Purchases Table */}
      {activeTab === "gamer" && (
        <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="py-3 px-4 text-left">Order ID</th>
              <th className="py-3 px-4 text-left">Buyer</th>
              <th className="py-3 px-4 text-left">Seller</th>
              <th className="py-3 px-4 text-left">Game</th>
              <th className="py-3 px-4 text-left">Price</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Buyer Confirmed</th>
              <th className="py-3 px-4 text-left">Admin Confirmed</th>
              <th className="py-3 px-4 text-left">Actions</th>
              <th className="py-3 px-4 text-left">Game Images</th>
            </tr>
          </thead>
          <tbody>
            {gamerOrders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{order.id}</td>
                <td className="py-2 px-4">
                  <strong>{order.buyer?.name}</strong>
                  <br />
                  <span className="text-sm text-gray-500">
                    {order.buyer?.email}
                  </span>
                </td>
                <td className="py-2 px-4">
                  <strong>{order.seller?.name}</strong>
                  <br />
                  <span className="text-sm text-gray-500">
                    {order.seller?.email}
                  </span>
                </td>
                <td className="py-2 px-4">
                  Game ID: {order.game?.id}
                  <br />
                  Seller ID: {order.game?.seller_id}
                </td>
                <td className="py-2 px-4">₹{order.amount}</td>
                <td className="py-2 px-4 capitalize">{order.status}</td>

                {/* Buyer Confirmed */}
                <td className="py-2 px-4">
                  {order.buyer_confirmations ? (
                    <span className="text-green-600 font-semibold">✅ Yes</span>
                  ) : (
                    <span className="text-red-600 font-semibold">❌ No</span>
                  )}
                </td>

                <td className="py-2 px-4">
                  {order.admin_confirmations ? (
                    <span className="text-green-600 font-semibold">✅ Yes</span>
                  ) : (
                    <span className="text-red-600 font-semibold">❌ No</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-2 px-4">
                  {order.buyer_confirmations && !order.admin_confirmations && (
                    <button
                      onClick={() => handleAdminConfirm(order.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Release Payment
                    </button>
                  )}
                </td>

                <td className="py-2 px-4 flex gap-2">
                  {[
                    order.game?.game_image1,
                    order.game?.game_image2,
                    order.game?.game_image3,
                  ]
                    .filter(Boolean)
                    .map((img, i) => (
                      <Image
                        key={i}
                        src={`${basePath}${img}`}
                        alt={""}
                        height={800}
                        width={800}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Top-up Purchases Table */}
      {activeTab === "topup" && (
        <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">User</th>
              <th className="py-3 px-4 text-left">Amount</th>
              <th className="py-3 px-4 text-left">Currency Amount</th>
              <th className="py-3 px-4 text-left">Player Id</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Description</th>
              <th className="py-3 px-4 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {topupOrders.map((topup) => (
              <tr key={topup.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{topup.id}</td>
                <td className="py-2 px-4">
                  <strong>{topup.user?.name}</strong>
                  <br />
                  <span className="text-sm text-gray-500">
                    {topup.user?.email}
                  </span>
                </td>
                <td className="py-2 px-4">${topup.transaction?.amount}</td>
                <td className="py-2 px-4">${topup.currency_amount}</td>
                <td className="py-2 px-4">{topup.player_id}</td>
                <td className="py-2 px-4 capitalize">
                  {topup.transaction?.status || topup.payment_status}
                </td>
                <td className="py-2 px-4">
                  {topup.transaction?.description || "-"}
                </td>
                <td className="py-2 px-4">
                  {new Date(topup.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
