import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string; // e.g., 'max-w-xl', 'max-w-2xl'
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, width = 'max-w-xl' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 overflow-y-auto py-10 px-4">
          <motion.div
            key="modal"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`w-full ${width} bg-white rounded-2xl shadow-xl p-6 relative`}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl"
              aria-label="Close modal"
            >
              &times;
            </button>

            <h2 className="text-xl font-semibold mb-4">{title}</h2>

            <div className="overflow-y-auto max-h-[70vh]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
