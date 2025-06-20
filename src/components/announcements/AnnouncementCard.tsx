import React from "react";
import { FaBullhorn } from "react-icons/fa";

interface Announcement {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: { firstName: string; lastName: string; email: string };
}

interface AnnouncementCardProps {
  announcement: Announcement;
  theme: string;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement, theme }) => (
  <div
    className={`group flex flex-col md:flex-row items-start md:items-center p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ring-1 ring-primary/20 border-l-8 border-primary bg-${theme === 'light' ? 'white' : 'gray-800'}`}
  >
    <div className="flex-shrink-0 mr-4 mb-4 md:mb-0">
      <FaBullhorn className="text-4xl text-primary drop-shadow-md" />
    </div>
    <div className="flex-1">
      <h3 className={`text-2xl md:text-3xl font-extrabold leading-tight mb-2 text-${theme === 'light' ? 'gray-900' : 'white'} tracking-tight group-hover:text-primary-dark transition-colors`}>
        {announcement.title}
      </h3>
      <p className={`mb-4 text-base md:text-lg text-${theme === 'light' ? 'gray-700' : 'gray-300'} whitespace-pre-line`}>
        {announcement.content}
      </p>
      <div className={`flex flex-wrap items-center text-xs text-${theme === 'light' ? 'gray-500' : 'gray-400'} mt-2`}>
        <span className="mr-2">Posted by:</span>
        <span className="font-semibold text-primary-dark mr-2">
          {announcement.createdBy.firstName} {announcement.createdBy.lastName}
        </span>
        <span className="mr-2">({announcement.createdBy.email})</span>
        <span className="mx-2">•</span>
        <span>{new Date(announcement.createdAt).toLocaleString()}</span>
      </div>
    </div>
  </div>
);

export default AnnouncementCard;