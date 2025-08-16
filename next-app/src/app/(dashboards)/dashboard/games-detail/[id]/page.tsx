"use client";

import React, { useEffect, useState, ReactNode } from "react";
import { useParams } from "next/navigation";
import { useLoader } from "@/context/LoaderContext";
import axios from "../../../../../../utils/axios";
import Modal from "@/components/(sheared)/Modal";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Image from "next/image";
import TopupForm from "@/components/TopUp";

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
];

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const SUPPORTED_FORMATS = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// ============ TYPES ============
type GameField = {
  id: number;
  name?: string;
  label?: string;
  type?: string;
  status?: boolean;
  is_filterable?: boolean;
  icon?: File | string;
  order?: number;
};

type TopupData = {
  packages: never[];
  currency_amount: ReactNode;
  id: number;
  game?: { name?: string };
  currency_name: string;
  currency_image?: string;
  amount: number;
  price: number;
  description?: string;
  status: string;
  sort_order: number;
};

interface FieldFormValues {
  label: string;
  type: string;
  is_filterable: boolean;
  status: boolean;
icon: yup.Maybe<string | File | null | undefined>;
}



type TopupFormValues = {
  currency_amount: number;
  currency_name: string;
  amount: number;
  price: number;
  description: string;
  status: boolean;
  sort_order: number;
};

// ============ VALIDATION ============
const fieldSchema = yup.object({
  label: yup.string().required("Label is required"),
  type: yup.string().required("Please Select the field"),
  is_filterable: yup.boolean().required(),
  status: yup.boolean().required(),
  icon: yup
    .mixed<File | string>()
    .nullable()
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
          : SUPPORTED_FORMATS.includes((value as File).type)
    ),
});

type FieldFormValuess = yup.InferType<typeof fieldSchema>;

const topupSchema = yup.object({
  currency_name: yup.string().required("Currency name is required"),
  amount: yup
    .number()
    .typeError("Amount should be a number")
    .min(1, "Amount should be at least 1"),
  price: yup
    .number()
    .typeError("Price should be a number")
    .min(0, "Price can't be negative"),
  description: yup.string(),
  status: yup.boolean(),
  sort_order: yup.number().default(0),
});

