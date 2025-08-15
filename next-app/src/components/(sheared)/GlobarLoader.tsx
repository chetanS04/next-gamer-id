"use client";
import { useLoader } from "../../context/LoaderContext";

const GlobalLoader = () => {
  const { loading } = useLoader();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-16 h-16 border-4 border-gray-200 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default GlobalLoader;
