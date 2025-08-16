"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import Modal from "@/components/(sheared)/Modal";
import Cropper, { Area } from "react-easy-crop";
import SuccessMessage from "@/components/(sheared)/SuccessMessage";
import ErrorMessage from "@/components/(sheared)/ErrorMessage";
import { Pencil, Trash2 } from "lucide-react";
import axios from "../../../../../utils/axios";
import { getCSRF } from "../../../../../utils/auth";
import { useLoader } from "@/context/LoaderContext";
import getCroppedImg from "../../../../../utils/cropImage";
import Image from "next/image";
import { Slider } from "@/common/interface";

const MAX_FILE_SIZE = 7 * 1024 * 1024;

const basePath = process.env.NEXT_PUBLIC_UPLOAD_BASE;

// type FormData = {
//   title: string;
//   description: string;
// image?: File | string; // ✅ Now optional
//   status: boolean;
// };

// No manual typing: rely on yup.InferType
const schema = yup.object({
  title: yup.string().required().min(2).max(30),
  description: yup.string().required().max(150),
  image: yup
    .mixed<File | string>()
    .notRequired()
    .test("fileSize", "Image size must be less than 8MB.", (value) =>
      !value || typeof value === "string"
        ? true
        : (value as File).size <= MAX_FILE_SIZE
    )
    .test(
      "fileType",
      "Unsupported file format. (jpg, jpeg, png, webp)",
      (value) =>
        !value || typeof value === "string"
          ? true
          : ["image/jpeg", "image/png", "image/webp"].includes(
              (value as File).type
            )
    ),
  status: yup.boolean().default(true),
});
type FormData = yup.InferType<typeof schema>;

