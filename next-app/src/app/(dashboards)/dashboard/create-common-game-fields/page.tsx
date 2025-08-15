"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import axios from "../../../../../utils/axios";
import Modal from "@/components/(sheared)/Modal";
import ErrorMessage from "@/components/(sheared)/ErrorMessage";
import SuccessMessage from "@/components/(sheared)/SuccessMessage";
import { getCSRF } from "../../../../../utils/auth";
import { useLoader } from "@/context/LoaderContext";
import { AxiosError } from "axios";
import Image from "next/image";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const SUPPORTED_FORMATS = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

type FormData = yup.InferType<typeof schema>;

const schema = yup.object({
  name: yup.string().required("Name is required").min(2).max(50),
  icon_image: yup
    .mixed<File | string>()
    .required("Icon image is required") // ✅ required
    .test("fileSize", "Icon image must be less than 8MB.", (file) => {
      if (typeof file === "string") return true;
      if (file instanceof File) return file.size <= MAX_FILE_SIZE;
      return false;
    })
    .test("fileType", "Unsupported format", (file) => {
      if (typeof file === "string") return true;
      if (file instanceof File) return SUPPORTED_FORMATS.includes(file.type);
      return false;
    }),
  type: yup.string().oneOf(["number", "text"]).required("Please select a type"),
});

type GameCommonFieldType = {
  id: number;
  name: string;
  icon_image: string | File | unknown;
  description: string;
  type: "text" | "number";
};

function GameCommonField() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormSubmit, setIsFormSubmit] = useState(false);
  const [selectedPlacement, setSelectedPlacement] =
    useState<GameCommonFieldType | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [previewPrimary, setPreviewPrimary] = useState<string | null>(null);
  const [games, setGames] = useState<GameCommonFieldType[]>([]);
  const { showLoader, hideLoader } = useLoader();
  const baseUrl = "http://localhost:8000/storage/";

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      type: "number",
    },
  });

  const getGames = useCallback(async () => {
    showLoader();
    try {
      const response = await axios.get("/api/games-field-assets");
      setGames(response.data.games);
    } catch {
      setErrorMessage("Please try again");
    } finally {
      hideLoader();
    }
  }, [showLoader, hideLoader]);

  useEffect(() => {
    getGames();
  }, []);

  const openModal = (game: GameCommonFieldType | null = null) => {
    setSelectedPlacement(game);

    if (game) {
      setValue("name", game.name);
      setValue("type", game.type);
      setPreviewPrimary(
        game.icon_image ? `${baseUrl}${game.icon_image}` : null
      );
    } else {
      reset({
        name: "",
        type: "number",
        icon_image: "",
      });
      setPreviewPrimary(null);
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    showLoader();
    setIsFormSubmit(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("type", data.type);

      if (data.icon_image && data.icon_image instanceof File) {
        formData.append("icon_image", data.icon_image);
      }
      await getCSRF();
      if (selectedPlacement) {
        formData.append("_method", "PUT");
        await axios.post(
          `/api/games-field-assets/${selectedPlacement.id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );
      } else {
        await axios.post("/api/games-field-assets", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
      }

      setSuccessMessage("Game saved successfully!");
      getGames();
      reset({
        name: "",
        type: "number",
        icon_image: "",
      });
      setPreviewPrimary(null);
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

  const confirmDelete = (game: GameCommonFieldType) => {
    setSelectedPlacement(game);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    showLoader();
    try {
      if (selectedPlacement) {
        await axios.delete(`/api/games-field-assets/${selectedPlacement.id}`);
        setSuccessMessage("Field deleted successfully!");
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

        <div className="overflow-auto rounded-lg shadow border border-zinc-300 dark:border-neutral-700 bg-white dark:bg-neutral-950">
          <table className="w-full min-w-[900px] text-sm text-left">
            <thead className="bg-zinc-100 dark:bg-neutral-800 uppercase text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <tr>
                <th className="px-6 py-3 whitespace-nowrap">S.No.</th>
                <th className="px-6 py-3 whitespace-nowrap">Primary Image</th>
                <th className="px-6 py-3 whitespace-nowrap">Name</th>
                <th className="px-6 py-3 whitespace-nowrap">Type</th>
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
                      {game.icon_image ? (
                        <Image
                          src={`http://localhost:8000/storage/${game.icon_image}`}
                          alt={game.name}
                          width={56}
                          height={56}
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
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-100 capitalize">
                      {game.type}
                    </td>
                    <td className="px-6 py-4 text-end space-x-1">
                      <button
                        onClick={() => openModal(game)}
                        className="inline-flex items-center gap-1 rounded-md bg-zinc-500 px-3 py-1.5 text-xs text-white hover:bg-zinc-600 shadow focus:outline-none"
                      >
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
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset({
            name: "",
            type: "number",
            icon_image: "",
          });
          setPreviewPrimary(null);
        }}
        title={selectedPlacement ? "Edit Game" : "Add Game"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

          <div>
            <label className="block text-sm font-medium">
              Type<span className="text-red-600">*</span>
            </label>
            <div className="flex gap-4 mt-1">
              <label className="inline-flex items-center">
                <input type="radio" value="text" {...register("type")} />
                <span className="ml-2">Text</span>
              </label>
              <label className="inline-flex items-center">
                <input type="radio" value="number" {...register("type")} />
                <span className="ml-2">Number</span>
              </label>
            </div>
            <p className="text-sm text-red-500">{errors.type?.message}</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Icon Image</label>
            <input
              type="file"
              accept={SUPPORTED_FORMATS.join(",")}
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setValue("icon_image", file!);
                setPreviewPrimary(file ? URL.createObjectURL(file) : null);
              }}
            />
            <p className="text-xs text-red-500">{errors.icon_image?.message}</p>

            {previewPrimary && (
              <Image
                src={previewPrimary}
                alt="Preview"
                width={96}
                height={96}
                className="mt-2 rounded object-cover border border-zinc-300"
              />
            )}
          </div>

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

export default GameCommonField;
