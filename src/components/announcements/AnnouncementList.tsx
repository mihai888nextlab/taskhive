import React from "react";
import AnnouncementCard from "./AnnouncementCard";

interface Announcement {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: { firstName: string; lastName: string; email: string };
}

interface AnnouncementListProps {
  announcements: Announcement[];
  theme: string;
}

const AnnouncementList: React.FC<AnnouncementListProps> = ({ announcements, theme }) => (
  <div className="grid grid-cols-1 gap-6">
    {announcements.map((a) => (
      <AnnouncementCard key={a._id} announcement={a} theme={theme} />
    ))}
  </div>
);

export default AnnouncementList;