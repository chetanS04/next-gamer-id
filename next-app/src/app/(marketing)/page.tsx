"use client";

import { useState, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { TfiSharethis } from "react-icons/tfi";
import gameLogo1 from "@/public/gameLogo1.png";
import gameCard1 from "@/public/gameCard1.webp";
import gameCard2 from "@/public/gameCard2.webp";
import gameCard3 from "@/public/gameCard3.webp";
import gameCard4 from "@/public/gameCard4.webp";
import gameCard5 from "@/public/gameCard5.webp";

import Image from "next/image";
import {
  FaBolt,
  FaLock,
  FaStar,
  FaGift,
  FaCreditCard,
  FaGamepad,
} from "react-icons/fa";
import { useLoader } from "@/context/LoaderContext";
import axios from "../../../utils/axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Faq, Game, Slider } from "@/common/interface";
import { useAuth } from "@/context/AuthContext";

// ENV/Design constants
const basePath = process.env.NEXT_PUBLIC_UPLOAD_BASE;

const mainBg = "rgb(33, 37, 41)";
const accentBg = "rgb(5, 51, 69)";

export default function GamesPage() {
  // Sliders state
  const [sliders, setSliders] = useState<Slider[]>([]);
  const { showLoader, hideLoader } = useLoader();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    axios
      .get("/api/slider-active")
      .then((res) => setSliders(res.data.data || []))
      .catch(() => setSliders([]));
  }, []);

  const toggleFaq = (index: number) => {
    setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const getFaqs = useCallback(async () => {
    showLoader();
    try {
      const response = await axios.get("/api/get-all-active-faq");
      setFaqs(response.data);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      hideLoader();
    }
  }, []);

  const getTopUps = useCallback(async () => {
    showLoader();
    try {
      const response = await axios.get(`/api/topup-options-with-game`);
      setTopUps(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      hideLoader();
    }
  }, []);

  useEffect(() => {
    getFaqs();
  }, [getFaqs]);

  useEffect(() => {
    getTopUps();
  }, [getTopUps]);

  const features = [
    {
      icon: <FaBolt size={24} className="text-white" />,
      title: "Lightning-Fast Reload",
      desc: "Instant top up into your favorite games",
      bg: "bg-orange-400 text-white",
      highlight: true,
    },
    {
      icon: <FaLock size={24} className="text-green-400" />,
      title: "Safest Top Ups",
      desc: "Every transaction is protected in an ironclad fortress",
    },
    {
      icon: <FaGamepad size={24} className="text-yellow-400" />,
      title: "Games Galore",
      desc: "More than 50 games available",
    },
    {
      icon: <FaStar size={24} className="text-yellow-200" />,
      title: "Best Value Game Credits",
      desc: "We offer the best value for game credits",
    },
    {
      icon: <FaGift size={24} className="text-orange-200" />,
      title: "Get Rewarded Everytime",
      desc: "Save more as you buy ID Bazar Credits",
    },
    {
      icon: <FaCreditCard size={24} className="text-orange-400" />,
      title: "Convenient Payment Methods",
      desc: "We have all popular payment channels for your convenience",
    },
  ];

  // Games API
  const [games, setGames] = useState<Game[]>([]);
  const [topUps, setTopUps] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/games")
      .then((res) => setGames(res.data.games || []))
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, []);

  const gameBuyCard = [gameCard1, gameCard2, gameCard3, gameCard4, gameCard5];

  return (
    <>
      {/* landing area start */}
      <section className="mt-10 text-white">
        <div className="container">
          <div className="">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={0}
              slidesPerView={1}
              speed={600}
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              loop={true}
              className="w-full border-white/80 border rounded-xl"
            >
              {sliders.length === 0 ? (
                // Optionally show a loader or placeholder
                <div className="flex justify-center items-center h-56 bg-gray-950 text-blue-100 font-bold text-xl">
                  No slides found
                </div>
              ) : (
                sliders.map((slide) => (
                  <SwiperSlide key={slide.id} className="group">
                    <div className="relative z-0 aspect-[32/10] overflow-hidden rounded-xl bg-gray-900  ">
                      {slide.image ? (
                        <Image
                          src={`${basePath}${slide.image}`}
                          alt={slide.title || "Featured Game Slide"}
                          className="absolute -z-10 inset-0 w-full h-full object-cover"
                          loading="lazy"
                          height={1920}
                          width={1920}
                          draggable={false}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full text-6xl text-gray-700 bg-gray-800 opacity-60">
                          🎮
                        </div>
                      )}

                      {/* Optionally: overlay caption */}
                      {slide.title && (
                        <div className="h-full w-full bg-black/50 p-10 flex justify-between items-end">
                          <div className="-translate-y-8 opacity-0 transition-all duration-[1000ms] group-[.swiper-slide-active]:translate-y-0 group-[.swiper-slide-active]:opacity-100 group-[.swiper-slide-active]:delay-[1000ms] ease-in-out">
                            <h2 className="text-5xl font-bold text-white mb-4">
                              {slide.title}
                            </h2>
                            <div className="flex gap-2 justify-start items-center">
                              <button className="bg-gc-600 shadow-md shadow-white/20 text-white font-semibold text-lg px-10 py-3 rounded-lg">
                                Read More
                              </button>
                              <TfiSharethis className="text-white size-6" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </SwiperSlide>
                ))
              )}
            </Swiper>
          </div>
        </div>
      </section>
      {/* landing area end */}

      {/* Exclusive Offers section start */}
      <section className="my-24 text-white">
        <div className="container">
          <div className="rounded-xl bg-gc-900 p-5">
            <h3 className="text-2xl text-white font-semibold mb-6">
              Exclusive Offers
            </h3>
            <div className="flex gap-5 flex-wrap justify-center items-stretch">
              <div className="flex-[1_1_200px]">
                <div className="card">
                  <div className="gameInfo flex gap-4 justify-start items-center">
                    <div className="size-16 aspect-square rounded-2xl overflow-hidden">
                      <Image
                        src={gameLogo1}
                        alt="game logo"
                        height={600}
                        width={600}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="text-white">
                      <h5 className="imageName text-base font-semibold">
                        Battlegrounds Mobile India
                      </h5>
                      <h6 className="imageMadeIn text-xs font-light text-white/60">
                        KRAFTON India
                      </h6>
                    </div>
                  </div>
                  <div className="mt-3 rounded-lg flex overflow-hidden bg-gc-600 border-2 border-orange-500">
                    <div className="grow px-2 py-1 flex flex-col justify-center">
                      <div className="text-white fbold">
                        <span className="text-xs">INR</span>
                        <span className="text-base">75.00</span>
                      </div>

                      <div className="font-xs text-gc-300 line-through">
                        89.00
                      </div>
                    </div>

                    <svg
                      className="shrink-0 mr-[-1px]"
                      width="14px"
                      height="46px"
                      viewBox="0 0 12 40"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.67426 19H1.67571C0.918689 19 0.436183 18.1915 0.79561 17.5252L9.41912 1.54017C9.9309 0.591503 10.9221 0.000288123 12 0.000750224V40L2 39.9994L7.63578 20.2747C7.81831 19.6359 7.33864 19 6.67426 19Z"
                        fill="url(#paint0_linear_3023_44370)"
                      ></path>

                      <defs>
                        <linearGradient
                          id="paint0_linear_3023_44370"
                          x1="8.37499"
                          y1="0"
                          x2="8.37499"
                          y2="40"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#FE055F"></stop>
                          <stop offset="1" stopColor="#FF8844"></stop>
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="grow px-2 py-1 bg-gradient-to-b from-[#FE055F] to-[#ff8845]">
                      <div className="font-semibold text-sm text-center">
                        Savings
                      </div>
                      <div className="font-bold text-center">INR 14.00</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-[1_1_200px]">
                <div className="card">
                  <div className="gameInfo flex gap-4 justify-start items-center">
                    <div className="size-16 aspect-square rounded-2xl overflow-hidden">
                      <Image
                        src={gameLogo1}
                        height={600}
                        width={600}
                        alt="game logo"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="text-white">
                      <h5 className="imageName text-base font-semibold">
                        Battlegrounds Mobile India
                      </h5>
                      <h6 className="imageMadeIn text-xs font-light text-white/60">
                        KRAFTON India
                      </h6>
                    </div>
                  </div>
                  <div className="mt-3 rounded-lg flex overflow-hidden bg-gc-600 border-2 border-orange-500">
                    <div className="grow px-2 py-1 flex flex-col justify-center">
                      <div className="text-white fbold">
                        <span className="text-xs">INR</span>
                        <span className="text-base">75.00</span>
                      </div>

                      <div className="font-xs text-gc-300 line-through">
                        89.00
                      </div>
                    </div>

                    <svg
                      className="shrink-0 mr-[-1px]"
                      width="14px"
                      height="46px"
                      viewBox="0 0 12 40"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.67426 19H1.67571C0.918689 19 0.436183 18.1915 0.79561 17.5252L9.41912 1.54017C9.9309 0.591503 10.9221 0.000288123 12 0.000750224V40L2 39.9994L7.63578 20.2747C7.81831 19.6359 7.33864 19 6.67426 19Z"
                        fill="url(#paint0_linear_3023_44370)"
                      ></path>

                      <defs>
                        <linearGradient
                          id="paint0_linear_3023_44370"
                          x1="8.37499"
                          y1="0"
                          x2="8.37499"
                          y2="40"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#FE055F"></stop>
                          <stop offset="1" stopColor="#FF8844"></stop>
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="grow px-2 py-1 bg-gradient-to-b from-[#FE055F] to-[#ff8845]">
                      <div className="font-semibold text-sm text-center">
                        Savings
                      </div>
                      <div className="font-bold text-center">INR 14.00</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-[1_1_200px]">
                <div className="card">
                  <div className="gameInfo flex gap-4 justify-start items-center">
                    <div className="size-16 aspect-square rounded-2xl overflow-hidden">
                      <Image
                        height={600}
                        width={600}
                        src={gameLogo1}
                        alt="game logo"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="text-white">
                      <h5 className="imageName text-base font-semibold">
                        Battlegrounds Mobile India
                      </h5>
                      <h6 className="imageMadeIn text-xs font-light text-white/60">
                        KRAFTON India
                      </h6>
                    </div>
                  </div>
                  <div className="mt-3 rounded-lg flex overflow-hidden bg-gc-600 border-2 border-orange-500">
                    <div className="grow px-2 py-1 flex flex-col justify-center">
                      <div className="text-white fbold">
                        <span className="text-xs">INR</span>
                        <span className="text-base">75.00</span>
                      </div>

                      <div className="font-xs text-gc-300 line-through">
                        89.00
                      </div>
                    </div>

                    <svg
                      className="shrink-0 mr-[-1px]"
                      width="14px"
                      height="46px"
                      viewBox="0 0 12 40"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.67426 19H1.67571C0.918689 19 0.436183 18.1915 0.79561 17.5252L9.41912 1.54017C9.9309 0.591503 10.9221 0.000288123 12 0.000750224V40L2 39.9994L7.63578 20.2747C7.81831 19.6359 7.33864 19 6.67426 19Z"
                        fill="url(#paint0_linear_3023_44370)"
                      ></path>

                      <defs>
                        <linearGradient
                          id="paint0_linear_3023_44370"
                          x1="8.37499"
                          y1="0"
                          x2="8.37499"
                          y2="40"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#FE055F"></stop>
                          <stop offset="1" stopColor="#FF8844"></stop>
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="grow px-2 py-1 bg-gradient-to-b from-[#FE055F] to-[#ff8845]">
                      <div className="font-semibold text-sm text-center">
                        Savings
                      </div>
                      <div className="font-bold text-center">INR 14.00</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-[1_1_200px]">
                <div className="card">
                  <div className="gameInfo flex gap-4 justify-start items-center">
                    <div className="size-16 aspect-square rounded-2xl overflow-hidden">
                      <Image
                        height={600}
                        width={600}
                        src={gameLogo1}
                        alt="game logo"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="text-white">
                      <h5 className="imageName text-base font-semibold">
                        Battlegrounds Mobile India
                      </h5>
                      <h6 className="imageMadeIn text-xs font-light text-white/60">
                        KRAFTON India
                      </h6>
                    </div>
                  </div>
                  <div className="mt-3 rounded-lg flex overflow-hidden bg-gc-600 border-2 border-orange-500">
                    <div className="grow px-2 py-1 flex flex-col justify-center">
                      <div className="text-white fbold">
                        <span className="text-xs">INR</span>
                        <span className="text-base">75.00</span>
                      </div>

                      <div className="font-xs text-gc-300 line-through">
                        89.00
                      </div>
                    </div>

                    <svg
                      className="shrink-0 mr-[-1px]"
                      width="14px"
                      height="46px"
                      viewBox="0 0 12 40"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.67426 19H1.67571C0.918689 19 0.436183 18.1915 0.79561 17.5252L9.41912 1.54017C9.9309 0.591503 10.9221 0.000288123 12 0.000750224V40L2 39.9994L7.63578 20.2747C7.81831 19.6359 7.33864 19 6.67426 19Z"
                        fill="url(#paint0_linear_3023_44370)"
                      ></path>

                      <defs>
                        <linearGradient
                          id="paint0_linear_3023_44370"
                          x1="8.37499"
                          y1="0"
                          x2="8.37499"
                          y2="40"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#FE055F"></stop>
                          <stop offset="1" stopColor="#FF8844"></stop>
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="grow px-2 py-1 bg-gradient-to-b from-[#FE055F] to-[#ff8845]">
                      <div className="font-semibold text-sm text-center">
                        Savings
                      </div>
                      <div className="font-bold text-center">INR 14.00</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-[1_1_200px]">
                <div className="card">
                  <div className="gameInfo flex gap-4 justify-start items-center">
                    <div className="size-16 aspect-square rounded-2xl overflow-hidden">
                      <Image
                        height={600}
                        width={600}
                        src={gameLogo1}
                        alt="game logo"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="text-white">
                      <h5 className="imageName text-base font-semibold">
                        Battlegrounds Mobile India
                      </h5>
                      <h6 className="imageMadeIn text-xs font-light text-white/60">
                        KRAFTON India
                      </h6>
                    </div>
                  </div>
                  <div className="mt-3 rounded-lg flex overflow-hidden bg-gc-600 border-2 border-orange-500">
                    <div className="grow px-2 py-1 flex flex-col justify-center">
                      <div className="text-white fbold">
                        <span className="text-xs">INR</span>
                        <span className="text-base">75.00</span>
                      </div>

                      <div className="font-xs text-gc-300 line-through">
                        89.00
                      </div>
                    </div>

                    <svg
                      className="shrink-0 mr-[-1px]"
                      width="14px"
                      height="46px"
                      viewBox="0 0 12 40"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.67426 19H1.67571C0.918689 19 0.436183 18.1915 0.79561 17.5252L9.41912 1.54017C9.9309 0.591503 10.9221 0.000288123 12 0.000750224V40L2 39.9994L7.63578 20.2747C7.81831 19.6359 7.33864 19 6.67426 19Z"
                        fill="url(#paint0_linear_3023_44370)"
                      ></path>

                      <defs>
                        <linearGradient
                          id="paint0_linear_3023_44370"
                          x1="8.37499"
                          y1="0"
                          x2="8.37499"
                          y2="40"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#FE055F"></stop>
                          <stop offset="1" stopColor="#FF8844"></stop>
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="grow px-2 py-1 bg-gradient-to-b from-[#FE055F] to-[#ff8845]">
                      <div className="font-semibold text-sm text-center">
                        Savings
                      </div>
                      <div className="font-bold text-center">INR 14.00</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exclusive Offers section end */}

      {user && (user.role === "Admin" || user.role === "Buyer") && (
        <section className="my-24">
          <div className="container">
            <div className="sectionHeader">
              <h2 className="lg:text-3xl text-2xl text-white font-bold mb-7">TopUps Available</h2>
            </div>
            <div className="flex flex-wrap justify-start items-stretch gap-5">
              {topUps.map((game) => (
                <div key={game.game_id} className="max-w-[277px] flex-[1_1_277px]">
                  <div className="card border border-orange-200 transition-all duration-300 hover:shadow-2xl shadow-orange-300 overflow-hidden relative group p-2 rounded-3xl z-0">
                    {/* Main Game Image */}
                    <Image
                      src={`http://localhost:8000/storage/${game.primary_image}`}
                      alt={''}
                      height={800}
                      width={800}
                      className="h-[500px] w-full rounded-xl block transition-all duration-300 group-hover:scale-110 object-cover"
                    />

                  {/* Gradient Overlay */}
                  <div className="absolute bg-gradient-to-t from-black/60 to-white/0 inset-0 z-10 flex p-5 items-end justify-start">
                    <div className="content w-full">
                      {/* Logo (optional secondary image or main image as placeholder) */}
                      <div className="flex justify-start items-center gap-2">
                        <div className="logo size-16 rounded-lg shadow shadow-orange-600/10 aspect-square overflow-hidden">
                          <Image
                            src={`${basePath}${game.primary_image}`}
                            alt={""}
                            height={800}
                            width={800}
                            className="h-full w-full rounded-xl block object-cover transition-all duration-300 group-hover:scale-110"
                          />
                        </div>
                      </div>

                        {/* Game Info & Button */}
                        <div className="text-start mt-5 text-white lg:-mb-[110px] lg:opacity-0 lg:group-hover:opacity-100 group-hover:mb-0 transition-all duration-300">
                          <h4 className="lg:text-lg text-base font-semibold mb-5">
                            {game.game_name}
                          </h4>

                          <button
                            onClick={() => router.push(`/top-up-game/${game.game_id}`)}
                            className="lg:rotate-x-180 lg:group-hover:rotate-x-0 border border-orange-400 rounded text-center h-10  w-full lg:group-hover:bg-orange-400 transition-all duration-300 delay-300 cursor-pointer"
                          >
                            Top Up Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}


      <section className="my-24 hidden">
        <div className="container">
          <div className="sectionHeader">
            <h2 className="lg:text-3xl text-2xl text-white font-bold mb-7">
              Popular Games
            </h2>
          </div>
          <div className="flex flex-wrap justify-start items-stretch gap-5">
            {gameBuyCard.map((item, index) => (
              <div key={index} className="max-w-[277px] flex-[1_1_277px]">
                <div className="card .border border-orange-200 transition-all duration-300 hover:shadow-2xl shadow-orange-300 overflow-hidden relative group p-2 rounded-3xl z-0">
                  <Image
                    src={item}
                    alt="Game Buy Card"
                    className="h-[500px] w-full rounded-xl block transition-all duration-300 group-hover:scale-110 object-cover"
                  />
                  <div className="absolute bg-gradient-to-t from-black/60 to-white/0 inset-0 z-10 flex p-5 items-end justify-start">
                    <div className="content">
                      <div className="flex justify-start items-center gap-2">
                        <div className="logo size-16 rounded-lg shadow shadow-orange-600/10 aspect-square">
                          <Image
                            src={gameCard1}
                            alt="Game Buy Card"
                            className="h-full object-top w-full rounded-xl block transition-all duration-300 group-hover:scale-110 object-cover"
                          />
                        </div>
                      </div>
                      <div className="text-start mt-5 text-white lg:-mb-[110px] lg:opacity-0 lg:group-hover:opacity-100 group-hover:mb-0 transition-all duration-300">
                        <h4 className="lg:text-lg text-base font-semibold mb-5">
                          Battlegrounds Mobile India
                        </h4>

                        <button className="lg:rotate-x-180 lg:group-hover:rotate-x-0 border border-orange-400 rounded text-center h-10  w-full lg:group-hover:bg-orange-400 transition-all duration-300 delay-300 cursor-pointer">
                          Get Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GAMES GRID */}
      <section className="flex-1 hidden">
        <div className="max-w-6xl mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center py-32">
              <span className="animate-spin h-12 w-12 border-4 border-sky-400 border-t-transparent rounded-full" />
            </div>
          ) : games.length === 0 ? (
            <div className="text-center text-gray-400 mt-28 text-xl">
              ⚠️ No games available to sell yet.
              <br />
              Please check back soon!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 pb-6">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="group border rounded-xl overflow-hidden shadow-xl hover:shadow-sky-900/30 transition flex flex-col"
                  style={{
                    background: `linear-gradient(135deg, ${mainBg} 78%, ${accentBg})`,
                    borderColor: "#184c5d",
                  }}
                >
                  <div
                    className="relative w-full h-48"
                    style={{ background: accentBg }}
                  >
                    {game.primary_image ? (
                      <Image
                        height={600}
                        width={600}
                        src={`${basePath}${game.primary_image}`}
                        alt={game.name}
                        className="w-full h-48 object-cover transition-transform group-hover:scale-105 duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-6xl text-gray-700 opacity-50">
                        🎮
                      </span>
                    )}
                    <div className="absolute top-2 left-2 bg-[#053345] text-white text-xs px-3 py-1 rounded-full font-semibold shadow shadow-blue-800/40">
                      Game ID: {game.id}
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col p-4">
                    <h2 className="font-bold text-xl text-[#72c4e9] group-hover:text-[#bff6ff] transition">
                      {game.name}
                    </h2>
                    <p className="text-gray-300 text-sm mb-4 mt-2 flex-1">
                      {game.description}
                    </p>
                    <Link
                      href={`/sell-game/${game.id}`}
                      className="inline-block mt-auto px-4 py-2 rounded-lg text-center font-bold shadow hover:brightness-110 transition"
                      style={{
                        background:
                          "linear-gradient(90deg, #1179af 40%, #0c2129 100%)",
                        color: "#cafdff",
                        border: ".0938rem solid #369dcc",
                        boxShadow: "0 .125rem .75rem 0 #05334540",
                      }}
                    >
                      Sell This Game
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 pb-6">
            {games.map((game) => (
              <div
                key={game.id}
                className="group border rounded-xl overflow-hidden shadow-xl hover:shadow-sky-900/30 transition flex flex-col"
                style={{
                  background: `linear-gradient(135deg, ${mainBg} 78%, ${accentBg})`,
                  borderColor: "#184c5d",
                }}
              >
                <div
                  className="relative w-full h-48"
                  style={{ background: accentBg }}
                >
                  {game.primary_image ? (
                    <Image
                      src={`${basePath}${game.primary_image}`}
                      alt={game.name}
                      height={600}
                      width={600}
                      className="w-full h-48 object-cover transition-transform group-hover:scale-105 duration-200"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-6xl text-gray-700 opacity-50">
                      🎮
                    </span>
                  )}
                  <div className="absolute top-2 left-2 bg-[#053345] text-white text-xs px-3 py-1 rounded-full font-semibold shadow shadow-blue-800/40">
                    Game ID: {game.id}
                  </div>
                </div>
                <div className="flex-1 flex flex-col p-4">
                  <h2 className="font-bold text-xl text-[#72c4e9] group-hover:text-[#bff6ff] transition">
                    {game.name}
                  </h2>
                  <p className="text-gray-300 text-sm mb-4 mt-2 flex-1">
                    {game.description}
                  </p>
                  <Link
                    href={`/buy-game/${game.id}`}
                    className="inline-block mt-auto px-4 py-2 rounded-lg text-center font-bold shadow hover:brightness-110 transition"
                    style={{
                      background:
                        "linear-gradient(90deg, #1179af 40%, #0c2129 100%)",
                      color: "#cafdff",
                      border: ".0938rem solid #369dcc",
                      boxShadow: "0 .125rem .75rem 0 #05334540",
                    }}
                  >
                    Buy This Game
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="my-24">
        <div className="container mx-auto px-4">
          {/* Section Title */}
          <div className="sectionHeader mb-7">
            <h2 className="lg:text-3xl text-2xl text-white font-bold">
              Sell Games
            </h2>
          </div>

          {/* Game Cards Grid */}
          <div className="flex flex-wrap justify-start items-stretch gap-5">
            {games.map((game) => (
              <div key={game.id} className="max-w-[277px] flex-[1_1_277px]">
                <div className="card border border-orange-200 transition-all duration-300 hover:shadow-2xl shadow-orange-300 overflow-hidden relative group p-2 rounded-3xl z-0">
                  {/* Game Main Image */}
                  {game.primary_image ? (
                    <Image
                      src={`${basePath}${game.primary_image}`}
                      alt={game.name}
                      height={600}
                      width={600}
                      className="h-[500px] w-full rounded-xl block transition-all duration-300 group-hover:scale-110 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-44 w-full bg-gray-800 flex items-center justify-center rounded-xl">
                      <span className="text-4xl text-gray-500">🎮</span>
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute bg-gradient-to-t from-black/60 to-white/0 inset-0 z-10 flex p-5 items-end justify-start">
                    <div className="content w-full">
                      {/* Logo / Secondary Image */}
                      <div className="flex justify-start items-center gap-2">
                        <div className="logo size-16 rounded-lg shadow shadow-orange-600/10 aspect-square overflow-hidden">
                          <Image
                            src={`${basePath}${game.primary_image}`}
                            alt={game.name}
                            height={100}
                            width={100}
                            className="h-full w-full rounded-xl block transition-all duration-300 group-hover:scale-110 object-cover"
                          />
                        </div>
                      </div>

                      {/* Text & Button */}
                      <div className="text-start mt-5 text-white lg:-mb-[110px] lg:opacity-0 lg:group-hover:opacity-100 group-hover:mb-0 transition-all duration-300">
                        <h4 className="lg:text-lg text-base font-semibold mb-5">
                          {game.name}
                        </h4>
                        <button
                          onClick={() => router.push(`/sell-game/${game.id}`)}
                          className="lg:rotate-x-180 lg:group-hover:rotate-x-0 border border-orange-400 rounded text-center h-10 w-full lg:group-hover:bg-orange-400 transition-all duration-300 delay-300 cursor-pointer"
                        >
                          Sell This Game
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="my-24">
        <div className="container mx-auto px-4">
          {/* Section Title */}
          <div className="sectionHeader mb-7">
            <h2 className="lg:text-3xl text-2xl text-white font-bold">
              Buy Games
            </h2>
          </div>

          {/* Game Cards Grid */}
          <div className="flex flex-wrap justify-start items-stretch gap-5">
            {games.map((game) => (
              <div key={game.id} className="max-w-[277px] flex-[1_1_277px]">
                <div className="card border border-orange-200 transition-all duration-300 hover:shadow-2xl shadow-orange-300 overflow-hidden relative group p-2 rounded-3xl z-0">
                  {/* Game Main Image */}
                  {game.primary_image ? (
                    <Image
                      src={`${basePath}${game.primary_image}`}
                      alt={game.name}
                      height={600}
                      width={600}
                      className="h-[500px] w-full rounded-xl block transition-all duration-300 group-hover:scale-110 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-44 w-full bg-gray-800 flex items-center justify-center rounded-xl">
                      <span className="text-4xl text-gray-500">🎮</span>
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute bg-gradient-to-t from-black/60 to-white/0 inset-0 z-10 flex p-5 items-end justify-start">
                    <div className="content w-full">
                      {/* Logo / Secondary Image */}
                      <div className="flex justify-start items-center gap-2">
                        <div className="logo size-16 rounded-lg shadow shadow-orange-600/10 aspect-square overflow-hidden">
                          <Image
                            src={`${basePath}${game.primary_image}`}
                            alt={game.name}
                            height={100}
                            width={100}
                            className="h-full w-full rounded-xl block transition-all duration-300 group-hover:scale-110 object-cover"
                          />
                        </div>
                      </div>

                      {/* Text & Button */}
                      <div className="text-start mt-5 text-white lg:-mb-[110px] lg:opacity-0 lg:group-hover:opacity-100 group-hover:mb-0 transition-all duration-300">
                        <h4 className="lg:text-lg text-base font-semibold mb-5">
                          {game.name}
                        </h4>
                        <button
                          onClick={() => router.push(`/buy-game/${game.id}`)}
                          className="lg:rotate-x-180 lg:group-hover:rotate-x-0 border border-orange-400 rounded text-center h-10 w-full lg:group-hover:bg-orange-400 transition-all duration-300 delay-300 cursor-pointer"
                        >
                          Buy This Game
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className=" my-24 px-2 text-white">
        <div className="container">
          <h2 className="text-3xl font-bold mb-1">ID Bazar Advantage</h2>
          <p className="text-gray-300 mb-8">
            Dominate the game with rapid top-ups, unyielding protection, and
            rewards made for legends.
          </p>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((f, i) => (
                <div
                  key={i}
                  className={`rounded-lg p-4 shadow ${
                    f.highlight ? "bg-orange-400 text-white" : "bg-gc-900"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {f.icon}
                    <span
                      className={`font-semibold ${
                        f.highlight ? "text-white" : ""
                      }`}
                    >
                      {f.title}
                    </span>
                  </div>
                  <p
                    className={`text-sm ${
                      f.highlight ? "text-white" : "text-gray-300"
                    }`}
                  >
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex-1 flex flex-col items-center justify-center bg-gc-900 rounded-lg shadow p-8">
              {/* Placeholder for image or illustration */}
              <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
                <circle
                  cx="70"
                  cy="70"
                  r="60"
                  stroke="#FFA726"
                  strokeWidth="8"
                />
                <path
                  d="M70 40V70L100 80"
                  stroke="#fff"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <circle cx="70" cy="70" r="8" fill="#FFA726" />
                <polyline
                  points="10,10 30,0 40,20"
                  fill="none"
                  stroke="#FFA726"
                  strokeWidth="4"
                />
              </svg>
              <h3 className="mt-6 text-xl font-bold">LIGHTNING FAST RELOAD</h3>
              <p className="text-gray-300 mt-2 text-center">
                Instant top up into your favorite games
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Faq Section start */}
      <section className="faq">
        <div className="container">
          <div className="sectionHeader">
            <h2 className="lg:text-3xl text-2xl text-white font-bold mb-7">
              FAQ ?
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={faq.id} className="border rounded-lg">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left text-base px-4 bg-gc-900 text-white py-3 font-semibold flex justify-between items-center"
                >
                  {faq.question}
                  <span className="text-3xl">
                    {activeIndex === index ? "-" : "+"}
                  </span>
                </button>
                {/* {activeIndex === index && (
                )} */}
                <div
                  className={`grid transition-all duration-300 ${activeIndex === index
                    ? "grid-rows-[1fr]"
                    : "grid-rows-[0fr]"
                    }`}
                >
                  <div className="overflow-hidden">
                    <div
                      className={`px-4 py-3 text-gc-900 text-base bg-white rounded-b-xl`}
                    >
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Faq Section end */}

      {/* FOOTER */}
    </>
  );
}
