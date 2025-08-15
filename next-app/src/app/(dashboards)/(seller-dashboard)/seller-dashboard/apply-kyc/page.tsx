"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLoader } from "@/context/LoaderContext";
import ErrorMessage from "@/components/(sheared)/ErrorMessage";
import SuccessMessage from "@/components/(sheared)/SuccessMessage";
import { getCSRF } from "../../../../../../utils/auth";
import axios from "../../../../../../utils/axios";
import { AxiosError } from "axios";
import Image from "next/image";

type FormData = {
  video: FileList;
  aadhar: FileList;
  pan: FileList;
  terms?: boolean;
};

type KycData = {
  status: "pending" | "approved" | "rejected" | "referred_back";
  admin_remark?: string | null;
  video_path: string;
  aadhar_path: string;
  pan_path: string;
};

const MAX_VIDEO_SIZE_MB = 30;
const MAX_IMAGE_SIZE_MB = 8;

type FormDatas = yup.InferType<typeof schema>;

const schema = yup.object({
  video: yup
    .mixed<FileList>()
    .required("Video is required")
    .test("fileType", "Please upload a valid video file", (value) => {
      if (!value || value.length === 0) return false; // Ensure boolean
      return value[0].type.startsWith("video/");
    })
    .test(
      "fileSize",
      `Video must be less than ${MAX_VIDEO_SIZE_MB}MB`,
      (value) => {
        if (!value || value.length === 0) return false;
        return value[0].size <= MAX_VIDEO_SIZE_MB * 1024 * 1024;
      }
    ),

  aadhar: yup
    .mixed<FileList>()
    .required("Aadhaar is required")
    .test("fileType", "Image or PDF required", (value) => {
      if (!value || value.length === 0) return false;
      const type = value[0].type;
      return /^image\//.test(type) || type === "application/pdf";
    })
    .test("fileSize", `Aadhaar must be < ${MAX_IMAGE_SIZE_MB}MB`, (value) => {
      if (!value || value.length === 0) return false;
      return value[0].size <= MAX_IMAGE_SIZE_MB * 1024 * 1024;
    }),

  pan: yup
    .mixed<FileList>()
    .required("PAN is required")
    .test("fileType", "Image or PDF required", (value) => {
      if (!value || value.length === 0) return false;
      const type = value[0].type;
      return /^image\//.test(type) || type === "application/pdf";
    })
    .test("fileSize", `PAN must be < ${MAX_IMAGE_SIZE_MB}MB`, (value) => {
      if (!value || value.length === 0) return false;
      return value[0].size <= MAX_IMAGE_SIZE_MB * 1024 * 1024;
    }),

  terms: yup
    .boolean()
    .required("You must accept the terms and conditions")
    .oneOf([true], "You must accept the terms and conditions"),
});

