"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "../../../../../utils/axios";
import { useLoader } from "@/context/LoaderContext";

const badgeStyles = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  referred_back: "bg-blue-100 text-blue-700",
};

type StatusKey = "pending" | "approved" | "rejected" | "referred_back";

const statusTabs: { key: StatusKey; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "referred_back", label: "Referred Back" },
];

const tabStyles: Record<StatusKey, string> = {
  pending: "border-yellow-500 text-yellow-600",
  approved: "border-green-500 text-green-600",
  rejected: "border-red-500 text-red-600",
  referred_back: "border-blue-500 text-blue-600",
};

type Seller = {
  id: number;
  name: string;
  email: string;
};

type KYCSubmission = {
  id: number;
  seller_id: number;
  seller: Seller;
  status: "pending" | "approved" | "rejected" | "referred_back";
  created_at: string;
};

const AdminKycPage = () => {
  const [kycData, setKycData] = useState<Record<string, KYCSubmission[]>>({});
  const [activeTab, setActiveTab] = useState("pending");
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();

  const fetchKycData = useCallback(async () => {
    showLoader();
    try {
      const res = await axios.get("/api/kyc-submissions/grouped");
      setKycData(res.data || {});
    } catch (err) {
      console.error("Failed to load KYC data:", err);
    } finally {
      hideLoader();
    }
  }, []); // No dependencies inside fetch function

  useEffect(() => {
    fetchKycData();
  }, [fetchKycData]);

  const handleViewDetails = (id: number) => {
    router.push(`/dashboard/kyc-seller-detail/${id}`);
  };

  return (
    <div className="px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-700">KYC Management</h1>
        <div className="flex gap-4">
          {statusTabs.map(({ key, label }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-5 py-2 rounded-t-xl border-b-4 font-semibold text-lg shadow transition-all
                  ${
                    isActive
                      ? `bg-blue-50 ${tabStyles[key]}`
                      : "border-gray-200 text-gray-500 hover:bg-gray-100"
                  }
                `}
                aria-current={isActive ? "page" : undefined}
              >
                {label}
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-gray-200">
                  {kycData[key]?.length || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left whitespace-nowrap">Seller</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Email</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Submitted</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {kycData[activeTab]?.length > 0 ? (
              kycData[activeTab].map((kyc) => (
                <tr key={kyc.id} className="hover:bg-blue-50 transition">
                  <td className="px-4 py-2">{kyc.seller?.name || "-"}</td>
                  <td className="px-4 py-2">{kyc.seller?.email || "-"}</td>
                  <td className="px-4 py-2 capitalize font-semibold">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs ${
                        badgeStyles[kyc.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {kyc.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {new Date(kyc.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleViewDetails(kyc.seller_id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center px-4 py-6 text-gray-500">
                  No KYC submissions found in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminKycPage;
