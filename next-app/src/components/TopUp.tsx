// "use client";

// import React, { useState } from "react";
// import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as Yup from "yup";
// import { object, ObjectSchema } from "yup";
// import axios from "../../utils/axios";

// // ---------- Types ----------
// type PackageInput = {
//   currency_amount: number;
//   price: number;
//   description?: string;
//   sort_order?: number;
// };

// type FormValues = {
//   currency_name: string;
//   currency_image?: FileList; // File upload type
//   packages: PackageInput[];
// };


// type TopupFormProps = {
//   gameId: number;
//   editingTopup?: FormValues & { id: number }; // optional, if editing
//   onSuccess?: () => void;
// };


// // ---------- Yup Validation ----------
// const schema: ObjectSchema<FormValues> = object({
//   currency_name: Yup.string().required("Currency name is required"),
//   currency_image: Yup.mixed<FileList>()
//     .test("fileSize", "Image is too large (max 5MB)", (value) => {
//       if (!value || value.length === 0) return true; // Optional
//       return value[0].size <= 5 * 1024 * 1024;
//     })
//     .test("fileType", "Only images are allowed", (value) => {
//       if (!value || value.length === 0) return true;
//       return ["image/jpeg", "image/png", "image/webp"].includes(value[0].type);
//     }),
//   packages: Yup.array()
//     .of(
//       Yup.object({
//         currency_amount: Yup.number()
//           .typeError("Must be a number")
//           .min(1, "Must be at least 1")
//           .required("Amount is required"),
//         price: Yup.number()
//           .typeError("Must be a number")
//           .min(0, "Price cannot be negative")
//           .required("Price is required"),
//         description: Yup.string().nullable(),
//         sort_order: Yup.number().typeError("Must be a number").nullable(),
//       })
//     )
//     .min(1, "At least one package is required"),
// });

// export default function TopupForm({ gameId, onSuccess }: TopupFormProps) {
//   const [loading, setLoading] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     control,
//     reset,
//     formState: { errors },
//   } = useForm<FormValues>({
//     resolver: yupResolver(schema),
//     defaultValues: {
//       packages: [{ currency_amount: 0, price: 0 }],
//     },
//   });

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "packages",
//   });

//   // Submit handler
//   // const onSubmit: SubmitHandler<FormValues> = async (data) => {
//   //   try {
//   //     setLoading(true);

//   //     const formData = new FormData();
//   //     formData.append("game_id", gameId.toString());
//   //     formData.append("currency_name", data.currency_name);

//   //     if (data.currency_image && data.currency_image[0]) {
//   //       formData.append("currency_image", data.currency_image[0]);
//   //     }

//   //     data.packages.forEach((pkg, index) => {
//   //       formData.append(`packages[${index}][currency_amount]`, pkg.currency_amount.toString());
//   //       formData.append(`packages[${index}][price]`, pkg.price.toString());
//   //       formData.append(`packages[${index}][description]`, pkg.description || "");
//   //       formData.append(`packages[${index}][sort_order]`, pkg.sort_order?.toString() || "0");
//   //     });

//   //     await axios.post("/api/create-topup", formData, {
//   //       headers: { "Content-Type": "multipart/form-data" },
//   //     });

//   //     alert("Top-up packages created successfully!");
//   //     reset();
//   //     onSuccess?.();
//   //   } catch (err) {
//   //     console.error(err);
//   //     alert("Failed to create top-up packages.");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };


//   const onSubmit: SubmitHandler<FormValues> = async (data) => {
//   try {
//     setLoading(true);

//     const formData = new FormData();
//     formData.append("game_id", gameId.toString());
//     formData.append("currency_name", data.currency_name);

//     if (data.currency_image && data.currency_image[0]) {
//       formData.append("currency_image", data.currency_image[0]);
//     }

//     data.packages.forEach((pkg, index) => {
//       formData.append(`packages[${index}][currency_amount]`, pkg.currency_amount.toString());
//       formData.append(`packages[${index}][price]`, pkg.price.toString());
//       formData.append(`packages[${index}][description]`, pkg.description || "");
//       formData.append(`packages[${index}][sort_order]`, pkg.sort_order?.toString() || "0");
//     });

//     if (editingTopup?.id) {
//       formData.append("id", editingTopup.id.toString());
//       // Use your update endpoint instead
//       await axios.post("/api/update-topup", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//     } else {
//       await axios.post("/api/create-topup", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//     }