export default function KycForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormDatas>({
    resolver: yupResolver(schema),
  });

  const { showLoader, hideLoader } = useLoader();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [kycData, setKycData] = useState<KycData | null>(null);

  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [aadharPreview, setAadharPreview] = useState<string | null>(null);
  const [panPreview, setPanPreview] = useState<string | null>(null);

  const watchVideo = watch("video");
  const watchAadhar = watch("aadhar");
  const watchPan = watch("pan");

  const basePath =
    process.env.NEXT_PUBLIC_UPLOAD_BASE || "http://localhost:8000/storage/";

  useEffect(() => {
    const fetchKyc = async () => {
      showLoader();
      try {
        const res = await axios.get("/api/kyc-submission-me");
        setKycData(res.data.data);
      } catch {
        setKycData(null);
      } finally {
        hideLoader();
      }
    };
    fetchKyc();
  }, []);

  useEffect(() => {
    if (watchVideo && watchVideo[0]) {
      const file = watchVideo[0];
      if (file.size <= MAX_VIDEO_SIZE_MB * 1024 * 1024) {
        const url = URL.createObjectURL(file);
        setVideoPreview(url);
        return () => URL.revokeObjectURL(url);
      } else {
        setVideoPreview(null);
      }
    }
  }, [watchVideo]);

  useEffect(() => {
    if (watchAadhar && watchAadhar[0]) {
      const file = watchAadhar[0];
      if (
        file.size <= MAX_IMAGE_SIZE_MB * 1024 * 1024 &&
        file.type.startsWith("image/")
      ) {
        const url = URL.createObjectURL(file);
        setAadharPreview(url);
        return () => URL.revokeObjectURL(url);
      } else {
        setAadharPreview(null);
      }
    }
  }, [watchAadhar]);

  useEffect(() => {
    if (watchPan && watchPan[0]) {
      const file = watchPan[0];
      if (
        file.size <= MAX_IMAGE_SIZE_MB * 1024 * 1024 &&
        file.type.startsWith("image/")
      ) {
        const url = URL.createObjectURL(file);
        setPanPreview(url);
        return () => URL.revokeObjectURL(url);
      } else {
        setPanPreview(null);
      }
    }
  }, [watchPan]);

  const onSubmit = async (data: FormData) => {
    showLoader();
    const formData = new FormData();
    formData.append("video", data.video[0]);
    formData.append("aadhar", data.aadhar[0]);
    formData.append("pan", data.pan[0]);

    try {
      await getCSRF?.();

      // 👉 Decide endpoint based on presence of existing KYC
      const endpoint = kycData
        ? "/api/kyc-submission/update"
        : "/api/kyc-submission";

      await axios.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMessage(
        kycData
          ? "KYC resubmitted successfully!"
          : "KYC submitted successfully!"
      );
      reset();

      const res = await axios.get("/api/kyc-submission-me");
      setKycData(res.data.data);
    } catch (err) {
      const error = err as AxiosError<{
        message?: string;
        errors?: Record<string, string[]>;
      }>;

      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors)
          .flat()
          .join(", ");
        setErrorMessage(errorMessages);
      } else {
        setErrorMessage(
          error.response?.data?.message ??
            "Submission failed. Please try again."
        );
      }
    } finally {
      hideLoader();
    }
  };

  // Show KYC form if: not submitted, or rejected, or referback
  const shouldShowForm =
    !kycData ||
    kycData.status === "rejected" ||
    kycData.status === "referred_back";

  return (
    <div className="max-w-5xl mx-auto p-8 rounded-xl">
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

      {shouldShowForm ? (
        <>
          <h2 className="text-3xl font-bold text-center mb-6">
            {kycData ? "Re-submit KYC" : "KYC Submission"}
          </h2>

          {/* Show status & remark if status is referback/rejected */}
          {kycData &&
            (kycData.status === "rejected" ||
              kycData.status === "referred_back") && (
              <div className="p-6 mb-6 max-w-md mx-auto text-center bg-white rounded shadow">
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  KYC Status:{" "}
                  <span
                    className={
                      kycData.status === "rejected"
                        ? "text-red-600 font-bold"
                        : "text-yellow-600 font-bold"
                    }
                  >
                    {kycData.status.toUpperCase()}
                  </span>
                </p>
                {kycData.admin_remark && (
                  <p className="text-sm text-gray-500 italic">
                    Admin Remark: {kycData.admin_remark}
                  </p>
                )}
              </div>
            )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            encType="multipart/form-data"
            className="space-y-6"
          >
            <div>
              <label className="block font-medium mb-1">5-Second Video *</label>
              <input
                type="file"
                accept="video/*"
                {...register("video")}
                className="w-full border p-2 rounded"
              />
              {errors.video && (
                <p className="text-sm text-red-600">{errors.video.message}</p>
              )}
              {videoPreview && (
                <div
                  className="mt-2 rounded max-w-6xl mx-auto border overflow-hidden flex justify-center items-center"
                  style={{ height: "256px" }}
                >
                  <video
                    controls
                    className="object-cover w-full h-full"
                    style={{ maxWidth: "256px", maxHeight: "256px" }}
                  >
                    <source src={videoPreview} />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </div>

            <div>
              <label className="block font-medium mb-1">Aadhaar Card *</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                {...register("aadhar")}
                className="w-full border p-2 rounded"
              />
              {errors.aadhar && (
                <p className="text-sm text-red-600">{errors.aadhar.message}</p>
              )}
              {aadharPreview && (
                <div
                  className="mt-2 rounded max-w-6xl mx-auto border overflow-hidden flex-wrap flex justify-center items-center"
                  style={{ height: "355px" }}
                >
                  <Image
                    height={600}
                    width={600}
                    alt=""
                    src={aadharPreview}
                    className="object-cover w-full h-full"
                    style={{ maxWidth: "600px", maxHeight: "500px" }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block font-medium mb-1">PAN Card *</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                {...register("pan")}
                className="w-full border p-2 rounded"
              />
              {errors.pan && (
                <p className="text-sm text-red-600">{errors.pan.message}</p>
              )}
              {panPreview && (
                <div
                  className="mt-2 rounded max-w-6xl mx-auto border overflow-hidden flex justify-center items-center"
                  style={{ height: "355px" }}
                >
                  <Image
                    alt=""
                    height={600}
                    width={600}
                    src={panPreview}
                    className="object-cover w-full h-full"
                    style={{ maxWidth: "600px", maxHeight: "500px" }}
                  />
                </div>
              )}
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" {...register("terms")} className="mt-1" />
              <label className="text-sm">
                I agree to the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  className="underline text-blue-600"
                >
                  Terms & Conditions
                </a>
                <span className="text-red-500 ml-1">*</span>
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-600">{errors.terms.message}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting
                ? "Submitting..."
                : kycData
                ? "Resubmit KYC"
                : "Submit KYC"}
            </button>
          </form>
        </>
      ) : (
        <>
          <section className="max-w-auto">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-10">
              KYC Details Submitted
            </h2>

            {/* Status + Remark */}
            <div className="p-6 mb-10 max-w-md mx-auto text-center">
              <p className="text-xl font-semibold text-gray-700 mb-2">
                KYC Status:{" "}
                <span
                  className={`${
                    kycData.status === "approved"
                      ? "text-green-600"
                      : kycData.status === "pending"
                      ? "text-yellow-600"
                      : "text-red-600"
                  } font-bold`}
                >
                  {kycData.status.toUpperCase()}
                </span>
              </p>
              {kycData.admin_remark && (
                <p className="text-sm text-gray-500 italic">
                  Admin Remark: {kycData.admin_remark}
                </p>
              )}
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Submitted Video */}
              <div className="rounded-xl p-4 flex flex-col items-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Verification Video
                </h3>
                <div className="aspect-[9/12] w-full rounded-lg overflow-hidden border">
                  <video
                    src={`${basePath}${kycData.video_path}`}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Aadhaar Card */}
              <div className="rounded-xl p-4 flex flex-col items-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Aadhaar Card
                </h3>
                <div className="aspect-[3/4] w-full rounded-lg overflow-hidden border flex items-center justify-center bg-gray-50">
                  {kycData.aadhar_path.endsWith(".pdf") ? (
                    <a
                      href={`${basePath}${kycData.aadhar_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-center"
                    >
                      View Aadhaar PDF
                    </a>
                  ) : (
                    <Image
                      src={`${basePath}${kycData.aadhar_path}`}
                      alt="Aadhaar"
                      height={600}
                      width={600}
                      className="object-contain w-full h-full"
                    />
                  )}
                </div>
              </div>

              {/* PAN Card */}
              <div className="rounded-xl p-4 flex flex-col items-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  PAN Card
                </h3>
                <div className="aspect-[3/4] w-full rounded-lg overflow-hidden border flex items-center justify-center bg-gray-50">
                  {kycData.pan_path.endsWith(".pdf") ? (
                    <a
                      href={`${basePath}${kycData.pan_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-center"
                    >
                      View PAN PDF
                    </a>
                  ) : (
                    <Image
                      src={`${basePath}${kycData.pan_path}`}
                      alt="PAN"
                      height={600}
                      width={600}
                      className="object-contain w-full h-full"
                    />
                  )}
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