export default function SliderManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSlider, setSelectedSlider] = useState<Slider | null>(null);
  const [isFormSubmit, setIsFormSubmit] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  // const [croppedAreaPixels, setCroppedAreaPixels] = useState<Slider | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [sliders, setSliders] = useState([]);
  const { showLoader, hideLoader } = useLoader();

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

  const handleCropSave = async () => {
    if (!cropImageUrl || !croppedAreaPixels) return;
    const croppedBlob = await getCroppedImg(cropImageUrl, croppedAreaPixels);

    const croppedFile = new File(
      [croppedBlob],
      selectedImageFile?.name || "cropped.jpg",
      {
        type: "image/jpeg",
      }
    );
    setValue("image", croppedFile);
    setPreviewImage(URL.createObjectURL(croppedFile));
    setCropModalOpen(false);
  };

  const fetchSliders = async () => {
    showLoader();
    try {
      const response = await axios.get(
        "http://localhost:8000/api/slider-list",
        {
          withCredentials: true,
        }
      );
      setSliders(response.data.data);
    } catch (error) {
      console.error("Failed to fetch sliders:", error);
    } finally {
      hideLoader();
    }
  };
  useEffect(() => {
    fetchSliders();
  }, []);

  const onSubmit = async (data: FormData) => {
    showLoader();
    try {
      setIsFormSubmit(true);

      // Prepare FormData for file upload
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description || "");
      formData.append("status", data.status ? "1" : "0");

      // Append image if new file is selected
      if (data.image && data.image instanceof File) {
        formData.append("image", data.image);
      }

      await getCSRF();
      const response = selectedSlider
        ? await axios.post(`/api/slider/${selectedSlider.id}`, formData)
        : await axios.post(`/api/slider`, formData);

      if (response.data.status === "success") {
        setSuccessMessage(
          `${selectedSlider ? "Updated" : "Created"} slider successfully!`
        );
        fetchSliders();
        setIsModalOpen(false);
        reset();
        setPreviewImage(null);
        setSelectedSlider(null);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setIsFormSubmit(false);
      hideLoader();
    }
  };

  const openModal = (slider: Slider | null = null) => {
    setSelectedSlider(slider);
    if (slider) {
      setValue("title", slider.title);
      setValue("description", slider.description);
      setValue("status", slider.status);
      setPreviewImage(`ht${slider.image}`);
    } else {
      reset();
      setPreviewImage(null);
    }
    setIsModalOpen(true);
  };

  const confirmDelete = (slider: Slider) => {
    setSelectedSlider(slider);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedSlider) return;
    try {
      showLoader();
      await getCSRF();

      const response = await axios.delete(`/api/slider/${selectedSlider.id}`);
      if (response.data.status === "success") {
        setSuccessMessage("Slider deleted successfully!");
        fetchSliders();
        setIsDeleteModalOpen(false);
      } else {
        setErrorMessage("Failed to delete slider.");
      }
    } catch {
      setErrorMessage("Error deleting slider.");
    } finally {
      hideLoader();
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
      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      {/* Header */}
      <div className="space-y-8">
        {/* Header */}
        <div className="p-6 bg-zinc-50 dark:bg-neutral-900 rounded-xl shadow flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 tracking-tight">
            Sliders
          </h2>
          <button
            className="
      rounded 
      bg-zinc-700 dark:bg-zinc-800 
      text-white px-4 py-2
      font-medium
      hover:bg-zinc-900 dark:hover:bg-zinc-700 
      transition 
      focus:outline-none shadow"
            onClick={() => openModal(null)}
          >
            + Add Slider
          </button>
        </div>

        {/* Table */}
        <div className="overflow-auto rounded-lg shadow border border-zinc-300 dark:border-neutral-700 bg-white dark:bg-neutral-950">
          <table className="w-full min-w-[800px] text-sm text-left">
            <thead className="bg-zinc-100 dark:bg-neutral-800 uppercase text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <tr>
                <th className="px-6 py-3 whitespace-nowrap">S.No.</th>
                <th className="px-6 py-3 whitespace-nowrap">Image</th>
                <th className="px-6 py-3 whitespace-nowrap">Title</th>
                <th className="px-6 py-3 whitespace-nowrap">Description</th>
                <th className="px-6 py-3 whitespace-nowrap">Status</th>
                <th className="px-6 py-3 whitespace-nowrap text-end">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-neutral-700">
              {sliders.length > 0 ? (
                sliders.map((slider: Slider, index) => (
                  <tr
                    key={index}
                    className="bg-white dark:bg-neutral-950 hover:bg-zinc-50 dark:hover:bg-neutral-900 transition"
                  >
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-200">
                      {index + 1}
                    </td>
                    <td className="px-2 py-4">
                      {slider?.image ? (
                        <Image
                          src={`${basePath}${slider.image}`}
                          alt={slider?.title}
                          width={160} // equivalent to w-40
                          height={56} // equivalent to h-14
                          className="object-cover rounded border border-zinc-300 dark:border-neutral-700"
                        />
                      ) : (
                        <span className="text-zinc-400 italic">No Image</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-200">
                      {slider.title}
                    </td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                      {slider.description}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          slider.status
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {slider.status ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-end space-x-1">
                      <button
                        onClick={() => openModal(slider)}
                        className="inline-flex items-center gap-1 rounded-md bg-gray-500 px-3 py-1.5 text-xs text-white hover:bg-gray-600 shadow focus:outline-none"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(slider)}
                        className="inline-flex items-center gap-1 rounded-md bg-gray-700 px-3 py-1.5 text-xs text-white hover:bg-gray-1000 shadow focus:outline-none"
                      >
                        <Trash2 className="h-4 w-4" />
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
                    No sliders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Add/Edit Slider Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
          setPreviewImage(null);
        }}
        title={selectedSlider ? "Edit Slider" : "Create Slider"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">
              Title
            </label>
            <input
              type="text"
              {...register("title")}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-neutral-900 px-4 py-2 focus:border-green-500 focus:ring-green-500 focus:ring-2 outline-none text-zinc-800 dark:text-zinc-100 transition"
              placeholder="Enter title"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">
              Description
            </label>
            <input
              type="text"
              {...register("description")}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-neutral-900 px-4 py-2 focus:border-green-500 focus:ring-green-500 focus:ring-2 outline-none text-zinc-800 dark:text-zinc-100 transition"
              placeholder="Enter description"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">
              Image
            </label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="block w-full text-sm text-zinc-500
          file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-lg
          file:bg-zinc-100 dark:file:bg-zinc-700 file:text-zinc-700 dark:file:text-zinc-100
          hover:file:bg-zinc-200 dark:hover:file:bg-zinc-600
          transition"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedImageFile(file);
                  setCropImageUrl(URL.createObjectURL(file));
                  setCropModalOpen(true);
                }
              }}
            />
            {errors.image && (
              <p className="text-red-500 text-xs mt-1">
                {errors.image.message}
              </p>
            )}
          </div>

          {/* Preview */}
          {previewImage && (
            <div>
              <Image
                src={previewImage}
                alt="Preview"
                width={360} // approximate
                height={140}
                className="rounded-lg border border-zinc-300 dark:border-zinc-700 object-cover shadow"
              />
            </div>
          )}

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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isFormSubmit}
            className={`w-full py-2 rounded-lg text-white font-semibold transition
        ${
          isFormSubmit
            ? "bg-zinc-400 cursor-not-allowed"
            : "bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-900"
        }
      `}
          >
            {isFormSubmit ? "Saving..." : "Submit"}
          </button>
        </form>
      </Modal>

      <Modal
        width="max-w-6xl"
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        title="Crop Image"
      >
        <div className="relative w-full h-96 bg-black">
          {cropImageUrl && (
            <Cropper
              image={cropImageUrl}
              crop={crop}
              zoom={zoom}
              aspect={32 / 10}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, cropped) => setCroppedAreaPixels(cropped)}
            />
          )}
        </div>

        <div className="flex items-center gap-4 mt-4 px-4">
          <span className="text-white">Zoom:</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <button
            className="px-4 py-2 bg-gray-600 text-white rounded"
            onClick={() => setCropModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleCropSave}
          >
            Crop & Save
          </button>
        </div>
      </Modal>

      {/* MODAL: Delete confirmation */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Slider"
      >
        <p>
          Are you sure you want to delete{" "}
          <strong>{selectedSlider?.title}</strong>?
        </p>
        <div className="flex justify-end gap-4 mt-4">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="bg-gray-500 px-4 py-2 text-white rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 px-4 py-2 text-white rounded"
          >
            Delete
          </button>
        </div>
      </Modal>
    </>
  );
}
