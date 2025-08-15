'use client';

import React, { useEffect, useState } from 'react';
import axios from '../../../../../../utils/axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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
      const res = await axios.get('/api/seller-store-games');
      setSellerData(res.data);
    } catch (error) {
      console.error('Error fetching seller data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <span className="animate-spin h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!sellerData) {
    return (
      <div className="text-center mt-10 text-gray-400 font-medium">
        No data found
      </div>
    );
  }

  const { seller, game_listings } = sellerData;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-900 min-h-screen">
      {/* Seller Info */}
      {seller && (
        <div className="bg-gray-800 shadow-lg rounded-2xl p-6 mb-8 border border-gray-700">
          <h1 className="text-3xl font-bold mb-3 text-white">{seller.store_name}</h1>
          <div className="text-gray-300 space-y-1">
            <p>Email: <span className="text-gray-100">{seller.email}</span></p>
            <p>Phone: <span className="text-gray-100">{seller.phone_number}</span></p>
            <p>Status:
              <span
                className={`ml-2 px-2 py-0.5 rounded text-sm font-semibold ${
                  seller.user_status === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 text-white'
                }`}
              >
                {seller.user_status}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Game Listings */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {game_listings?.map((listing) => (
          <div
            key={listing.listing_id}
            onClick={() => router.push(`/buy-game/1/game-detail/${listing.listing_id}`)}
            className="group bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl cursor-pointer transition-transform transform hover:-translate-y-2 hover:scale-[1.02] duration-300"
          >
            {/* Primary Game Image */}
            {listing.game?.primary_image ? (
              <div className="relative overflow-hidden">
                <Image
                  src={`http://localhost:8000/storage/${listing.game.primary_image}`}
                  alt={listing.game.name}
                  width={500}
                  height={300}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="w-full h-56 bg-gray-700 flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}

            <div className="p-5">
              <h2 className="text-xl font-bold text-white">{listing.game?.name || 'Unnamed Game'}</h2>
              <p className="text-gray-400 mt-1">
                Price:
                <span className="text-green-400 font-semibold ml-1">
                  ${listing.price}
                </span>
              </p>
              <p className="text-sm text-gray-500">Status: {listing.status}</p>

              {/* Game Fields */}
              <div className="mt-4 space-y-1">
                {listing.fields?.map((field) => (
                  <div key={field.field_id} className="flex items-center gap-2 text-gray-300">
                    {field.icon && (
                      <Image
                        src={`http://localhost:8000/storage/${field.icon}`}
                        alt={field.label}
                        width={20}
                        height={20}
                      />
                    )}
                    <span className="font-medium">{field.label}:</span>
                    <span className="text-gray-400">{field.value}</span>
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
