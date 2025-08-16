"use client";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import axios from "../../../../../utils/axios";
import Modal from "@/components/(sheared)/Modal";
import ErrorMessage from "@/components/(sheared)/ErrorMessage";
import React from "react";
import SuccessMessage from "@/components/(sheared)/SuccessMessage";
import { getCSRF } from "../../../../../utils/auth";
import { useLoader } from "@/context/LoaderContext";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import Image from "next/image";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const SUPPORTED_FORMATS = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const schema = yup.object({
  name: yup.string().required("Name is required").min(2).max(50),
  description: yup.string().required("Description is required").max(300),
  primary_image: yup
    .mixed()
    .test("fileSize", "Primary image must be less than 8MB.", (file) => {
      if (!file) return true;
      if (typeof file === "string") return true;
      if (file instanceof File) return file.size <= MAX_FILE_SIZE;
      return true;
    })
    .test("fileType", "Unsupported format", (file) => {
      if (!file) return true;
      if (typeof file === "string") return true;
      if (file instanceof File) return SUPPORTED_FORMATS.includes(file.type);
      return true;
    }),
  secondary_image: yup
    .mixed()
    .test("fileSize", "Secondary image must be less than 8MB.", (file) => {
      if (!file) return true;
      if (typeof file === "string") return true;
      if (file instanceof File) return file.size <= MAX_FILE_SIZE;
      return true;
    })
    .test("fileType", "Unsupported format", (file) => {
      if (!file) return true;
      if (typeof file === "string") return true;
      if (file instanceof File) return SUPPORTED_FORMATS.includes(file.type);
      return true;
    }),

  status: yup.boolean().required("Status is required"),
});

type FormData = yup.InferType<typeof schema>;

type Game = {
  id: number;
  name: string;
  description: string;
  primary_image: string | null;
  secondary_image: string | null;
  status: boolean;
};

function AdminPlacementManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormSubmit, setIsFormSubmit] = useState(false);
  const [selectedPlacement, setSelectedPlacement] = useState<Game | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [previewPrimary, setPreviewPrimary] = useState<string | null>(null);
  const [previewSecondary, setPreviewSecondary] = useState<string | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const { showLoader, hideLoader } = useLoader();
  const router = useRouter();

  const basePath = process.env.NEXT_PUBLIC_UPLOAD_BASE;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { status: true },
  });

  const onDetail = (game: Game) => {
    router.push(`/dashboard/games-detail/${game.id}`);
  };

  useEffect(() => {
    getGames();
  }, []);

  const getGames = async () => {
    showLoader();
    try {
      const response = await axios.get("/api/games-all");
      setGames(response.data.games);
    } catch (error) {
      console.error(error);
      setErrorMessage("Please try again");
    } finally {
      hideLoader();
    }
  };

  // Open form modal
  const openModal = (game: Game | null = null) => {
    setSelectedPlacement(game);

    if (game) {
      setValue("name", game.name);
      setValue("description", game.description);
      setValue("status", game.status);
      setValue("primary_image", game.primary_image ?? "");
      setValue("secondary_image", game.secondary_image ?? "");
      setPreviewPrimary(`${baseUrl}${game.primary_image}`);
      setPreviewSecondary(
        game.secondary_image ? `${baseUrl}${game.secondary_image}` : null
      );
    } else {
      reset({ status: true });
      setPreviewPrimary(null);
      setPreviewSecondary(null);
    }
    setIsModalOpen(true);
  };

  // Form submit
  const onSubmit = async (data: FormData) => {
    showLoader();
    setIsFormSubmit(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("description", data.description ?? "");
      formData.append("status", data.status ? "1" : "0");

      if (data.primary_image && data.primary_image instanceof File) {
        formData.append("primary_image", data.primary_image);
      }

      if (data.secondary_image && data.secondary_image instanceof File) {
        formData.append("secondary_image", data.secondary_image);
      }

      await getCSRF();

      if (selectedPlacement) {
        formData.append("_method", "PUT");
        await axios.post(`/api/games/${selectedPlacement.id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        });
      } else {
        await axios.post("/api/games", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        });
      }

      setSuccessMessage("Game saved successfully!");
      getGames();
      reset({ status: true });
      setPreviewPrimary(null);
      setPreviewSecondary(null);
      setIsModalOpen(false);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;

      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Please try again.");
      }
    } finally {
      setIsFormSubmit(false);
      hideLoader();
    }
  };

  // Delete
  const confirmDelete = (game: Game) => {
    setSelectedPlacement(game);
    setIsDeleteModalOpen(true);
  };
  const handleDelete = async () => {
    showLoader();
    try {
      if (selectedPlacement) {
        await axios.delete(`/api/games/${selectedPlacement.id}`);
        setSuccessMessage("Placement deleted successfully!");
        getGames();
        setIsDeleteModalOpen(false);
      }
    } catch {
      setErrorMessage("Please try again");
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="z-[999]">
      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      <div className="space-y-8">
        {/* Placement Header */}
        <div className="p-6 bg-zinc-50 dark:bg-neutral-900 rounded-2xl shadow flex items-center justify-between mb-6 border border-zinc-200 dark:border-neutral-700">
          <h3 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 tracking-tight">
            Games
          </h3>
          <button
            onClick={() => openModal(null)}
            className="rounded bg-zinc-700 dark:bg-zinc-800 text-white px-4 py-2 font-medium hover:bg-zinc-900 dark:hover:bg-zinc-700 transition shadow focus:outline-none"
          >
            <span className="text-xl align-middle">＋</span> Add Games
          </button>
        </div>

        {/* Table */}
        <div className="overflow-auto rounded-lg shadow border border-zinc-300 dark:border-neutral-700 bg-white dark:bg-neutral-950">
          <table className="w-full min-w-[900px] text-sm text-left">
            <thead className="bg-zinc-100 dark:bg-neutral-800 uppercase text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <tr>
                <th className="px-6 py-3 whitespace-nowrap">S.No.</th>
                <th className="px-6 py-3 whitespace-nowrap">Primary Image</th>
                <th className="px-6 py-3 whitespace-nowrap">Secondary Image</th>
                <th className="px-6 py-3 whitespace-nowrap">Name</th>
                <th className="px-6 py-3 whitespace-nowrap">Description</th>
                <th className="px-6 py-3 whitespace-nowrap">Status</th>
                <th className="px-6 py-3 whitespace-nowrap text-end">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-neutral-700">
              {games.length ? (
                games.map((game, index) => (
                  <tr
                    key={game.id}
                    className="bg-white dark:bg-neutral-950 hover:bg-zinc-50 dark:hover:bg-neutral-900 transition"
                  >
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-200">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      {game.primary_image ? (
                        <Image
                          src={`${basePath}${game.primary_image}`}
                          alt={game.name}
                          width={600}
                          height={600}
                          className="h-14 w-14 object-cover rounded border border-zinc-300 dark:border-neutral-700 shadow-sm"
                        />
                      ) : (
                        <span className="text-xs text-zinc-400 italic">
                          No Image
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {game.secondary_image ? (
                        <Image
                          src={`${basePath}${game.secondary_image}`}
                          alt={game.name}
                          width={600}
                          height={600}
                          className="h-14 w-14 object-cover rounded border border-zinc-300 dark:border-neutral-700 shadow-sm"
                        />
                      ) : (
                        <span className="text-xs text-zinc-400 italic">
                          No Image
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-100">
                      {game.name}
                    </td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-300">
                      {game.description}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded text-xs font-semibold 
                    ${
                      game.status
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                    }
                  `}
                      >
                        {game.status ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-end space-x-1">
                      <button
                        onClick={() => openModal(game)}
                        className="inline-flex items-center gap-1 rounded-md bg-zinc-500 px-3 py-1.5 text-xs text-white hover:bg-zinc-600 shadow focus:outline-none"
                      >
                        {/* Pencil icon */}
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="inline"
                        >
                          <path
                            d="M4 13V11M8 13v-6M12 13v-3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(game)}
                        className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-3 py-1.5 text-xs text-white hover:bg-rose-700 shadow focus:outline-none"
                      >
                        {/* Trash icon */}
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="inline"
                        >
                          <path
                            d="M6 12h4M4 4h8l-1 10H5L4 4zm2-2h4v2H6V2z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Delete
                      </button>
                      <button
                        onClick={() => onDetail(game)}
                        className="inline-flex items-center gap-1 rounded-md bg-zinc-700 px-3 py-1.5 text-xs text-white hover:bg-zinc-900 shadow focus:outline-none"
                      >
                        {/* Eye icon */}
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="inline"
                        >
                          <circle cx="8" cy="8" r="6" />
                          <path
                            d="M8 6v2l1 1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center text-zinc-400 dark:text-neutral-500 font-medium py-8 italic"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        width="48"
                        height="48"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <ellipse cx="24" cy="40" rx="16" ry="3" fill="#eee" />
                        <rect
                          x="14"
                          y="14"
                          width="20"
                          height="14"
                          rx="5"
                          fill="#E5E7EB"
                        />
                        <rect
                          x="16"
                          y="17"
                          width="16"
                          height="2"
                          rx="1"
                          fill="#D1D5DB"
                        />
                        <rect
                          x="16"
                          y="21"
                          width="12"
                          height="2"
                          rx="1"
                          fill="#D1D5DB"
                        />
                      </svg>
                      <span className="text-sm">No Games Found</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset({ status: true });
          setPreviewPrimary(null);
          setPreviewSecondary(null);
        }}
        title={selectedPlacement ? "Edit Game" : "Add Game"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Name<span className="text-red-600">*</span>
            </label>
            <input
              id="name"
              {...register("name")}
              type="text"
              placeholder="Enter Name"
              className="w-full rounded-xl border border-solid border-zinc-200 bg-white px-4 py-3.5 text-sm dark:border-neutral-600 dark:bg-neutral-900 dark:text-white"
            />
            <p className="text-sm text-red-500">{errors.name?.message}</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium">
              Description<span className="text-red-600">*</span>
            </label>
            <input
              id="description"
              {...register("description")}
              type="text"
              placeholder="Enter Description"
              className="w-full rounded-xl border border-solid border-zinc-200 bg-white px-4 py-3.5 text-sm dark:border-neutral-600 dark:bg-neutral-900 dark:text-white"
            />
            <p className="text-sm text-red-500">
              {errors.description?.message}
            </p>
          </div>

          {/* Primary Image */}
          <div>
            <label className="block text-sm font-medium">Primary Image</label>
            <input
              type="file"
              accept={SUPPORTED_FORMATS.join(",")}
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setValue("primary_image", file || "");
                setPreviewPrimary(file ? URL.createObjectURL(file) : null);
              }}
            />
            {errors.primary_image && (
              <p className="text-xs text-red-500">
                {errors.primary_image.message}
              </p>
            )}
            {previewPrimary && (
              <Image
                src={previewPrimary}
                width={600}
                height={600}
                alt="Primary Preview"
                className="mt-2 h-24 w-24 rounded object-cover border"
              />
            )}
          </div>

          {/* Secondary Image */}
          <div>
            <label className="block text-sm font-medium">Secondary Image</label>
            <input
              type="file"
              accept={SUPPORTED_FORMATS.join(",")}
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setValue("secondary_image", file || "");
                setPreviewSecondary(file ? URL.createObjectURL(file) : null);
              }}
            />
            {errors.secondary_image && (
              <p className="text-xs text-red-500">
                {errors.secondary_image.message}
              </p>
            )}
            {previewSecondary && (
              <Image
                src={previewSecondary}
                width={600}
                height={600}
                alt="Secondary Preview"
                className="mt-2 h-24 w-24 rounded object-cover border"
              />
            )}
          </div>

          {/* Status toggle */}
          {/* <div className="flex items-center gap-2">
            <label htmlFor="status" className="flex items-center">
              <input type="checkbox" {...register('status')} id="status" className="mr-2" checked={isChecked} onChange={() => setValue('status', !isChecked)} />
              <span>Status</span>
            </label>
          </div> */}

          {/* Status Toggle */}
          <div>
            <label
              htmlFor="status"
              className="flex items-center gap-3 cursor-pointer"
            >
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Status
              </span>
              <div
                className={`
        flex items-center h-6 w-12 rounded-full
        border border-zinc-300 dark:border-zinc-700
        transition-all duration-200
        ${
          watch("status")
            ? "bg-green-600 dark:bg-green-700"
            : "bg-zinc-200 dark:bg-zinc-800"
        }
      `}
              >
                <input
                  type="checkbox"
                  {...register("status")}
                  hidden
                  id="status"
                />
                <div
                  className={`
          h-5 w-5 rounded-full bg-white shadow-md transition-all
          ${watch("status") ? "translate-x-6" : "translate-x-0"}
        `}
                ></div>
              </div>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`w-full rounded-lg p-3 text-white ${
              isFormSubmit
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            disabled={isFormSubmit}
          >
            {isFormSubmit ? "Saving..." : "Save"}
          </button>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        width="max-w-xl"
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
      >
        <p>Are you sure you want to delete {selectedPlacement?.name}?</p>
        <div className="mt-4 flex justify-end space-x-4">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="rounded bg-gray-500 px-4 py-2 text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="rounded bg-red-500 px-4 py-2 text-white"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default AdminPlacementManagement;
