"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "../../../../utils/axios";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import SuccessMessage from "@/components/(sheared)/SuccessMessage";
import ErrorMessage from "@/components/(sheared)/ErrorMessage";
import { useLoader } from "@/context/LoaderContext";
import { useAuth } from "@/context/AuthContext";
import { AxiosError } from "axios";
import Link from "next/link";
import { RegisterUser, UserRole } from "@/common/interface";

const schema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  username: Yup.string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters"),
  phone_number: Yup.string()
    .required("Phone number is required")
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
  store_name: Yup.string().required("Store name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
  terms: Yup.bool().oneOf([true], "You must accept the terms and conditions"),
});

export default function Home() {
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: RegisterUser) => {
    if (!selectedRole) return;
    try {
      showLoader();
      await axios.post("/register", {
        name: data.name,
        store_name: data.store_name,
        username: data.username,
        phone_number: data.phone_number,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        role: selectedRole,
      });

      localStorage.setItem("verifyEmail", data.email);
      setSuccessMessage("Verification code successfully sent to your email");
      setTimeout(() => router.push("/email-verify"), 1000);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;

      setErrorMessage(error.response?.data?.message || "Registration failed");
    } finally {
      hideLoader();
    }
  };

  const nameValue = watch("name");
  const phoneValue = watch("phone_number");

  useEffect(() => {
    if (nameValue && phoneValue) {
      const formattedName = nameValue.trim().replace(/\s+/g, "").toLowerCase();
      const last4Digits = phoneValue.slice(-4);
      setValue("username", `${formattedName}${last4Digits}`);
    }
  }, [nameValue, phoneValue, setValue]);

  return (
    <div className="min-h-screen bg-white">
      <header className="px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-green-600">
          Gaming
        </Link>
      </header>

      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      <main className="flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl">
          {!showRegisterForm ? (
            <>
              <h1 className="text-3xl font-medium text-center text-gray-900 mb-12">
                Join as a Buyer or Seller
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {[
                  {
                    label: "I’m a Buyer, looking to buy gaming IDs",
                    role: UserRole.BUYER,
                  },
                  {
                    label: "I’m a Seller, looking to sell gaming IDs",
                    role: UserRole.SELLER,
                  },
                ].map(({ label, role }) => (
                  <div
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`p-6 cursor-pointer border-2 rounded-lg transition-all duration-200 hover:shadow-md ${
                      selectedRole === role
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedRole === role
                            ? "border-green-500 bg-green-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedRole === role && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {label}
                    </h3>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center">
                <button
                  disabled={selectedRole === null}
                  onClick={() => setShowRegisterForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium text-base mb-4 disabled:opacity-50"
                >
                  {selectedRole === UserRole.BUYER
                    ? "Join as a Buyer"
                    : selectedRole === UserRole.SELLER
                    ? "Join as a Seller"
                    : "Select Role"}
                </button>

                <p className="text-gray-600 text-sm">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Log In
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-medium text-center text-gray-900 mb-12">
                {selectedRole === UserRole.BUYER
                  ? "Join as a Buyer"
                  : selectedRole === UserRole.SELLER
                  ? "Join as a Seller"
                  : "Join"}
              </h1>
              {errorMessage && (
                <p className="text-red-500 text-sm mb-4 text-center">
                  {errorMessage}
                </p>
              )}

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-8 space-y-4"
              >
                <input
                  {...register("name")}
                  type="text"
                  placeholder="Enter your name"
                  className={`w-full border px-4 py-2 rounded ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}

                <input
                  {...register("store_name")}
                  type="text"
                  placeholder="Enter your Store name"
                  className={`w-full border px-4 py-2 rounded ${
                    errors.store_name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}

                {/* Phone Number Field */}
                <input
                  {...register("phone_number")}
                  type="text"
                  placeholder="Enter your phone number"
                  className={`w-full border px-4 py-2 rounded ${
                    errors.phone_number ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.phone_number && (
                  <p className="text-sm text-red-500">
                    {errors.phone_number.message}
                  </p>
                )}

                <input
                  {...register("username")}
                  type="text"
                  placeholder="Enter a unique username"
                  readOnly
                  className={`w-full border px-4 py-2 rounded ${
                    errors.username ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.username && (
                  <p className="text-sm text-red-500">
                    {errors.username.message}
                  </p>
                )}

                <input
                  {...register("email")}
                  type="email"
                  placeholder="Enter your email"
                  className={`w-full border px-4 py-2 rounded ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}

                <input
                  {...register("password")}
                  type="password"
                  placeholder="Password (8 or more characters)"
                  className={`w-full border px-4 py-2 rounded ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}

                <input
                  {...register("password_confirmation")}
                  type="password"
                  placeholder="Confirm Password"
                  className={`w-full border px-4 py-2 rounded ${
                    errors.password_confirmation
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.password_confirmation && (
                  <p className="text-sm text-red-500">
                    {errors.password_confirmation.message}
                  </p>
                )}

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    {...register("terms")}
                    className="mt-1 mr-2"
                  />
                  <label className="text-sm text-gray-700">
                    Yes, I understand and agree to the{" "}
                    <Link href="#" className="text-green-600 underline">
                      Gamer Terms of Service
                    </Link>
                    , including the{" "}
                    <Link href="#" className="text-green-600 underline">
                      User Agreement
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="text-green-600 underline">
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>
                {errors.terms && (
                  <p className="text-sm text-red-500">{errors.terms.message}</p>
                )}

                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded w-full"
                >
                  Create my account
                </button>

                <p className="text-center text-sm text-gray-600 mt-4">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-green-600 hover:underline font-medium"
                  >
                    Log In
                  </Link>
                </p>
              </form>

              <button
                onClick={() => {
                  setShowRegisterForm(false);
                  reset();
                }}
                className="mt-4 text-sm text-gray-600 underline"
              >
                ← Back to role selection
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
