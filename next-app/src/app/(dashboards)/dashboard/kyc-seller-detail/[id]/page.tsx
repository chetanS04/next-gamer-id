"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "../../../../../../utils/axios";
import { useLoader } from "@/context/LoaderContext";
import Image from "next/image";

type KycSubmission = {
  id: number;
  seller_id: number;
  status: string;
  admin_remark: string;
  created_at: string;
  updated_at: string;
  video_path: string;
  aadhar_path: string;
  pan_path: string;
  seller: {
    name: string;
    email: string;
  };
};

const ActionModal = ({
  open,
  action,
  onClose,
  onSubmit,
  loading,
}: {
  open: boolean;
  action: string;
  onClose: () => void;
  onSubmit: (remark: string) => void;
  loading: boolean;
}) => {
  const [remark, setRemark] = useState("");

  useEffect(() => {
    if (open) setRemark("");
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
        <h2 className="text-xl font-bold mb-2">Remark for {action}</h2>
        <textarea
          className="w-full border rounded px-3 py-2 mb-4"
          rows={3}
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder={`Enter remark for ${action}...`}
          disabled={loading}
        />
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
            onClick={onClose}
            type="button"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            onClick={() => onSubmit(remark)}
            disabled={loading || !remark.trim()}
            type="button"
          >
            {loading ? "Saving..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

const KycSellerDetailPage = () => {
  const { showLoader, hideLoader } = useLoader();
  const { id } = useParams();
  const [kyc, setKyc] = useState<KycSubmission | null>(null);
  const [loading, setLoading] = useState(false);
  const [mediaModal, setMediaModal] = useState({
    open: false,
    type: "", // 'image' or 'video'
    src: "",
  });

  // For Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Success Notification
  const [successMsg, setSuccessMsg] = useState("");

  type MediaType = "image" | "video";

  function handleMediaClick(type: MediaType, src: string) {
    setMediaModal({ open: true, type, src });
  }

  function closeMediaModal() {
    setMediaModal({ ...mediaModal, open: false });
  }

  const basePath =
    process.env.NEXT_PUBLIC_UPLOAD_BASE || "http://localhost:8000/storage/";

  useEffect(() => {
    if (id) fetchKycDetail();
    // eslint-disable-next-line
  }, [id]);

  const fetchKycDetail = async () => {
    showLoader();
    try {
      setLoading(true);
      setKyc(null);
      const res = await axios.get(`/api/kyc-submissions/${id}`);
      setKyc(res.data.data);
    } catch {
      setKyc(null);
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  // Opening modal
  const openModal = (action: string) => {
    setPendingAction(action);
    setModalOpen(true);
  };

  // Submit action
  const handleActionSubmit = async (remark: string) => {
    if (!pendingAction) return;
    showLoader();
    setActionLoading(true);
    try {
      await axios.post(`/api/kyc-submissions/${id}/action`, {
        status: pendingAction,
        admin_remark: remark,
      });
      setSuccessMsg(`KYC ${pendingAction} successfully.`);
      setModalOpen(false);
      fetchKycDetail(); // refresh
    } catch {
      alert("Failed to perform action");
    } finally {
      setActionLoading(false);
      hideLoader();
    }
  };

  if (loading)
    return <div className="p-4 text-lg font-semibold">Loading...</div>;
  if (!kyc) return <div className="p-4 text-red-500">KYC not found.</div>;

  // Hide buttons if already approved
  const showActionButtons = !["approved"].includes(kyc.status);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">KYC Details - ID #{kyc.id}</h1>

      <div className="space-y-2 text-gray-700 mb-6">
        <div>
          <strong>Name:</strong> {kyc.seller.name}
        </div>
        <div>
          <strong>Email:</strong> {kyc.seller.email}
        </div>
        <div>
          <strong>Status:</strong>
          <span
            className={`inline-block ml-2 px-2 py-1 rounded
            ${
              kyc.status === "approved"
                ? "bg-green-100 text-green-700"
                : kyc.status === "rejected"
                ? "bg-red-100 text-red-700"
                : kyc.status === "referred_back"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {kyc.status}
          </span>
        </div>
        <div>
          <strong>Admin Remark:</strong> {kyc.admin_remark || "—"}
        </div>
        <div>
          <strong>Submitted At:</strong>{" "}
          {new Date(kyc.created_at).toLocaleString()}
        </div>
      </div>

      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <p className="font-semibold mb-2">5-Second Video:</p>
          <div
            className="cursor-pointer"
            onClick={() =>
              handleMediaClick("video", `${basePath}${kyc.video_path}`)
            }
          >
            <video
              controls
              className="w-full rounded shadow"
              style={{ maxHeight: 250 }}
            >
              <source src={`${basePath}${kyc.video_path}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <span className="text-xs block text-center mt-1 text-blue-500">
              Click to enlarge
            </span>
          </div>
        </div>
        <div>
          <p className="font-semibold mb-2">Aadhaar Image:</p>
          <Image
            src={`${basePath}${kyc.aadhar_path}`}
            alt="Aadhaar"
            height={600}
            width={600}
            className="w-full rounded shadow object-contain cursor-pointer"
            style={{ maxHeight: 250 }}
            onClick={() =>
              handleMediaClick("image", `${basePath}${kyc.aadhar_path}`)
            }
          />
          <span className="text-xs block text-center mt-1 text-blue-500">
            Click to enlarge
          </span>
        </div>
        <div>
          <p className="font-semibold mb-2">PAN Image:</p>
          <Image
            src={`${basePath}${kyc.pan_path}`}
            alt="PAN"
            height={600}
            width={600}
            className="w-full rounded shadow object-contain cursor-pointer"
            style={{ maxHeight: 250 }}
            onClick={() =>
              handleMediaClick("image", `${basePath}${kyc.pan_path}`)
            }
          />
          <span className="text-xs block text-center mt-1 text-blue-500">
            Click to enlarge
          </span>
        </div>
      </div>

      {showActionButtons && (
        <div className="mt-8 flex gap-4">
          <button
            className="px-6 py-2 bg-green-600 text-white rounded font-semibold shadow hover:bg-green-700 transition"
            disabled={actionLoading}
            onClick={() => openModal("approved")}
          >
            Approve
          </button>
          <button
            className="px-6 py-2 bg-red-500 text-white rounded font-semibold shadow hover:bg-red-600 transition"
            disabled={actionLoading}
            onClick={() => openModal("rejected")}
          >
            Reject
          </button>
          <button
            className="px-6 py-2 bg-yellow-400 text-gray-800 rounded font-semibold shadow hover:bg-yellow-500 transition"
            disabled={actionLoading}
            onClick={() => openModal("referred_back")}
          >
            Refer Back
          </button>
        </div>
      )}

      {/* Modal Section */}
      <ActionModal
        open={modalOpen}
        action={pendingAction || ""}
        onClose={() => setModalOpen(false)}
        onSubmit={handleActionSubmit}
        loading={actionLoading}
      />

      {/* Success Message */}
      {successMsg && (
        <div className="mt-6 px-4 py-3 rounded bg-green-50 text-green-700 border border-green-200 font-semibold">
          {successMsg}
          <button
            type="button"
            className="ml-4 text-sm text-green-600 underline"
            onClick={() => setSuccessMsg("")}
          >
            Dismiss
          </button>
        </div>
      )}

      {mediaModal.open && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center"
          onClick={closeMediaModal}
        >
          <div
            className="bg-white rounded max-w-3xl w-[90vw] p-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-600 text-xl font-bold"
              onClick={closeMediaModal}
            >
              ×
            </button>
            {mediaModal.type === "image" ? (
              <Image
                src={mediaModal.src}
                height={600}
                width={600}
                alt=""
                className="rounded max-h-[70vh] m-auto"
              />
            ) : (
              <video
                src={mediaModal.src}
                controls
                autoPlay
                className="rounded max-h-[70vh] m-auto"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default KycSellerDetailPage;
