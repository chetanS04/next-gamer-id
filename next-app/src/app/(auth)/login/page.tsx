"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { login } from "../../../../utils/auth";
import { useAuth } from "../../../context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { AxiosError } from "axios";
import Link from "next/link";
import pubg from "@/public/pubg.jpg";
import { LoginFormData } from "@/common/interface";

// ✅ Validation schema using Yup
const schema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();
  const { user, setUserDirectly, loading } = useAuth();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    showLoader();
    try {
      const res = await login(data.email, data.password);
      const user = res.user;

      localStorage.setItem("user", JSON.stringify(user));
      setUserDirectly(user);

      // Redirect based on role
      if (user.role === "Admin") {
        router.push("/dashboard");
      } else if (user.role === "Buyer") {
        router.push("/buyer-dashboard");
      } else if (user.role === "Seller") {
        router.push("/seller-dashboard");
      } else {
        setError("Invalid role");
      }
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setError(error.response?.data?.message || "Login failed");
    } finally {
      hideLoader();
    }
  };

  return (
    <>
      <div
        className="min-h-screen bg-cover bg-center flex flex-col"
        style={{
          backgroundImage: `url(${pubg.src})`, // ✅ Correct
        }}
      >
        {/* Overlay */}
        <div className=" bg-opacity-60 flex-grow flex flex-col">
          {/* Login Card */}
          <div className="flex-grow flex items-center justify-center px-4">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-lg w-full max-w-md p-8">
              <h2 className="text-3xl font-bold text-center text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-sm text-center text-gray-300 mb-6">
                Login to your account
              </p>

              {error && (
                <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="Email"
                    className="w-full bg-white/20 text-white placeholder-gray-300 border px-4 py-2 rounded-xl focus:outline-none focus:ring-1"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.email.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="password"
                    {...register("password")}
                    placeholder="Password"
                    className="w-full bg-white/20 text-white placeholder-gray-300 border px-4 py-2 rounded-xl focus:outline-none focus:ring-1"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.password.message as string}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="bg-blue-500 cursor-pointer hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-xl w-full transition-all duration-200 disabled:opacity-50"
                >
                  Login
                </button>
              </form>

              <p className="text-sm text-center text-gray-300 mt-6">
                Don not have an account?{" "}
                <Link
                  href="/register"
                  className="text-blue-400 font-semibold hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
