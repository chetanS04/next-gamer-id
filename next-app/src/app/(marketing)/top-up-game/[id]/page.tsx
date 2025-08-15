"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import axios from "../../../../../utils/axios";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { AxiosError } from "axios";
import { Game, RazorpayResponse, TopupOption } from "@/common/interface";

type FormData = {
  playerId: string;
};

// ----------- Validation Schema ----------
const schema = yup
  .object({
    playerId: yup.string().trim().required("Player ID is required"),
  })
  .required();

export default function Page() {
  const { id } = useParams();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [selectedOption, setSelectedOption] = useState<TopupOption | null>(
    null
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  // Load game
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axios
      .get(`/api/games/${id}/detail`)
      .then((res) => {
        setGame(res.data);
      })
      .catch(() => setGame(null))
      .finally(() => setLoading(false));
  }, [id]);

  const onSubmit = async (data: FormData) => {
    if (!selectedOption) {
      setMessage({ type: "error", text: "Please select a topup package." });
      return;
    }

    try {
      const price = Number(selectedOption.price);
      const playerId = data.playerId.trim();

      const { data: wallet } = await axios.get("/api/wallet");
      const walletBalance = Number(wallet.balance);

      if (walletBalance >= price) {
        await axios.post("/api/wallet/pay", {
          amount: price,
          description: `Topup purchase for ${game?.name}`,
          player_id: Number(playerId),
          currency_amount: selectedOption.currency_amount,
        });
        setMessage({ type: "success", text: "✅ Paid from wallet!" });
        return;
      }

      const payableAmount = price - walletBalance;
      if (payableAmount < 1) {
        setMessage({
          type: "error",
          text: "No amount left to pay. Please check your wallet or selection.",
        });
        return;
      }

      const { data: orderData } = await axios.post("/api/razorpay/order", {
        amount: payableAmount,
      });

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: game?.name || "Topup Purchase",
        description: `Topup purchase for player ${playerId}`,
        order_id: orderData.order_id,
        prefill: {
          name: "User",
          email: "user@example.com",
          contact: "9999999999",
        },
        handler: async function (response: RazorpayResponse) {
          const verifyRes = await axios.post("/api/razorpay/verify", {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            amount: orderData.amount / 100,
            player_id: Number(playerId),
            currency_amount: selectedOption.currency_amount,
          });

          if (verifyRes.data.success) {
            setMessage({
              type: "success",
              text: "Payment verified successfully!",
            });
          } else {
            setMessage({ type: "error", text: "Payment verification failed." });
          }
        },
        theme: {
          color: "rgb(25, 60, 184)",
        },
      };

      // // @ts-ignore
      // const razorpay = new window.Razorpay(options);


      // @ts-expect-error - Razorpay is not in the TypeScript type definitions for `window`
const razorpay = new window.Razorpay(options);


      razorpay.open();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setMessage({
        type: "error",
        text: "❌ Payment failed! " + (error?.message || ""),
      });
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );

  if (!game)
    return (
      <div className="flex min-h-screen items-center justify-center text-white">
        Game not found.
      </div>
    );

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <div className="container">
        <div className="flex flex-col lg:flex-row justify-start items-start gap-5 mb-8">
          {/* Game Card */}
          <div className="lg:flex-[1_1_25rem] max-lg:w-fit lg:sticky lg:top-20 lg:max-w-[25rem]  bg-gc-900 rounded-3xl p-2 lg:gap-8 gap-4 text-white max-lg:flex justify-start items-center">
            {game.primary_image && (
              <Image
                src={game.primary_image}
                alt={game.name}
                width={800}
                height={800}
                className="rounded-xl lg:w-full lg:h-[500px] h-[100px] w-[100px] object-cover shadow-lg"
              />
            )}
            <div className="mt-5 lg:p-5 max-lg:pr-5 max-lg:w-full">
              <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-md">
                {game.name}
              </h1>
              <p className="text-gray-300 mt-1 text-lg">
                Top up your account instantly!
              </p>
            </div>
          </div>

          {/* Packages */}
          <div className="lg:flex-[1_1_25rem]  lg:sticky lg:top-20 bg-gc-900 rounded-3xl p-8 text-white">
            <h2 className="text-white text-xl font-semibold mb-6 tracking-wide drop-shadow mt-2">
              Select Topup Package
            </h2>
            <div className="flex flex-wrap md:justify-start justify-center items-center gap-6 mb-10">
              {game.topup_options.map((option) => {
                const selected = selectedOption?.id === option.id;
                return (
                  <div
                    key={option.id}
                    onClick={() => setSelectedOption(option)}
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && setSelectedOption(option)
                    }
                    className={`
                      flex-[1_1_15rem] lg:max-w-[15rem]
                group cursor-pointer p-6 rounded-2xl border transform transition-all duration-300
                shadow-xl bg-gc-600 outline-none
                focus-visible:ring-2 focus-visible:ring-gc-600
                ${selected
                        ? "border-gc-300 shadow-gc-300/40 scale-95 ring-2 ring-gc-300"
                        : "border-gc-600 hover:border-gc-300 hover:bg-gc-900/80 hover:shadow-gc-600/20"
                      }
              `}
                    style={{ minHeight: 120 }}
                  >
                    <div className="flex items-center gap-4">
                      {option.currency_image && (
                        <Image
                          src={option.currency_image}
                          alt={option.currency_name}
                          width={60}
                          height={60}
                          className="rounded shadow-lg"
                        />
                      )}
                      <div>
                        <p className="text-2xl font-extrabold tracking-wider">
                          {option.currency_amount}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {option.currency_name}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`mt-5 text-lg font-bold transition-all ${selected
                        ? "text-gray-100 drop-shadow-glow"
                        : "text-gray-300 group-hover:text-gray-200"
                        }`}
                    >
                      ₹{option.price}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Player ID Card */}
            <div className="bg-gc-600 border border-gc-600 rounded-2xl p-6 text-white shadow-lg">
              <label className="block font-semibold mb-3">Enter Player ID</label>
              <input
                type="text"
                {...register("playerId")}
                placeholder="e.g. 58000001411"
                className={`w-full flex justify-start items-center h-[55px] px-5 rounded-xl bg-gc-600 text-white border-1 border-white/20
                  focus:outline-none focus:border-white shadow-glowxxxxx
                  transition-colors duration-300 ${errors.playerId
                    ? "!border-red-400 focus:border-red-400"
                    : ""
                  }`}
              />
              {errors.playerId && (
                <p className="text-red-400 text-sm pt-2">
                  {errors.playerId.message}
                </p>
              )}
              <p className="mt-3 text-sm text-gc-300">
                To find your User ID, click on your avatar in the top-left corner
                of the screen. Your User ID will be displayed above your avatar.
                Please input the complete User ID here, e.g.{" "}
                <span className="text-white font-semibold">58000001411</span>.
              </p>

              <button
                type="submit"
                disabled={isSubmitting || !selectedOption}
                className="mt-5 px-8 py-3 h-[52px] font-extrabold text-lg rounded-2xl bg-gradient-to-r from-gc-300 via-gc-600 to-gc-900 text-white shadow-lg hover:scale-105 transform transition-transform duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-glow"
              >
                {isSubmitting ? (
                  <span className="animate-spin inline-block align-middle mr-2">
                    ⏳
                  </span>
                ) : selectedOption ? (
                  `Pay ₹${selectedOption.price} Now`
                ) : (
                  "Select a Package to Pay"
                )}
              </button>
            </div>
          </div>
        </div>
        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-lg text-center font-semibold border shadow-md text-lg animate-fade-in ${message.type === "success"
              ? "bg-gradient-to-r from-green-700/70 to-green-600/70 text-green-50 border-green-400"
              : "bg-gradient-to-r from-red-700/80 to-pink-700/80 text-red-100 border-red-400"
              }`}
          >
            {message.text}
          </div>
        )}




        {/* Pay Button */}
        <form onSubmit={handleSubmit(onSubmit)}>

        </form>
      </div>
    </>
  );
}
