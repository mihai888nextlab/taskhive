import React, { FC, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  // Render using createPortal to escape the DOM hierarchy of parent components
  return createPortal(
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose} // Close on backdrop click
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <Button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            variant="ghost"
          >
            &times;
          </Button>
        </div>
        <div className="flex-grow">{children}</div>
      </div>
    </div>,
    document.body // Append to the body
  );
};

export default Modal;
