"use client";

import React, { useEffect, useState } from "react";
import axios from "../../../../../../utils/axios";
import { Listing } from "@/common/interface";
import Image from "next/image";

const basePath = process.env.NEXT_PUBLIC_UPLOAD_BASE;

export default function Page() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch buyer's purchased listings
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await axios.get("/api/buyer-games-listings");
        if (res.data.status) {
          setListings(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  // Buyer confirm API call
  const handleBuyerConfirm = async (orderId: number) => {
    try {
      const res = await axios.post(`/api/orders/${orderId}/buyer-confirm`);
      if (res.data.status) {
        // Update local state instantly
        setListings((prev) =>
          prev.map((listing) =>
            listing.order?.id === orderId
              ? {
                  ...listing,
                  order: {
                    ...listing.order,
                    status: "buyer_confirmed",
                    buyer_confirmations: true,
                  },
                }
              : listing
          )
        );
      }
    } catch (error) {
      console.error("Error confirming order:", error);
    }
  };

  if (loading)
    return <p className="p-4 text-center text-gray-500">Loading...</p>;

  if (listings.length === 0)
    return <p className="p-4 text-center">No listings found.</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">
        My Purchased Game Listings
      </h1>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <div
            key={listing.transaction_id}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 overflow-hidden border border-gray-200"
          >
            {/* Transaction Info */}
            <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
              <h2 className="text-lg font-semibold text-green-700 mb-3">
                Transaction Info
              </h2>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                <span>
                  Transaction ID:{" "}
                  <span className="font-medium">{listing.transaction_id}</span>
                </span>
                <span>
                  Type: <span className="font-medium">{listing.type}</span>
                </span>
                <span>
                  Amount: <span className="font-medium">₹{listing.amount}</span>
                </span>
                <span>
                  Created At:{" "}
                  <span className="font-medium">
                    {new Date(listing.created_at).toLocaleString()}
                  </span>
                </span>
              </div>
            </div>

            {/* Order Info */}
            {listing.order && (
              <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <h2 className="text-lg font-semibold text-blue-700 mb-3">
                  Order Details
                </h2>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                  <span>
                    Order ID:{" "}
                    <span className="font-medium">{listing.order.id ?? 0}</span>
                  </span>
                  <span>
                    Buyer Confirmed:{" "}
                    <span className="font-medium">
                      {listing.order.buyer_confirmation ? "✅ Yes" : "❌ No"}
                    </span>
                  </span>
                  <span>
                    Seller Confirmed:{" "}
                    <span className="font-medium">
                      {listing.order.seller_confirmation ? "✅ Yes" : "❌ No"}
                    </span>
                  </span>
                  <span>
                    Order Amount:{" "}
                    <span className="font-medium">₹{listing.order.price}</span>
                  </span>
                  <span>
                    Status:{" "}
                    <span className="font-medium">{listing.order.status}</span>
                  </span>
                </div>

                {!listing.order.buyer_confirmation && (
                  <button
                    // onClick={() => handleBuyerConfirm(listing.order?.id!)}
                    onClick={() => {
                      if (listing.order) {
                        handleBuyerConfirm(listing.order.id);
                      }
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                  >
                    Confirm as Buyer
                  </button>
                )}
              </div>
            )}

            {/* Game Info */}
            {listing.order?.game && (
              <div className="p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-purple-700 mb-3">
                  Game Info
                </h2>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  {listing.order.game.primary_image && (
                    <Image
                      src={`${basePath}${listing.order.game.primary_image}`}
                      alt={""}
                      height={800}
                      width={800}
                      className="w-32 h-32 object-cover rounded-xl border border-gray-300"
                    />
                  )}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                    <span>
                      Game ID:{" "}
                      <span className="font-medium">
                        {listing.order.game.id}
                      </span>
                    </span>
                    <span>
                      Game Name:{" "}
                      <span className="font-medium">
                        {listing.order.game.name}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Game Fields */}
                {Array.isArray(listing.order.game.fields) &&
                  listing.order.game.fields.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-md font-semibold text-gray-800 mb-2">
                        Game Fields
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {listing.order.game.fields.map((field, idx: number) => (
                          <div
                            key={idx}
                            className="bg-gray-100 p-2 rounded-lg text-sm text-gray-700 flex flex-col items-start"
                          >
                            <span className="font-semibold">{field.label}</span>
                            <span>{field.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Seller Info */}
            {listing.order?.seller && (
              <div className="p-5 bg-yellow-50">
                <h2 className="text-lg font-semibold text-yellow-700 mb-3">
                  Seller Info
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                  <span>
                    Name:{" "}
                    <span className="font-medium">
                      {listing.order.seller.name}
                    </span>
                  </span>
                  <span>
                    Email:{" "}
                    <span className="font-medium">
                      {listing.order.seller.email}
                    </span>
                  </span>
                  <span>
                    Status:{" "}
                    <span className="font-medium">
                      {listing.order.seller.status}
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* Currency Purchase Info */}
            {listing.currencyPurchase && (
              <div className="p-5 bg-indigo-50">
                <h2 className="text-lg font-semibold text-indigo-700 mb-3">
                  Currency Purchase
                </h2>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                  <span>
                    Player ID:{" "}
                    <span className="font-medium">
                      {listing.currencyPurchase.player_id}
                    </span>
                  </span>
                  <span>
                    Amount:{" "}
                    <span className="font-medium">
                      {listing.currencyPurchase.currency_amount}
                    </span>
                  </span>
                  <span>
                    Payment Status:{" "}
                    <span className="font-medium">
                      {listing.currencyPurchase.payment_status}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
