"use client";

import React, { useState, useEffect } from "react";
import { useLoader } from "@/context/LoaderContext";
import Modal from "@/components/(sheared)/Modal";
import axios from "../../../../../utils/axios";

type User = {
  id: number;
  name?: string;
  email?: string;
};

const Page = () => {
  const [activeTab, setActiveTab] = useState<"Seller" | "Buyer">("Seller");
  const [isPredefinedModalOpen, setIsPredefinedModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const { showLoader, hideLoader } = useLoader();

  // Fetch sellers
  const fetchSellers = async () => {
    showLoader();
    try {
      const { data } = await axios.get("/api/users/sellers");
      setUsers(data.data || []);
    } catch (error) {
      console.error("Error fetching sellers:", error);
      setUsers([]);
    } finally {
      hideLoader();
    }
  };

  // Fetch buyers
  const fetchBuyers = async () => {
    showLoader();
    try {
      const { data } = await axios.get("/api/users/buyers");
      setUsers(data.data || []);
    } catch (error) {
      console.error("Error fetching buyers:", error);
      setUsers([]);
    } finally {
      hideLoader();
    }
  };

  // Call correct fetch function when activeTab changes
  useEffect(() => {
    if (activeTab === "Seller") {
      fetchSellers();
    } else {
      fetchBuyers();
    }
  }, [activeTab]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-6 bg-zinc-50 dark:bg-neutral-900 rounded-xl shadow flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 tracking-tight">
          {activeTab} List
        </h1>
        <div className="flex gap-2 flex-wrap"></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-zinc-300 dark:border-neutral-700 mb-6">
        <button
          onClick={() => setActiveTab("Seller")}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === "Seller"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Seller
        </button>
        <button
          onClick={() => setActiveTab("Buyer")}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === "Buyer"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Buyer
        </button>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-lg shadow border border-zinc-300 dark:border-neutral-700 bg-white dark:bg-neutral-950">
        <table className="w-full min-w-[800px] text-sm text-left">
          <thead className="bg-zinc-100 dark:bg-neutral-800 uppercase text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3 text-end">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-neutral-700">
            {users.length > 0 ? (
              users.map((user, i) => (
                <tr
                  key={user.id}
                  className="hover:bg-zinc-50 dark:hover:bg-neutral-900 transition"
                >
                  <td className="px-6 py-4">{i + 1}</td>
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4 text-end space-x-1">
                    <button className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 text-xs rounded shadow">
                      See Transaction
                    </button>
                    <button className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1.5 text-xs rounded shadow">
                      Purchase Request
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-8 italic text-zinc-400"
                >
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isPredefinedModalOpen}
        onClose={() => setIsPredefinedModalOpen(false)}
        title="Choose Common Field"
      >
        <div className="p-4 text-zinc-600 dark:text-zinc-300">
          Choose a predefined field here...
        </div>
      </Modal>

      <Modal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        title="Add Top-up"
      >
        <div className="p-4 text-zinc-600 dark:text-zinc-300">
          Add top-up details here...
        </div>
      </Modal>
    </div>
  );
};

export default Page;