//     alert(`Top-up packages ${editingTopup ? "updated" : "created"} successfully!`);
//     reset();
//     onSuccess?.();
//   } catch (err) {
//     console.error(err);
//     alert(`Failed to ${editingTopup ? "update" : "create"} top-up packages.`);
//   } finally {
//     setLoading(false);
//   }
// };


//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//       {/* Currency Name */}
//       <div>
//         <label className="block font-semibold mb-1">Currency Name</label>
//         <input
//           type="text"
//           {...register("currency_name")}
//           className="border rounded px-3 py-2 w-full"
//           placeholder="e.g., UC, Diamonds"
//         />
//         {errors.currency_name && (
//           <p className="text-red-500 text-sm">
//             {errors.currency_name.message}
//           </p>
//         )}
//       </div>

//       {/* Currency Image Upload */}
//       <div>
//         <label className="block font-semibold mb-1">Currency Image</label>
//         <input
//           type="file"
//           accept="image/*"
//           {...register("currency_image")}
//           className="border rounded px-3 py-2 w-full"
//         />
//         {errors.currency_image && (
//           <p className="text-red-500 text-sm">
//             {errors.currency_image.message as string}
//           </p>
//         )}
//       </div>

//       {/* Packages */}
//       <div>
//         <h2 className="font-semibold mb-2">Packages</h2>
//         {fields.map((field, index) => (
//           <div
//             key={field.id}
//             className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3 border p-3 rounded"
//           >
//             <div>
//               <input
//                 type="number"
//                 placeholder="Amount"
//                 {...register(`packages.${index}.currency_amount` as const)}
//                 className="border rounded px-3 py-2 w-full"
//               />
//               {errors.packages?.[index]?.currency_amount && (
//                 <p className="text-red-500 text-sm">
//                   {errors.packages[index]?.currency_amount?.message}
//                 </p>
//               )}
//             </div>
//             <div>
//               <input
//                 type="number"
//                 placeholder="Price"
//                 {...register(`packages.${index}.price` as const)}
//                 className="border rounded px-3 py-2 w-full"
//               />
//               {errors.packages?.[index]?.price && (
//                 <p className="text-red-500 text-sm">
//                   {errors.packages[index]?.price?.message}
//                 </p>
//               )}
//             </div>
//             <div>
//               <input
//                 type="text"
//                 placeholder="Description"
//                 {...register(`packages.${index}.description` as const)}
//                 className="border rounded px-3 py-2 w-full"
//               />
//             </div>
//             <div>
//               <input
//                 type="number"
//                 placeholder="Sort Order"
//                 {...register(`packages.${index}.sort_order` as const)}
//                 className="border rounded px-3 py-2 w-full"
//               />
//             </div>
//             <div className="flex items-center">
//               {fields.length > 1 && (
//                 <button
//                   type="button"
//                   onClick={() => remove(index)}
//                   className="bg-red-500 text-white px-3 py-1 rounded"
//                 >
//                   Remove
//                 </button>
//               )}
//             </div>
//           </div>
//         ))}
//         <button
//           type="button"
//           onClick={() =>
//             append({ currency_amount: 0, price: 0, description: "", sort_order: 0 })
//           }
//           className="bg-blue-500 text-white px-4 py-2 rounded"
//         >
//           Add Package
//         </button>
//       </div>

//       {/* Submit */}
//       <div>
//         <button
//           type="submit"
//           disabled={loading}
//           className="bg-green-600 text-white px-6 py-2 rounded"
//         >
//           {loading ? "Saving..." : "Save Packages"}
//         </button>
//       </div>
//     </form>
//   );
// }"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import axios from "../../utils/axios";

// ---------- Types ----------
type PackageInput = {
  currency_amount: number;
  price: number;
  description?: string;
  sort_order?: number;
};

type FormValues = {
  currency_name: string;
  currency_image?: FileList;
  packages: PackageInput[];
};

type TopupFormProps = {
  gameId: number;
  editingTopup?: {
    id: number;
    currency_name: string;
    packages: PackageInput[];
  };
  onSuccess?: () => void;
};

