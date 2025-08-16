"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "../../../../utils/axios";

const basePath = process.env.NEXT_PUBLIC_UPLOAD_BASE;

// ---------- Interfaces ----------
interface Seller {
  store_name: string;
  user_status: string;
  email: string;
  phone_number: string;
}

interface Game {
  name: string;
  primary_image?: string;
}

interface Field {
  field_id: number;
  label: string;
  value: string;
  icon?: string | null;
}

interface Listing {
  listing_id: number;
  game?: Game;
  price: number;
  status: string;
  fields: Field[];
}

interface SellerResponse {
  status: boolean;
  seller: Seller;
  game_listings: Listing[];
}

export default function SellerStoreGamesPage() {
  const [sellerData, setSellerData] = useState<SellerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getSellerDetail();
  }, []);

  const getSellerDetail = async () => {
    try {
      const res = await axios.get("/api/seller-store-games");
      setSellerData(res.data);
    } catch (error) {
      console.error("Error fetching seller data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[rgb(28,28,28)]">
        <span className="animate-spin h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!sellerData) {
    return (
      <div className="text-center mt-10 text-gray-400 font-medium bg-[rgb(28,28,28)] min-h-screen flex items-center justify-center">
        No data found
      </div>
    );
  }

  const { seller, game_listings } = sellerData;

  return (
    <div className="max-w-7xl mx-auto min-h-screen px-6 py-10">
      {/* Seller Info */}
      {seller && (
        <div className=" backdrop-blur-sm shadow-xl rounded-2xl p-6 mb-10 border bg-[rgb(28,28,28)]">
          <h1 className="text-3xl font-bold mb-4 text-white">
            {seller.store_name}
          </h1>
          <div className="text-gray-300 space-y-2">
            <p>
              Email: <span className="text-gray-100">{seller.email}</span>
            </p>
            <p>
              Phone:{" "}
              <span className="text-gray-100">{seller.phone_number}</span>
            </p>
            <p>
              Status:
              <span
                className={`ml-2 px-2 py-0.5 rounded text-sm font-semibold ${
                  seller.user_status === "active"
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                {seller.user_status}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Game Listings */}
      <div className="space-y-6">
        {game_listings?.map((listing) => (
          <div
            key={listing.listing_id}
            onClick={() =>
              router.push(`/buy-game/1/game-detail/${listing.listing_id}`)
            }
            className="group flex flex-col md:flex-row bg-[rgb(28,28,28)] border border-gray-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl cursor-pointer transition-transform transform hover:-translate-y-1 hover:scale-[1.01] duration-300"
          >
            {/* Image Section */}
            <div className="md:w-1/8 relative">
              {listing.game?.primary_image ? (
                <Image
                  src={`${basePath}${listing.game.primary_image}`}
                  alt={listing.game.name}
                  width={500}
                  height={300}
                  className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-48 bg-gray-800 flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="flex-1 p-5 flex flex-col justify-between">
              {/* Title and Price */}
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {listing.game?.name || "Unnamed Game"}
                </h2>
                <p className="text-gray-400 mt-1">
                  Price:
                  <span className="text-green-400 font-semibold ml-1">
                    ${listing.price}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Status: {listing.status}
                </p>
              </div>

              {/* Fields */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {listing.fields?.map((field) => (
                  <div
                    key={field.field_id}
                    className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-700 transition"
                  >
                    {field.icon && (
                      <Image
                        src={`${basePath}${field.icon}`}
                        alt={field.label}
                        width={20}
                        height={20}
                        className="rounded"
                      />
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-400">
                        {field.label}
                      </span>
                      <span className="text-white font-medium">
                        {field.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
