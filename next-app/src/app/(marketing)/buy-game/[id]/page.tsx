"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "../../../../../utils/axios";
import { FaStar } from "react-icons/fa";
import Image from "next/image";
import { Listing } from "@/common/interface";

const basePath = process.env.NEXT_PUBLIC_UPLOAD_BASE;

const GameListingsPage = () => {
  const { id } = useParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchListings = async () => {
      try {
        const res = await axios.get(`/api/games-listing/${id}`);
        setListings(res.data);
        console.log(res.data);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [id]);

  if (loading) {
    return <p className="text-center py-10 text-white">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-[#1A1D20] text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-12 text-center">
          🎮 Game Listings
        </h1>

        {listings.length === 0 ? (
          <p className="text-center text-gray-400">
            No listings found for this game.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/buy-game/${id}/game-detail/${listing.id}`}
                className="bg-[#212529] rounded-2xl shadow-lg border border-gray-700 overflow-hidden flex flex-col transition-transform hover:scale-[1.01] cursor-pointer"
              >
                {/* Header */}
                <div className="bg-[#2B3035] px-6 py-4 flex justify-between items-center">
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    {listing.seller?.status === "approved" && (
                      <span className="px-2 py-0.5 text-xs bg-green-600 text-white rounded-full flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-10.707a1 1 0 00-1.414-1.414L9 9.586 7.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Verified
                      </span>
                    )}
                    <span>Seller: {listing.seller?.name || "Unknown"}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xl font-bold text-green-400">
                      ₹{listing.price}
                    </span>
                    <span
                      className={`text-xs px-3 py-1 rounded-full uppercase font-medium ${
                        listing.status === "active"
                          ? "bg-green-700 text-white"
                          : "bg-gray-600 text-gray-300"
                      }`}
                    >
                      {listing.status}
                    </span>
                  </div>
                </div>

                {/* Fields */}
                <div className="p-6 flex flex-col space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {listing.fields?.map((field, idx: number) => {
                      const isLong =
                        typeof field.value === "string" &&
                        field.value.length > 20;

                      return (
                        <div
                          key={idx}
                          className={`flex items-start space-x-2 bg-[#2C3034] px-4 py-3 rounded-md text-sm ${
                            isLong ? "text-base py-4" : ""
                          }`}
                        >
                          {field.icon ? (
                            <Image
                              height={600}
                              width={600}
                              src={`${basePath}${field.icon}`}
                              alt={field.label}
                              className="w-5 h-5 object-contain mt-1"
                            />
                          ) : (
                            <FaStar className="text-yellow-400 w-5 h-5 mt-1" />
                          )}
                          <span className="text-gray-300 leading-relaxed">
                            <span className="text-white font-medium">
                              {field.label}:
                            </span>{" "}
                            {field.value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameListingsPage;