// ---------- Yup Validation ----------
const schema = Yup.object({
  currency_name: Yup.string().required("Currency name is required"),
  currency_image: Yup.mixed<FileList>()
    .test("fileSize", "Image is too large (max 5MB)", (value) => {
      if (!value || value.length === 0) return true;
      return value[0].size <= 5 * 1024 * 1024;
    })
    .test("fileType", "Only images are allowed", (value) => {
      if (!value || value.length === 0) return true;
      return ["image/jpeg", "image/png", "image/webp"].includes(value[0].type);
    }),
  packages: Yup.array()
    .of(
      Yup.object({
        currency_amount: Yup.number()
          .typeError("Must be a number")
          .min(1, "Must be at least 1")
          .required("Amount is required"),
        price: Yup.number()
          .typeError("Must be a number")
          .min(0, "Price cannot be negative")
          .required("Price is required"),
        description: Yup.string().nullable(),
        sort_order: Yup.number().typeError("Must be a number").nullable(),
      })
    )
    .min(1, "At least one package is required"),
});

export default function TopupForm({
  gameId,
  editingTopup,
  onSuccess,
}: TopupFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      currency_name: "",
      packages: [{ currency_amount: 0, price: 0, description: "", sort_order: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "packages",
  });

  // ✅ Correct reset logic for edit mode
  useEffect(() => {
    if (editingTopup) {
      reset({
        currency_name: editingTopup.currency_name,
        packages: editingTopup.packages.map(pkg => ({
          currency_amount: pkg.currency_amount,
          price: pkg.price,
          description: pkg.description || "",
          sort_order: pkg.sort_order || 0,
        })),
      });
    } else {
      reset({
        currency_name: "",
        packages: [{ currency_amount: 0, price: 0, description: "", sort_order: 0 }],
      });
    }
  }, [editingTopup, reset]);

  // Submit handler
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("game_id", gameId.toString());
      formData.append("currency_name", data.currency_name);

      if (data.currency_image && data.currency_image[0]) {
        formData.append("currency_image", data.currency_image[0]);
      }

      data.packages.forEach((pkg, index) => {
        formData.append(`packages[${index}][currency_amount]`, pkg.currency_amount.toString());
        formData.append(`packages[${index}][price]`, pkg.price.toString());
        formData.append(`packages[${index}][description]`, pkg.description || "");
        formData.append(`packages[${index}][sort_order]`, pkg.sort_order?.toString() || "0");
      });

      if (editingTopup?.id) {
        formData.append("id", editingTopup.id.toString());
        await axios.post("/api/update-topup", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Top-up updated successfully!");
      } else {
        await axios.post("/api/create-topup", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Top-up created successfully!");
      }

      reset();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert(`Failed to ${editingTopup ? "update" : "create"} top-up packages.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Currency Name */}
      <div>
        <label className="block font-semibold mb-1">Currency Name</label>
        <input
          type="text"
          {...register("currency_name")}
          className="border rounded px-3 py-2 w-full"
          placeholder="e.g., UC, Diamonds"
        />
        {errors.currency_name && (
          <p className="text-red-500 text-sm">{errors.currency_name.message}</p>
        )}
      </div>

      {/* Currency Image Upload */}
      <div>
        <label className="block font-semibold mb-1">Currency Image</label>
        <input
          type="file"
          accept="image/*"
          {...register("currency_image")}
          className="border rounded px-3 py-2 w-full"
        />
        {errors.currency_image && (
          <p className="text-red-500 text-sm">{errors.currency_image.message as string}</p>
        )}
      </div>

      {/* Packages */}
      <div>
        <h2 className="font-semibold mb-2">Packages</h2>
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3 border p-3 rounded">
            <div>
              <input
                type="number"
                placeholder="Amount"
                {...register(`packages.${index}.currency_amount` as const)}
                className="border rounded px-3 py-2 w-full"
              />
              {errors.packages?.[index]?.currency_amount && (
                <p className="text-red-500 text-sm">{errors.packages[index]?.currency_amount?.message}</p>
              )}
            </div>
            <div>
              <input
                type="number"
                placeholder="Price"
                {...register(`packages.${index}.price` as const)}
                className="border rounded px-3 py-2 w-full"
              />
              {errors.packages?.[index]?.price && (
                <p className="text-red-500 text-sm">{errors.packages[index]?.price?.message}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                placeholder="Description"
                {...register(`packages.${index}.description` as const)}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Sort Order"
                {...register(`packages.${index}.sort_order` as const)}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div className="flex items-center">
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            append({
              currency_amount: 0,
              price: 0,
              description: "",
              sort_order: 0,
            })
          }
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Package
        </button>
      </div>

      {/* Submit */}
      <div>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          {loading ? "Saving..." : "Save Packages"}
        </button>
      </div>
    </form>
  );
}
