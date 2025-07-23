import React from "react";
import { createPortal } from "react-dom";
import AnnouncementForm from "./AnnouncementForm";

interface AnnouncementFormModalProps {
  open: boolean;
  theme: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  expiresAt: string;
  eventDate: string;
  loading: boolean;
  formError: string | null;
  onTitleChange: (v: string) => void;
  onContentChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onPinnedChange: (v: boolean) => void;
  onExpiresAtChange: (v: string) => void;
  onEventDateChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const AnnouncementFormModal: React.FC<AnnouncementFormModalProps> = (props) => {
  if (!props.open || typeof window === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className={`${props.theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-3xl w-full max-w-2xl max-h-[90vh] relative animate-fadeIn overflow-hidden border ${props.theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
        <AnnouncementForm {...props} />
      </div>
    </div>,
    document.body
  );
};

export default AnnouncementFormModal;
