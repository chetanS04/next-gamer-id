"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // Adjust path if required
import axios from "../../../../utils/axios";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import Image from "next/image";

// Types
type Game = {
  id: number;
  name: string;
  description: string;
  primary_image: string;
};

type Slider = {
  id: number;
  title: string;
  image: string;
};

// ENV/Design constants
const imageHost = "http://localhost:8000/storage/";
const mainBg = "rgb(33, 37, 41)";
const accentBg = "rgb(5, 51, 69)";

export default function GamesPage() {
  // Navbar
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // const dropdownRef = useRef<HTMLLIElement>(null);

  // Sliders state
  const [sliders, setSliders] = useState<Slider[]>([]);
  useEffect(() => {
    axios
      .get("/api/slider-active")
      .then((res) => setSliders(res.data.data || []))
      .catch(() => setSliders([]));
  }, []);

  // User dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleDashboardRedirect = () => {
    switch (user?.role) {
      case "Admin":
        router.push("/dashboard");
        break;
      case "Buyer":
        router.push("/buyer-dashboard");
        break;
      case "Seller":
        router.push("/seller-dashboard");
        break;
      default:
        router.push("/login");
        break;
    }
    setDropdownOpen(false);
  };

  // Games API
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/games")
      .then((res) => setGames(res.data.games || []))
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col justify-between"
      style={{
        background: `linear-gradient(120deg, ${mainBg} 76%, ${accentBg})`,
      }}
    >
      {/* NAVBAR */}
      <nav className="w-full px-0 md:px-4 py-3 relative z-50">
        <div
          className="max-w-7xl mx-auto flex items-center justify-between py-2 px-4 md:px-8 rounded-2xl shadow-lg border backdrop-blur border-[#074463]/40"
          style={{
            background: `linear-gradient(90deg, ${mainBg} 80%, ${accentBg})`,
            boxShadow: `0 4px 16px 0 rgba(5,51,69,0.16)`,
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-600 to-blue-400 tracking-tight drop-shadow hover:scale-105 transition focus:outline-none"
          >
            <span style={{ letterSpacing: "2px" }}>🎮 GameHub</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-7">
            <Link
              href="/contact-us"
              className="px-3 py-1.5 rounded-xl font-semibold text-gray-200 hover:bg-[#053345]/50 hover:border-[#369dcc]/30 shadow-sm hover:scale-105 transition duration-100"
            >
              Contact
            </Link>
            <Link
              href="/about"
              className="px-3 py-1.5 rounded-xl font-semibold text-gray-200 hover:bg-[#212529]/50 hover:border-[#222] hover:scale-105 shadow-sm duration-100"
            >
              About
            </Link>
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="ml-3 w-10 h-10 bg-gradient-to-tr from-[#053345] via-[#212529] to-[#0c3949] rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg border-2 border-[#369dcc]/30 ring-2 ring-blue-900/30 ring-inset hover:scale-110 transition"
                  title={user.name}
                >
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </button>
                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 rounded-xl p-2 w-44 z-50 shadow-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${mainBg} 70%, ${accentBg})`,
                      border: "1px solid #0a3a55",
                    }}
                  >
                    <button
                      onClick={handleDashboardRedirect}
                      className="px-3 py-2 w-full text-left font-semibold text-[#81e8ff] hover:bg-[#053345]/50 rounded transition"
                    >
                      Dashboard
                    </button>
                    <div className="px-3 py-1 text-xs text-gray-400 italic select-none">
                      Role: {user?.role}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-2 w-full text-left text-red-400 font-semibold hover:bg-[#053345]/40 rounded transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-3">
                <Link
                  href="/login"
                  className="px-4 py-1 rounded-full font-semibold border border-[#063c53]/40 bg-gradient-to-tr from-[#212529] to-[#053345] text-[#b8c9d8] hover:text-white hover:bg-[#0a3650] shadow hover:scale-105 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-1.5 rounded-full font-bold bg-gradient-to-tr from-[#053345] to-[#2b5e7d] text-sky-100 hover:text-white hover:brightness-110 transition border-none outline-none shadow-md"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="max-w-4xl mx-auto px-4 py-10 text-center">
        <h1
          className="text-4xl md:text-5xl font-extrabold mb-2 text-transparent bg-clip-text"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #b8fcff, #2ca0e6 60%, #053345 100%)",
          }}
        >
          Sell Video Games on <span style={{ color: accentBg }}>GameHub</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mt-2 max-w-2xl mx-auto">
          <span className="font-semibold" style={{ color: "#7fd3f7" }}>
            Earn money
          </span>{" "}
          by connecting your games with players worldwide.
          <br />
          <span style={{ color: "#2ca0e6" }}>
            List your favorite games
          </span>{" "}
          easily and securely—our trusted marketplace is built{" "}
          <b>for gamers, by gamers!</b>
        </p>
      </section>

      {/* SLIDER SECTION */}
      {/* <section className="bg-black w-full"> */}
      <div className="max-w-[1260px] mx-auto w-full">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop={true}
          className="w-full"
          style={{
            borderRadius: "1rem", // Rounded corners for the slider
            overflow: "hidden", // Prevent overflow on images/slides
          }}
        >
          {sliders.length === 0 ? (
            // Optionally show a loader or placeholder
            <div className="flex justify-center items-center h-56 bg-gray-950 text-blue-100 font-bold text-xl">
              No slides found
            </div>
          ) : (
            sliders.map((slide) => (
              <SwiperSlide key={slide.id}>
                <div className="relative w-full aspect-video md:aspect-[32/10] bg-gray-900">
                  {slide.image ? (
                    <Image
                      src={`${imageHost}${slide.image}`}
                      alt={slide.title || "Featured Game Slide"}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      height={600}
                      width={600}
                      draggable={false}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full text-6xl text-gray-700 bg-gray-800 opacity-60">
                      🎮
                    </div>
                  )}
                  {/* Optionally: overlay caption */}
                  {slide.title && (
                    <span className="absolute bottom-3 left-6 text-lg md:text-2xl font-bold bg-black/50 text-cyan-200 px-4 py-1 rounded shadow-lg">
                      {slide.title}
                    </span>
                  )}
                </div>
              </SwiperSlide>
            ))
          )}
        </Swiper>
      </div>

      {/* </section> */}

      {/* TRUST BANNERS */}
      <div className="max-w-6xl mx-auto my-12 px-4 grid grid-cols-1 md:grid-cols-3 gap-7">
        {[
          {
            icon: "🛡️",
            title: "Trusted Platform",
            desc: (
              <>
                Only verified sellers and buyers.
                <br />
                Secure payments and robust privacy.
              </>
            ),
            color: `linear-gradient(135deg, ${accentBg} 60%, #20699a 100%)`,
            border: "#1179af",
          },
          {
            icon: "💬",
            title: "24/7 Customer Support",
            desc: (
              <>
                Our team is here for you all day, every day.
                <br />
                Quick, friendly help at any time.
              </>
            ),
            color: `linear-gradient(135deg, #125463 60%, ${accentBg})`,
            border: "#236f81",
          },
          {
            icon: "⚡",
            title: "Fast Payment Processing",
            desc: (
              <>
                Get your earnings quickly after a sale.
                <br />
                No unnecessary delays—start cashing out!
              </>
            ),
            color: `linear-gradient(135deg, #205c63 50%, ${mainBg})`,
            border: "#235c5b",
          },
        ].map((b) => (
          <div
            key={b.title}
            className="rounded-xl p-6 flex items-center shadow-lg hover:scale-[1.03] transition duration-200 border"
            style={{ background: b.color, borderColor: b.border }}
          >
            <span className="text-4xl md:text-5xl mr-5">{b.icon}</span>
            <div>
              <h3 className="font-bold text-lg text-white mb-1">{b.title}</h3>
              <p className="text-blue-100 text-sm">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* GAMES GRID */}
      <section className="flex-1">
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
                        src={imageHost + game.primary_image}
                        alt={game.name}
                        className="w-full h-48 object-cover transition-transform group-hover:scale-105 duration-200"
                        loading="lazy"
                        height={600}
                        width={600}
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
                        border: "1.5px solid #369dcc",
                        boxShadow: "0 2px 12px 0 #05334540",
                      }}
                    >
                      Sell This Game
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="w-full border-t py-6 mt-10"
        style={{
          background: `linear-gradient(90deg, ${mainBg} 75%, ${accentBg})`,
          borderTop: "2px solid #07446380",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span
              className="text-xl"
              style={{ color: "#b2f6ff", fontWeight: "bold" }}
            >
              GameHub
            </span>
            <span className="text-gray-400 text-xs">
              © {new Date().getFullYear()} All Rights Reserved.
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <Link
              href="/about"
              className="text-gray-300 hover:text-[#55c2df] text-sm"
            >
              About
            </Link>
            <Link
              href="/contact-us"
              className="text-gray-300 hover:text-[#bbfffd] text-sm"
            >
              Contact
            </Link>
            <a href="#" className="text-gray-300 hover:text-cyan-300 text-sm">
              Privacy
            </a>
            <a href="#" className="text-gray-300 hover:text-[#a8e1e8] text-sm">
              Terms
            </a>
          </div>
        </div>
        <div className="text-center text-xs mt-3" style={{ color: "#4bbbe7" }}>
          Crafted with <span style={{ color: "#d6fcff" }}>♥</span> for Gamers |
          Powered by GameHub Platform
        </div>
      </footer>
    </div>
  );
}
