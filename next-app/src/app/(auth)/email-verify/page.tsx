"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import axios from "../../../../utils/axios";
import { useAuth } from "@/context/AuthContext";
import SuccessMessage from "@/components/(sheared)/SuccessMessage";
import { AxiosError } from "axios";

const schema = yup.object().shape({
  code: yup.string().required("Verification code is required"),
});

interface FormData {
  code: string;
}

export default function EmailVerifyPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem("verifyEmail");
    setEmail(savedEmail);
  }, []);

  const onSubmit = async (data: FormData) => {
    if (!email) {
      setServerError("Email not found in storage");
      return;
    }

    try {
      setServerError(null);
      const res = await axios.post("/verify-email-code", {
        email,
        code: data.code,
      });

      setSuccess(res.data.message);
      setSuccessMessage(res.data.message);
      localStorage.removeItem("verifyEmail");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;

      setServerError(error.response?.data?.message || "Verification failed");
    }
  };

  return (
    <>
      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      <div className="max-w-md mx-auto mt-80 p-6 bg-white ">
        <h1 className="text-2xl font-bold text-center mb-4">
          Verify Your Email
        </h1>

        {success && <p className="text-green-600 mb-4">{success}</p>}
        {serverError && <p className="text-red-600 mb-4">{serverError}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="text"
            placeholder="Enter 6-digit code"
            {...register("code")}
            className="w-full border border-gray-300 p-2 rounded"
          />
          {errors.code && (
            <p className="text-red-600 text-sm">{errors.code.message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition"
          >
            {isSubmitting ? "Verifying..." : "Verify Email"}
          </button>
        </form>
      </div>
    </>
  );
}
