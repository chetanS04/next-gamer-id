"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "../../../../../utils/axios";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { Game, GameField } from "@/common/interface";

interface IFormValues {
  [key: string]: string | number | FileList | undefined;
}

const GameForm = () => {
  const { id } = useParams();
  const [fields, setFields] = useState<GameField[]>([]);
  const [gameName, setGameName] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");


  const validationSchema = React.useMemo(() => {
    const shape: { [key: string]: yup.AnySchema } = {};

    fields.forEach((field) => {
      let validator =
        field.type === "number"
          ? yup.number().typeError("Must be a number")
          : yup.string();

      if (field.required !== false) {
        validator = validator.required("This field is required");
      }
      shape[field.label] = validator;
    });

    // Price validation
    shape["price"] = yup
      .number()
      .typeError("Price must be a number")
      .required("Price is required");

    // File validation for images (max 5MB, jpeg/png/jpg formats)
    const fileSchema = yup
      .mixed()
      .test("fileSize", "Image too large (max 5MB)", (value) => {
        if (!value) return true;
        if (!(value instanceof FileList)) return false;
        return value.length === 0 || value[0]?.size <= 5 * 1024 * 1024;
      })
      .test(
        "fileFormat",
        "Unsupported format (jpeg, jpg, png only)",
        (value) => {
          if (!value) return true;
          if (!(value instanceof FileList)) return false;
          return (
            value.length === 0 ||
            ["image/jpeg", "image/png", "image/jpg"].includes(value[0]?.type)
          );
        }
      );

    shape["image1"] = fileSchema.required("Image 1 is required");
    shape["image2"] = fileSchema.required("Image 2 is required");
    shape["image3"] = fileSchema.required("Image 3 is required");

    return yup.object().shape(shape);
  }, [fields]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<IFormValues>({
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
  });

  // Fetch dynamic fields and game name on mount
  useEffect(() => {
    const fetchFields = async () => {
      setFetchError("");
      setLoading(true);
      try {
        const [{ data: fieldData }, { data: gamesData }] = await Promise.all([
          axios.get(`/api/games/${id}/fields`),
          axios.get(`/api/games`),
        ]);
        const dynamicFields = fieldData.fields || [];
        setFields(dynamicFields);

        // const game = (gamesData.games || []).find((g: FormData) => g.id == id);

        const game = gamesData.games?.find((g: Game) => String(g.id) === id);

        if (game) setGameName(game.name);
      } catch {
        setFetchError("Failed to fetch form definitions. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchFields();
  }, [id]);

  // Submit handler: build FormData properly
  const onSubmit: SubmitHandler<IFormValues> = async (data) => {
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const formData = new FormData();

      // Add dynamic fields (key = game_field_id, value = value)
      fields.forEach((field) => {
        const value = data[field.label];
        if (value !== undefined && !(value instanceof FileList)) {
          formData.append(String(field.id), String(value));
        }
      });

      // Append static fields
      formData.append("price", String(data.price));
      formData.append("game_id", String(id)); // Required by backend
      formData.append("status", "active"); // You can make this dynamic if needed

      // Append images
      (["image1", "image2", "image3"] as const).forEach((imgKey) => {
        const fileList = data[imgKey];
        if (fileList instanceof FileList && fileList.length > 0) {
          formData.append(imgKey, fileList[0]);
        }
      });

      // Submit to backend
      await axios.post(`/api/games/${id}/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubmitSuccess("Game details submitted successfully!");
      reset();
    } catch {
      // const error = err as AxiosError<{ message?: string }>;

      setSubmitError("Failed to submit game details. Please try again.");
    }
  };

  // Render image preview helper
  const renderPreview = (fileList: FileList | undefined) => {
    if (fileList && fileList.length > 0) {
      const url = URL.createObjectURL(fileList[0]);
      return (
        <Image
          src={url}
          alt="preview"
          height={600}
          width={600}
          className="mt-2 max-h-[18.75rem] h-full rounded-2xl border border-white/30 object-contain shadow-glow"
          onLoad={() => URL.revokeObjectURL(url)}
        />
      );
    }
    return null;
  };

  return (
    <div className="lg:p-8 p-2 bg-gc-600 relative overflow-hidden">
      <div className="container bg-gc-900 rounded-2xl py-5 lg:!px-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 drop-shadow-glow gaming-font select-none">
          {gameName ? `List your game: ${gameName}` : "Loading game..."}
        </h1>
        <p className="text-sm text-white mb-8 tracking-wide">
          Fill in the details below to list your game for sale.
        </p>

        <div>
          {" "}
          {/* Error/success messages */}
          {fetchError && (
            <div className="mb-6 text-sm text-red-400 bg-red-900/70 border border-red-600 px-4 py-2 rounded-lg font-semibold shadow-glow-red">
              {fetchError}
            </div>
          )}
          {submitSuccess && (
            <div className="mb-6 text-sm text-green-400 bg-green-900/70 border border-green-600 px-4 py-2 rounded-lg font-semibold shadow-glow-green">
              {submitSuccess}
            </div>
          )}
          {submitError && (
            <div className="mb-6 text-sm text-red-400 bg-red-900/70 border border-red-600 px-4 py-2 rounded-lg font-semibold shadow-glow-red">
              {submitError}
            </div>
          )}
        </div>

        {loading ? (
          <div className="animate-pulse text-center py-20 text-white text-lg font-semibold">
            Loading form fields...
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            <div className="flex flex-wrap justify-center items-stretch gap-6">
              {/* Dynamic fields except images and price */}
              {fields
                .filter(
                  (field) =>
                    !["image1", "image2", "image3", "price"].includes(
                      field.label
                    )
                )
                .map((field) => (
                  <div key={field.id} className="flex-[1_1_18.75rem] max-w-[]">
                    <label className=" text-white font-semibold mb-4 gaming-font select-none flex justify-start items-center gap-3">
                      {/* Icon or fallback */}
                      <span className="block h-10 w-10">
                        {field.icon ? (
                          <Image
                            height={600}
                            width={600}
                            src={`http://localhost:8000/storage/${field.icon}`}
                            alt={field?.label}
                            className="h-10 w-10 object-contain drop-shadow drop-shadow-orange-950"
                          />
                        ) : (
                          <div className="h-10 w-10 flex items-center justify-center text-white bg-gray-800 rounded border border-gray-500 shadow">
                            <FontAwesomeIcon
                              icon={faStar}
                              className="text-xl"
                            />
                          </div>
                        )}
                      </span>
                      <span className="capitalize">
                        {field.label}
                        <span className="text-orange-400 ml-1">
                          {field.required !== false && "*"}
                        </span>
                      </span>
                    </label>
                    <input
                      type={field.type}
                      {...register(field.label)}
                      min={field.type === "number" ? 0 : undefined}
                      autoComplete="off"
                      placeholder={`Enter ${field.label}`}
                      className={`w-full flex justify-start items-center h-[55px] px-5 rounded-xl bg-gc-600 text-white border-1 border-white/20
                  focus:outline-none focus:border-white shadow-glowxxxxx
                  transition-colors duration-300 ${
                    errors[field.label]
                      ? "!border-red-400 focus:border-red-400"
                      : ""
                  }`}
                      spellCheck={false}
                      autoCorrect="off"
                      autoCapitalize="none"
                    />
                    {errors[field.label] && (
                      <p className="text-base text-red-300 mt-1 font-light">
                        {errors[field.label]?.message as string}
                      </p>
                    )}
                  </div>
                ))}
            </div>

            {/* Price field */}
            <div>
              <label className="block text-white font-bold mb-1 gaming-font select-none">
                💲 Price
                <span className="text-gray-500 ml-1">*</span>
              </label>
              <input
                type="number"
                step="any"
                min={0}
                {...register("price")}
                placeholder="Enter price (INR)"
                className={`!appearance-[textfield] w-full flex justify-start items-center h-[55px] px-5 rounded-xl bg-gc-600 text-white border-1 border-white/20
                  focus:outline-none focus:border-white shadow-glowxxxxx
                  transition-colors duration-300 ${
                    errors.price ? "!border-red-400 focus:border-red-400" : ""
                  }`}
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="none"
              />
              {errors.price && (
                <p className="text-base text-red-300 mt-1 font-light">
                  {errors.price.message as string}
                </p>
              )}
            </div>

            {/* Image Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {["image1", "image2", "image3"].map((key) => (
                <div key={key}>
                  <label className="block text-white mb-1 font-semibold gaming-font select-none">
                    {key.replace("image", "Image ")}
                    <span className="text-gray-500 ml-1">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    {...register(key)}
                    className={`w-full flex justify-start items-center h-[55px] px-5 py-3.5 rounded-xl bg-gc-600 text-white border-1 border-white/20
                  focus:outline-none focus:border-white shadow-glowxxxxx
                  transition-colors duration-300 ${
                    errors[key] ? "!border-red-400 focus:border-red-400" : ""
                  }`}
                  />
                  {errors[key] && (
                    <p className="text-base text-red-300 mt-1 font-light">
                      {errors[key]?.message as string}
                    </p>
                  )}
                  {renderPreview(watch(key) as FileList | undefined)}
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex justify-between items-center pt-6">
              <button
                type="button"
                onClick={() => history.back()}
                className="px-8 py-3 h-[52px] font-extrabold text-lg rounded-2xl bg-gradient-to-r from-gc-600 via-gc-600 to-gc-900 text-white shadow-lg hover:scale-105 transform transition-transform duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-glow"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 h-[52px] font-extrabold text-lg rounded-2xl bg-gradient-to-r from-gc-600 via-gc-600 to-gc-900 text-white shadow-lg hover:scale-105 transform transition-transform duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-glow"
              >
                {isSubmitting ? "Submitting..." : "Submit Listing"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default GameForm;
