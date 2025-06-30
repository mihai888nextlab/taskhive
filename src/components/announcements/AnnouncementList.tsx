import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import AnnouncementCard from "./AnnouncementCard";

interface Announcement {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: { firstName: string; lastName: string; email: string };
  category: string;
  pinned: boolean;
  expiresAt?: string;
}

interface AnnouncementListProps {
  announcements: Announcement[];
  theme: string;
  isAdmin?: boolean;
  onPinToggle?: (id: string, pinned: boolean) => void;
  onComment?: (id: string, comment: string) => void;
  onDelete?: (id: string) => void;
  onCardClick?: (announcement: Announcement) => void; // NEW
}

const AnnouncementList: React.FC<AnnouncementListProps> = ({
  announcements,
  theme,
  isAdmin,
  onPinToggle,
  onComment,
  onDelete,
  onCardClick,
}) => (
  <div className="grid grid-cols-1 gap-5">
    <AnimatePresence>
      {announcements.map((a) => (
        <motion.div
          key={a._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
        >
          <AnnouncementCard
            announcement={a}
            theme={theme}
            isAdmin={isAdmin}
            onPinToggle={onPinToggle}
            onComment={onComment}
            onDelete={onDelete}
            onCardClick={onCardClick}
          />
        </motion.div>
      ))}
    </AnimatePresence>
    {announcements.length === 0 && (
      <div className="text-center text-gray-400 py-8 text-base select-none" aria-live="polite">No announcements.</div>
    )}
  </div>
);

export default AnnouncementList;