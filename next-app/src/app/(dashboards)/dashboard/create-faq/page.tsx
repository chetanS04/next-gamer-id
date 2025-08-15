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

// ✅ Yup Validation Schema
 const schema = yup.object({
  question: yup.string().required("Question is required").min(5).max(255),
  answer: yup.string().required("Answer is required").min(10),
  status: yup.string().oneOf(["active", "inactive"], "Invalid status").required(),
});

type FormData = yup.InferType<typeof schema>;

type FaqType = {
  id: number;
  question: string;
  answer: string;
  status: "active" | "inactive";
};

function FaqManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormSubmit, setIsFormSubmit] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<FaqType | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [faqs, setFaqs] = useState<FaqType[]>([]);
  const { showLoader, hideLoader } = useLoader();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      question: "",
      answer: "",
      status: "active",
    },
  });

  const getFaqs = useCallback(async () => {
    showLoader();
    try {
      const response = await axios.get("/api/get-all-faq");
      setFaqs(response.data);
    } catch {
      setErrorMessage("Failed to fetch FAQs. Please try again.");
    } finally {
      hideLoader();
    }
  }, []);

  useEffect(() => {
    getFaqs();
  }, [getFaqs]); 

  // ✅ Open Add/Edit Modal
  const openModal = (faq: FaqType | null = null) => {
    setSelectedFaq(faq);
    if (faq) {
      setValue("question", faq.question);
      setValue("answer", faq.answer);
      setValue("status", faq.status);
    } else {
      reset({ question: "", answer: "", status: "active" });
    }
    setIsModalOpen(true);
  };

  // ✅ Submit Handler (Create/Update)
  const onSubmit = async (data: FormData) => {
    showLoader();
    setIsFormSubmit(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await getCSRF();
      if (selectedFaq) {
        await axios.put(`/api/update-faq/${selectedFaq.id}`, data, { withCredentials: true });
      } else {
        await axios.post("/api/faq", data, { withCredentials: true });
      }

      setSuccessMessage("FAQ saved successfully!");
      getFaqs();
      reset({ question: "", answer: "", status: "active" });
      setIsModalOpen(false);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setErrorMessage(error.response?.data?.message || "Please try again.");
    } finally {
      setIsFormSubmit(false);
      hideLoader();
    }
  };

  // ✅ Delete Confirmation Modal
  const confirmDelete = (faq: FaqType) => {
    setSelectedFaq(faq);
    setIsDeleteModalOpen(true);
  };

  // ✅ Delete Handler
  const handleDelete = async () => {
    showLoader();
    try {
      if (selectedFaq) {
        await axios.delete(`/api/delete-faq/${selectedFaq.id}`);
        setSuccessMessage("FAQ deleted successfully!");
        getFaqs();
        setIsDeleteModalOpen(false);
      }
    } catch {
      setErrorMessage("Failed to delete FAQ. Please try again.");
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="z-[999]">
      {errorMessage && <ErrorMessage message={errorMessage} onClose={() => setErrorMessage(null)} />}
      {successMessage && <SuccessMessage message={successMessage} onClose={() => setSuccessMessage(null)} />}

      <div className="space-y-8">
        <div className="p-6 bg-zinc-50 dark:bg-neutral-900 rounded-2xl shadow flex items-center justify-between mb-6 border border-zinc-200 dark:border-neutral-700">
          <h3 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 tracking-tight">FAQs</h3>
          <button
            onClick={() => openModal(null)}
            className="rounded bg-zinc-700 dark:bg-zinc-800 text-white px-4 py-2 font-medium hover:bg-zinc-900 dark:hover:bg-zinc-700 transition shadow focus:outline-none"
          >
            <span className="text-xl align-middle">＋</span> Add FAQ
          </button>
        </div>

        <div className="overflow-auto rounded-lg shadow border border-zinc-300 dark:border-neutral-700 bg-white dark:bg-neutral-950">
          <table className="w-full min-w-[900px] text-sm text-left">
            <thead className="bg-zinc-100 dark:bg-neutral-800 uppercase text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <tr>
                <th className="px-6 py-3 whitespace-nowrap">S.No.</th>
                <th className="px-6 py-3 whitespace-nowrap">Question</th>
                <th className="px-6 py-3 whitespace-nowrap">Answer</th>
                <th className="px-6 py-3 whitespace-nowrap">Status</th>
                <th className="px-6 py-3 whitespace-nowrap text-end">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-neutral-700">
              {faqs?.length ? (
                faqs.map((faq, index) => (
                  <tr
                    key={faq.id}
                    className="bg-white dark:bg-neutral-950 hover:bg-zinc-50 dark:hover:bg-neutral-900 transition"
                  >
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">{faq.question}</td>
                    <td className="px-6 py-4">{faq.answer}</td>
                    <td className="px-6 py-4 capitalize">{faq.status}</td>
                    <td className="px-6 py-4 text-end space-x-1">
                      <button
                        onClick={() => openModal(faq)}
                        className="inline-flex items-center gap-1 rounded-md bg-zinc-500 px-3 py-1.5 text-xs text-white hover:bg-zinc-600 shadow focus:outline-none"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(faq)}
                        className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-3 py-1.5 text-xs text-white hover:bg-rose-700 shadow focus:outline-none"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center text-zinc-400 dark:text-neutral-500 font-medium py-8 italic">
                    No FAQs Found
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
          reset({ question: "", answer: "", status: "active" });
        }}
        title={selectedFaq ? "Edit FAQ" : "Add FAQ"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="question" className="block text-sm font-medium">
              Question<span className="text-red-600">*</span>
            </label>
            <input
              id="question"
              {...register("question")}
              type="text"
              placeholder="Enter question"
              className="w-full rounded-xl border border-solid border-zinc-200 bg-white px-4 py-3.5 text-sm dark:border-neutral-600 dark:bg-neutral-900 dark:text-white"
            />
            <p className="text-sm text-red-500">{errors.question?.message}</p>
          </div>

          <div>
            <label htmlFor="answer" className="block text-sm font-medium">
              Answer<span className="text-red-600">*</span>
            </label>
            <textarea
              id="answer"
              {...register("answer")}
              placeholder="Enter answer"
              rows={4}
              className="w-full rounded-xl border border-solid border-zinc-200 bg-white px-4 py-3.5 text-sm dark:border-neutral-600 dark:bg-neutral-900 dark:text-white"
            />
            <p className="text-sm text-red-500">{errors.answer?.message}</p>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Status<span className="text-red-600">*</span>
            </label>
            <select
              {...register("status")}
              className="w-full rounded-xl border border-solid border-zinc-200 bg-white px-4 py-3.5 text-sm dark:border-neutral-600 dark:bg-neutral-900 dark:text-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <p className="text-sm text-red-500">{errors.status?.message}</p>
          </div>

          <button
            type="submit"
            className={`w-full rounded-lg p-3 text-white ${
              isFormSubmit ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
            }`}
            disabled={isFormSubmit}
          >
            {isFormSubmit ? "Saving..." : "Save"}
          </button>
        </form>
      </Modal>

      <Modal width="max-w-xl" isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Delete">
        <p>
          Are you sure you want to delete &quot;{selectedFaq?.question}&quot;?
        </p>
        <div className="mt-4 flex justify-end space-x-4">
          <button onClick={() => setIsDeleteModalOpen(false)} className="rounded bg-gray-500 px-4 py-2 text-white">
            Cancel
          </button>
          <button onClick={handleDelete} className="rounded bg-red-500 px-4 py-2 text-white">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default FaqManagement;

