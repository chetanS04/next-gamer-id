

"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z, ZodTypeAny } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "../../../../../utils/axios";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from 'next/image';

// 1. TYPES ---------------------------
type GameField = {
  id: number;
  label: string;
  type: "text" | "number";
  icon?: string;
  required?: boolean;
};

const imageKeys = ["image1", "image2", "image3"] as const;
type ImageKey = typeof imageKeys[number];




function buildSchema(fields: GameField[]) {
  const shape: Record<string, ZodTypeAny> = {};
  // const shape: Record<string, ReturnType<typeof z.string>> = {};


  // Dynamic fields
  for (const field of fields) {
    let validator: ZodTypeAny;

    if (field.type === "number") {
      validator = z.preprocess(
        (v) => (typeof v === "string" && v !== "" ? parseFloat(v) : v),
        z.number().refine((val) => typeof val === "number", { message: "Must be a number" })
      );
    } else {
      validator = z.string();
    }

    if (field.required !== false) {
      validator = validator.refine(
        (val) => val !== undefined && val !== "",
        { message: "This field is required" }
      );
    } else {
      validator = validator.optional();
    }

    shape[field.label] = validator;
  }

  // Static price field
  shape["price"] = z.preprocess(
    (v) => (typeof v === "string" && v !== "" ? parseFloat(v) : v),
    z
      .number().refine((val) => typeof val === "number", { message: "Price must be a number" })
      .min(0, { message: "Price is required" })
  );

  // Static images (fixing names to match your form)
  const fileSchema = z
    .instanceof(FileList)
    .refine((files) => files.length > 0, { message: "Image is required" })
    .refine(
      (files) =>
        ["image/jpeg", "image/png", "image/jpg"].includes(files[0]?.type),
      { message: "Unsupported format (jpeg, jpg, png only)" }
    )
    .refine((files) => files[0]?.size <= 5 * 1024 * 1024, {
      message: "Image too large (max 5MB)",
    });

  ["image1", "image2", "image3"].forEach((key) => {
    shape[key] = fileSchema;
  });

  return z.object(shape);
}


// 3. REACT COMPONENT --------------------------
const GameForm = () => {
  const { id } = useParams();
  const [fields, setFields] = useState<GameField[]>([]);
  const [gameName, setGameName] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");

  // Always build latest Zod schema based on fields
  const formSchema = React.useMemo(() => buildSchema(fields), [fields]);
type IFormValuess = z.infer<ReturnType<typeof buildSchema>>;

  // const {
  //   register,
  //   handleSubmit,
  //   formState: { errors, isSubmitting },
  //   reset,
  //   watch,
  // } = useForm({
  //   resolver: zodResolver(formSchema),
  //   mode: "onBlur",
  // });


  const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
  reset,
  watch,
} = useForm<IFormValuess>({
  resolver: zodResolver(formSchema),
  mode: "onBlur",
});


  


  // Fetch dynamic fields & game info
  useEffect(() => {
    const fetchFields = async () => {
      setFetchError("");
      setLoading(true);
      try {
        const [{ data: fieldData }, { data: gamesData }] = await Promise.all([
          axios.get(`/api/games/${id}/fields`),
          axios.get(`/api/games`),
        ]);
        setFields(fieldData.fields || []);
        const game = (gamesData.games || []).find((g:IFormValuess ) => String(g.id) === String(id));
        if (game && game.name) setGameName(game.name);
      } catch {
        setFetchError("Failed to fetch form definitions. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchFields();
  }, [id]);

  // Submit handler
  const onSubmit = async (data:IFormValuess) => {
    setSubmitError("");
    setSubmitSuccess("");
    try {
      const formData = new FormData();
      // Append dynamic fields (except static ones)
      fields
        .filter(
          (field) =>
            !imageKeys.includes(field.label as ImageKey) && field.label !== "price"
        )
        .forEach((field) => {
          const val = data[field.label];
          if (val !== undefined && typeof val !== "object") {
            formData.append(String(field.id), String(val));
          }
        });
      // Static values
      formData.append("price", String(data["price"]));
      formData.append("game_id", String(id));
      formData.append("status", "active");
      // Images
      imageKeys.forEach((key) => {
        const fileList = data[key];
        if (fileList instanceof FileList && fileList.length > 0) {
          formData.append(key, fileList[0]);
        }
      });

      await axios.post(`/api/games/${id}/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubmitSuccess("Game details submitted successfully!");
      reset();
    } catch {
      setSubmitError("Failed to submit game details. Please try again.");
    }
  };

  // Image preview helper
  const renderPreview = (fileList: FileList | undefined) => {
    if (fileList && fileList.length > 0) {
      const url = URL.createObjectURL(fileList[0]);
      return (
        <Image
          src={url}
          alt="preview"
          className="mt-2 max-h-36 rounded border border-blue-500 object-contain shadow-glow"
          onLoad={() => URL.revokeObjectURL(url)}
          width={200}
          height={200}
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
                            src={`${basePath}${field.icon}`}
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
