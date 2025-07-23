import React from "react";
import { createPortal } from "react-dom";
import AnnouncementDetailsModal from "./AnnouncementDetailsModal";

interface AnnouncementDetailsModalWrapperProps {
  open: boolean;
  announcement: any;
  onClose: () => void;
  onDelete: (id: string) => void;
  onPinToggle: (id: string, pinned: boolean) => void;
  isAdmin: boolean;
}

const AnnouncementDetailsModalWrapper: React.FC<AnnouncementDetailsModalWrapperProps> = ({
  open,
  announcement,
  onClose,
  onDelete,
  onPinToggle,
  isAdmin,
}) => {
  if (!open || typeof window === 'undefined') return null;
  return createPortal(
    <AnnouncementDetailsModal
      open={open}
      announcement={announcement}
      onClose={onClose}
      onDelete={onDelete}
      onPinToggle={onPinToggle}
      isAdmin={isAdmin}
    />,
    document.body
  );
};

export default AnnouncementDetailsModalWrapper;
