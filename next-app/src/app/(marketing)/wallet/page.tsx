"use client";

import React, { useEffect, useState } from "react";
import WalletBalance from "@/components/WalletBalance";
import axios from "../../../../utils/axios";

const Page = () => {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const getWalletBalance = async () => {
      try {
        const response = await axios.get("/api/wallet/balance");
        setBalance(response.data.balance);
        console.log("Wallet balance:", response.data);
      } catch (error) {
        console.error("Failed to fetch wallet balance:", error);
      }
    };

    getWalletBalance();
  }, []);

  return (
    <div>
      <WalletBalance balance={balance} onBalanceUpdate={setBalance} />
    </div>
  );
};

export default Page;