// ============ MAIN COMPONENT ============
const Page = () => {
  // Context and Params
  const { showLoader, hideLoader } = useLoader();
  const params = useParams();
  const gameId = parseInt((params?.id as string) || "", 10);

  // State for Tabs
  const [activeTab, setActiveTab] = useState<"sellGame" | "topUp">("sellGame");

  // Game Field state
  const [gameFields, setGameFields] = useState<GameField[]>([]);
  const [commonFields, setCommonFields] = useState<GameField[]>([]);
  const [chooseState, setChooseState] = useState<
    { checked: boolean; type: string }[]
  >([]);
  const [editingField, setEditingField] = useState<GameField | null>(null);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [isChooseModalOpen, setIsChooseModalOpen] = useState(false);
  const [deletingField, setDeletingField] = useState<GameField | null>(null);

  // For Field File Preview
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [previewPrimary, setPreviewPrimary] = useState<string | null>(null);

  // Topup state
  const [topups, setTopups] = useState<TopupData[]>([]);
  const [editingTopup, setEditingTopup] = useState<TopupData | null>(null);
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);

  // ============ DATA FETCHING ============
  // Fields
  const getGameFields = async () => {
    showLoader();
    try {
      const res = await axios.get(`/api/games-fields/game/${gameId}`);
      setGameFields(Array.isArray(res.data.data) ? res.data.data : []);
    } finally {
      hideLoader();
    }
  };
  // Common fields
  const getCommonFields = async () => {
    showLoader();
    try {
      const res = await axios.get("/api/games-fields");
      setCommonFields(Array.isArray(res.data.data) ? res.data.data : []);
    } finally {
      hideLoader();
    }
  };
  // Topups
  const getTopups = async () => {
    showLoader();
    try {
      const res = await axios.get(`/api/games/${gameId}/topup-options`);
      setTopups(Array.isArray(res.data) ? res.data : [res.data]);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    if (gameId) {
      getGameFields();
      getCommonFields();
      getTopups();
    }
  }, [gameId]);



  useEffect(() => {
    setChooseState(commonFields.map(() => ({ checked: false, type: "text" })));
  }, [isChooseModalOpen, commonFields]);


  
  // const {
  //   register: registerField,
  //   handleSubmit: handleSubmitField,
  //   setValue: setValueField,
  //   reset: resetField,
  //   watch: watchField,
  //   formState: { errors: fieldErrors },
  // } = useForm<FieldFormValuess>({
  //   resolver: yupResolver(FieldFormValuess),
  //   defaultValues: {
  //     label: "",
  //     type: "",
  //     is_filterable: true,
  //     status: true,
  //     icon: null
  //   },
  // });


    const {
     register: registerField,
    handleSubmit: handleSubmitField,
    setValue: setValueField,
    reset: resetField,
    watch: watchField,
    formState: { errors: fieldErrors },
    } = useForm({
      resolver: yupResolver(fieldSchema),
    defaultValues: {
      label: "",
      type: "",
      is_filterable: true,
      status: true,
      icon: null
    },    });

  // Top-up Form
  // const {
  // } = useForm<TopupFormValues>({
  //   resolver: yupResolver(topupSchema),
  //   defaultValues: {
  //     currency_name: "",
  //     amount: 0,
  //     price: 0,
  //     description: "",
  //     status: true,
  //     sort_order: 0,
  //   },
  // });

  
    const {
    
    } = useForm({
      resolver: yupResolver(topupSchema),
    defaultValues: {
      currency_name: "",
      amount: 0,
      price: 0,
      description: "",
      status: true,
      sort_order: 0,
    },
      });

  // ============ MODAL OPEN HANDLERS ===========
  // Game Field Modal
  const openFieldModal = (field: GameField | null = null) => {
    setEditingField(field);
    setIsFieldModalOpen(true);
    if (field) {
      resetField({
        label: field.label || "",
        type: field.type || "text",
        is_filterable: field.is_filterable ?? true,
        status: field.status ?? true,
        icon: null,
      });
      setIconPreview(
        field.icon ? `http://localhost:8000/storage/${field.icon}` : null
      );
      setPreviewPrimary(null);
    } else {
      resetField({
        label: "",
        type: "text",
        is_filterable: true,
        status: true,
        icon: null,
      });
      setIconPreview(null);
      setPreviewPrimary(null);
    }
  };

  // Topup Modal
  const openTopupModal = (topup: TopupData | null = null) => {
    setEditingTopup(topup);
    setIsTopupModalOpen(true);
  };

  // ============ CRUD HANDLERS ============

  // ===== Game Field ======
  const onFieldSubmit = async (values: FieldFormValuess) => {
    showLoader();
    try {
      const formData = new FormData();
      formData.append("label", values.label ?? "");
      formData.append("type", values.type ?? "");
      formData.append("game_id", String(gameId));
      formData.append("order", "0");
      formData.append("is_filterable", values.is_filterable ? "true" : "false");
      formData.append("status", values.status ? "true" : "false");

      if (
        values.icon &&
        typeof values.icon === "object" &&
        values.icon instanceof File
      ) {
        formData.append("icon", values.icon);
      }

      if (editingField) {
        formData.append("_method", "PUT");
        await axios.post(`/api/games-fields/${editingField.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post("/api/games-fields", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setIsFieldModalOpen(false);
      setEditingField(null);
      resetField();
      setIconPreview(null);
      getGameFields();
    } finally {
      hideLoader();
    }
  };

  const handleFieldDelete = async () => {
    if (!deletingField) return;
    showLoader();
    try {
      await axios.delete(`/api/games-fields/${deletingField.id}`);
      setDeletingField(null);
      getGameFields();
    } finally {
      hideLoader();
    }
  };




  const handleTopupDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this top-up?")) return;
    showLoader();
    try {
      await axios.delete(`/api/delete-topup/${id}`);
      getTopups();
    } finally {
      hideLoader();
    }
  };

  // Handle Common Fields Bulk Choose
  const handleChooseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    showLoader();
    try {
      const selected = commonFields
        .map((field, idx) => ({
          label: field.name,
          type: chooseState[idx]?.type ?? "text",
          icon: field.icon ?? null,
          order: 0,
          is_filterable: true,
          status: true,
          game_id: gameId,
        }))
        .filter((_, idx) => chooseState[idx]?.checked);

      if (selected.length === 0) {
        hideLoader();
        return;
      }
      await axios.post("/api/games-fields/bulk-create", { fields: selected });
      setIsChooseModalOpen(false);
      getGameFields();
    } finally {
      hideLoader();
    }
  };

  // ============ RENDER ============
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-6 bg-zinc-50 dark:bg-neutral-900 rounded-xl shadow flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 tracking-tight">
          Game Field Options
        </h1>
        <div className="flex gap-2 flex-wrap">
          {activeTab === "topUp" && (
            <button
              className="rounded bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 transition focus:outline-none shadow"
              onClick={() => openTopupModal(null)}
            >
              + Add Topup
            </button>
          )}
          {activeTab === "sellGame" && (
            <>
              <button
                className="rounded bg-zinc-700 dark:bg-zinc-800 text-white px-4 py-2 font-medium hover:bg-zinc-900 dark:hover:bg-zinc-700 transition focus:outline-none shadow"
                onClick={() => setIsChooseModalOpen(true)}
              >
                + Choose Common Field
              </button>
              <button
                className="rounded bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 transition focus:outline-none shadow"
                onClick={() => openFieldModal(null)}
              >
                + Add Custom Field
              </button>
            </>
          )}
        </div>
      </div>
      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-zinc-300 dark:border-neutral-700 mb-6">
        <button
          onClick={() => setActiveTab("sellGame")}
          className={`px-4 py-2 font-medium border-b-2 ${
            activeTab === "sellGame"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Sell Game
        </button>
        <button
          onClick={() => setActiveTab("topUp")}
          className={`px-4 py-2 font-medium border-b-2 ${
            activeTab === "topUp"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Top-up
        </button>
      </div>
      {/* Sell Game Tab - Fields Table */}
      {activeTab === "sellGame" && (
        <div className="overflow-auto rounded-lg shadow border border-zinc-300 dark:border-neutral-700 bg-white dark:bg-neutral-950">
          <table className="w-full min-w-[800px] text-sm text-left">
            <thead className="bg-zinc-100 dark:bg-neutral-800 uppercase text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <tr>
                <th className="px-6 py-3 whitespace-nowrap">#</th>
                <th className="px-6 py-3 whitespace-nowrap">Image</th>
                <th className="px-6 py-3 whitespace-nowrap">Name</th>
                <th className="px-6 py-3 whitespace-nowrap">Type</th>
                <th className="px-6 py-3 whitespace-nowrap">Status</th>
                <th className="px-6 py-3 whitespace-nowrap">Filterable</th>
                <th className="px-6 py-3 whitespace-nowrap text-end">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-neutral-700">
              {gameFields.length > 0 ? (
                gameFields.map((f, index) => (
                  <tr
                    key={f.id}
                    className="bg-white dark:bg-neutral-950 hover:bg-zinc-50 dark:hover:bg-neutral-900 transition"
                  >
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-200 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      {f.icon ? (
                        <Image
                          src={`http://localhost:8000/storage/${f.icon}`}
                          alt={""}
                          height={600}
                          width={600}
                          className="h-14 w-14 object-cover rounded border border-zinc-300 dark:border-neutral-700 shadow-sm"
                        />
                      ) : (
                        <span className="text-xs text-zinc-400 italic">
                          No Image
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-200 font-medium">
                      {f.name ?? f.label}
                    </td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-200">
                      {f.type}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          f.status
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {f.status ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          f.is_filterable
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {f.is_filterable ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-end space-x-1">
                      <button
                        onClick={() => openFieldModal(f)}
                        className="inline-flex items-center gap-1 rounded-md bg-gray-500 px-3 py-1.5 text-xs text-white hover:bg-gray-600 shadow focus:outline-none"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingField(f)}
                        className="inline-flex items-center gap-1 rounded-md bg-red-700 px-3 py-1.5 text-xs text-white hover:bg-red-800 shadow focus:outline-none"
                      >
                        Delete
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
                    No fields yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Top Up Tab */}
      {activeTab === "topUp" && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Game</th>
                <th className="px-4 py-2 border">Currency</th>
                <th className="px-4 py-2 border">Currency Image</th>
                <th className="px-4 py-2 border">Amount</th>
                <th className="px-4 py-2 border">Price</th>
                <th className="px-4 py-2 border">Description</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Sort Order</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {topups.map((topup) => (
                <tr key={topup.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border text-center">{topup.id}</td>
                  <td className="px-4 py-2 border">
                    {topup.game?.name || "—"}
                  </td>
                  <td className="px-4 py-2 border">{topup.currency_name}</td>
                  <td className="px-4 py-2 border text-center">
                    {topup.currency_image ? (
                      <Image
                        src={`http://localhost:8000/storage/${topup.currency_image}`}
                        alt=""
                           height={800}
                    width={800}
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {topup.currency_amount}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    ₹{topup.price}
                  </td>
                  <td className="px-4 py-2 border">
                    {topup.description || "—"}
                  </td>
                  <td
                    className={`px-4 py-2 border text-center font-medium ${
                      topup.status === "active"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {topup.status}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {topup.sort_order}
                  </td>
                  <td className="px-4 py-2 border text-center space-x-2">
                    <button
                      onClick={() => openTopupModal(topup)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleTopupDelete(topup.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {topups.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="text-center py-6 text-gray-400 italic"
                  >
                    No top-ups found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* --- Choose Common Fields Modal --- */}
      <Modal
        isOpen={isChooseModalOpen}
        onClose={() => setIsChooseModalOpen(false)}
        title="Select Common Fields"
        width="max-w-4xl"
      >
        <form onSubmit={handleChooseSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
            {commonFields.map((field, idx) => (
              <div
                key={field.id}
                className={`p-4 rounded-2xl border flex flex-col gap-2 ${
                  chooseState[idx]?.checked
                    ? "border-gray-500 bg-gray-50"
                    : "border-gray-200 bg-white"
                } shadow-sm hover:shadow-md`}
              >
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-gray-600"
                    checked={chooseState[idx]?.checked || false}
                    onChange={(e) =>
                      setChooseState((prev) =>
                        prev.map((item, j) =>
                          j === idx
                            ? {
                                ...item,
                                checked: e.target.checked,
                                type: e.target.checked
                                  ? item.type || "text"
                                  : "text",
                              }
                            : item
                        )
                      )
                    }
                  />
                  <span className="font-medium text-gray-800">
                    {field.name}
                  </span>
                </label>
                {chooseState[idx]?.checked && (
                  <select
                    className="rounded border px-2 py-1"
                    value={chooseState[idx]?.type}
                    onChange={(e) =>
                      setChooseState((prev) =>
                        prev.map((item, j) =>
                          j === idx ? { ...item, type: e.target.value } : item
                        )
                      )
                    }
                    required
                  >
                    <option value="">Select Type</option>
                    {FIELD_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
          <button
            type="submit"
            className="w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 rounded-xl mt-5 shadow-lg"
          >
            Save Selected Fields
          </button>
        </form>
      </Modal>

      {/* --- Game Field Modal --- */}
      <Modal
        isOpen={isFieldModalOpen}
        onClose={() => {
          setIsFieldModalOpen(false);
          setEditingField(null);
          resetField();
          setIconPreview(null);
          setPreviewPrimary(null);
        }}
        title={editingField ? "Edit Field" : "Add Custom Field"}
      >
        <form className="space-y-4" onSubmit={handleSubmitField(onFieldSubmit)}>
          {/* Label */}
          <div>
            <label htmlFor="label" className="block mb-1 font-medium">
              Label
            </label>
            <input
              id="label"
              {...registerField("label")}
              className="border rounded px-2 py-1 w-full"
              autoComplete="off"
            />
            {fieldErrors.label && (
              <p className="text-red-600 text-xs">
                {fieldErrors.label.message}
              </p>
            )}
          </div>
          {/* Type */}
          <div>
            <label htmlFor="type" className="block mb-1 font-medium">
              Type
            </label>
            <select
              id="type"
              {...registerField("type")}
              className="border rounded px-2 py-1 w-full"
            >
              {FIELD_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {fieldErrors.type && (
              <p className="text-red-600 text-xs">{fieldErrors.type.message}</p>
            )}
          </div>
          {/* Icon */}
          <div>
            <label className="block text-sm font-medium">Icon Image</label>
            <input
              type="file"
              accept={SUPPORTED_FORMATS.join(",")}
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setValueField("icon", file!);
                setPreviewPrimary(file ? URL.createObjectURL(file) : null);
              }}
            />
            <p className="text-xs text-red-500">{fieldErrors.icon?.message}</p>
            {/* New Preview */}
            {previewPrimary && (
              <Image
                src={previewPrimary}
                alt="Preview"
                height={600}
                width={600}
                className="mt-2 h-24 w-24 rounded object-cover border border-zinc-300"
              />
            )}
            {/* Existing preview */}
            {iconPreview && (
              <Image
                src={iconPreview}
                alt="Preview"
                height={600}
                width={600}
                className="mt-2 h-24 w-24 rounded object-cover border border-zinc-300"
              />
            )}
          </div>
          {/* Checkboxes */}
          <div className="flex gap-4">
            <label className="flex items-center gap-1">
              <input type="checkbox" {...registerField("is_filterable")} />
              <span>Filterable</span>
            </label>
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
                    flex items-center h-6 w-12 rounded-full border border-zinc-300 dark:border-zinc-700
                    transition-all duration-200
                    ${
                      watchField("status")
                        ? "bg-green-600 dark:bg-green-700"
                        : "bg-zinc-200 dark:bg-zinc-800"
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    {...registerField("status")}
                    hidden
                    id="status"
                  />
                  <div
                    className={`
                      h-5 w-5 rounded-full bg-white shadow-md transition-all
                      ${
                        watchField("status") ? "translate-x-6" : "translate-x-0"
                      }
                    `}
                  ></div>
                </div>
              </label>
            </div>
          </div>
          {/* Submit */}
          <div className="text-right">
            <button
              type="submit"
              className="rounded bg-blue-700 text-white px-4 py-2 hover:bg-blue-800 transition"
            >
              {editingField ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      {/* --- Topup Modal --- */}

      <Modal
        isOpen={isTopupModalOpen}
        onClose={() => {
          setIsTopupModalOpen(false);
          setEditingTopup(null);
        }}
        title={editingTopup ? "Edit Top-Up" : "Add Top-Up"}
      >
       <TopupForm
  gameId={gameId}
  editingTopup={
    editingTopup
      ? {
          id: editingTopup.id,
          currency_name: editingTopup.currency_name,
          packages: editingTopup.packages ?? [],
        }
      : undefined
  }
  onSuccess={() => {
    getTopups();
    setIsTopupModalOpen(false);
    setEditingTopup(null);
  }}
/>

      </Modal>

      {/* --- Game Field Delete Modal --- */}
      <Modal
        isOpen={!!deletingField}
        onClose={() => setDeletingField(null)}
        title="Delete Field?"
      >
        <div className="mb-4">
          Are you sure you want to delete{" "}
          <strong>{deletingField?.name || deletingField?.label}</strong>?
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setDeletingField(null)}
            className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleFieldDelete}
            className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Page;
