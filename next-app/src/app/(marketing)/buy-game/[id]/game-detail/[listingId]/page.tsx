"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "../../../../../../../utils/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faCheckCircle,
  faPauseCircle,
  faMessage,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import PaymentHandler from "@/components/PaymentHandler";
import Confetti from "react-confetti";
import { Listing } from "@/common/interface";

const GameDetailPage = () => {
  const { listingId } = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!listingId) return;

    const fetchListing = async () => {
      try {
        const res = await axios.get(`/api/listing/${listingId}`);
        setListing(res.data);
      } catch (err) {
        console.error("Failed to fetch listing:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  if (loading)
    return <p className="text-center py-10 text-white">Loading...</p>;
  if (!listing)
    return <p className="text-red-500 text-center py-10">Listing not found.</p>;

  return (
    <div className="bg-gradient-to-br from-[#16181A] via-[#23272A] to-[#181C22] min-h-screen text-white px-5 py-12 relative">
      {/* Confetti on success */}
      {purchaseSuccess && <Confetti numberOfPieces={200} recycle={false} />}

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Panel: Seller & Actions */}
        <div className="bg-[#24282C] px-7 py-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg">
          {/* Left: Seller Info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="text-base font-bold flex items-center gap-2">
              Seller:&nbsp;
              <span className="text-green-300">
                {listing.seller?.name || "Unknown"}
              </span>
              {listing.seller?.status === "approved" && (
                <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 bg-green-600 text-white text-xs font-medium ml-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />{" "}
                  Verified
                </span>
              )}
              {listing.status === "active" ? (
                <>
                  <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 bg-green-700 text-white text-xs font-semibold ml-2">
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />{" "}
                    Active
                  </span>
                  <button className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-medium px-1 py-1 rounded-lg transition-all">
                    <FontAwesomeIcon icon={faMessage} /> Send Message
                  </button>
                  <button className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-1 py-1 rounded-lg transition-all">
                    <FontAwesomeIcon icon={faUser} /> Seller Profile
                  </button>
                </>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 bg-gray-700 text-gray-300 text-xs font-semibold ml-2">
                  <FontAwesomeIcon icon={faPauseCircle} className="mr-1" />{" "}
                  {listing.status}
                </span>
              )}
            </div>
          </div>

          {/* Right: Price & Payment */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:gap-4 gap-2 w-full sm:w-auto">
            <span className="text-2xl font-extrabold text-white tracking-tight">
              ₹{Number(listing.price).toFixed(2) ?? 0}
            </span>
            <PaymentHandler
              listing={listing}
              onSuccess={() => setPurchaseSuccess(true)}
            />
          </div>
        </div>

        {/* Game Images */}
        {listing.game && (
          <div>
            <h3 className="text-xl font-extrabold mb-3 text-green-300">
              Game Images
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {listing.game.primary_image && (
                <Image
                  src={listing.game.primary_image}
                  alt="Game Primary"
                  width={600}
                  height={400}
                  className="rounded-lg w-full object-cover shadow-lg hover:scale-105 transition-transform"
                />
              )}
              {listing.game.secondary_image && (
                <Image
                  src={listing.game.secondary_image}
                  alt="Game Secondary"
                  width={600}
                  height={400}
                  className="rounded-lg w-full object-cover shadow-lg hover:scale-105 transition-transform"
                />
              )}
            </div>
            {listing.game?.images?.length && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {listing.game.images.map((img: string, idx: number) => (
                  <Image
                    key={idx}
                    src={img}
                    alt={`Game Image ${idx + 1}`}
                    width={600}
                    height={400}
                    className="rounded-lg w-full object-cover shadow hover:scale-105 transition-transform"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Game & Listing Details */}
        <div>
          <h3 className="text-xl font-extrabold mb-5 text-yellow-300">
            Game & Listing Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {listing.fields?.map((field, idx: number) => (
              <div
                key={idx}
                className="bg-[#23272A] border border-[#36393E] hover:border-yellow-500 transition-shadow shadow-lg hover:shadow-yellow-200 p-6 rounded-xl flex items-center gap-5"
              >
                {field.icon ? (
                  <Image
                    src={field.icon}
                    alt={field.label}
                    width={32}
                    height={32}
                    className="rounded bg-[#111417] p-1 shadow"
                  />
                ) : (
                  <span className="text-yellow-400 text-2xl bg-[#1a1d20] p-2 rounded shadow flex items-center justify-center">
                    <FontAwesomeIcon icon={faStar} />
                  </span>
                )}
                <div>
                  <p className="text-xs text-gray-400 font-medium">
                    {field.label}
                  </p>
                  <p className="text-lg font-bold text-white">{field.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Extra Game Images */}
        {listing.game_images?.length && (
          <div>
            <h3 className="text-xl font-extrabold mb-3 text-purple-300">
              Extra Game Images
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {listing.game_images.map((img, idx) => (
                <Image
                  key={idx}
                  src={img}
                  alt={`Game Extra ${idx + 1}`}
                  width={600}
                  height={400}
                  className="rounded-lg w-full object-cover shadow hover:scale-105 transition-transform"
                />
              ))}
            </div>
          </div>
        )}

        {/* Purchase Success Card */}
        {purchaseSuccess && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-600 border-2 border-gray-400 rounded-xl p-6 shadow-xl flex flex-col items-center gap-3 animate-fadeIn">
            <h2 className="text-xl font-bold text-white">
              🎉 Purchase Successful!
            </h2>
            <p className="text-white text-center">
              Your order has been created and is awaiting delivery.
            </p>
            <button
              className="mt-2 px-4 py-2 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
              onClick={() => router.push("/buyer-dashboard/games-purchased")}
            >
              Go to My Purchases
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDetailPage;
