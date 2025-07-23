import React from "react";
import { FaBullhorn } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DashboardAnnouncementPreviewProps {
  loadingAnnouncement: boolean;
  announcementError: string | null;
  announcementPreview: any;
  theme: string;
  t: any;
}

const DashboardAnnouncementPreview: React.FC<DashboardAnnouncementPreviewProps> = ({
  loadingAnnouncement,
  announcementError,
  announcementPreview,
  theme,
  t,
}) => {
  return (
    <>
      {loadingAnnouncement ? (
        <div className="flex flex-col justify-center items-center h-32 bg-primary-light/10 rounded-lg animate-pulse">
          <FaBullhorn className="animate-bounce text-primary text-4xl mb-3" />
          <span className="text-sm font-medium">
            {t("loadingAnnouncement", {
              default: "Loading announcement...",
            })}
          </span>
        </div>
      ) : announcementError ? (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-400 p-4 rounded-md shadow-sm text-center font-medium">
          <p className="mb-1">
            {t("failedToLoadAnnouncement", {
              default: "Failed to load announcement:",
            })}
          </p>
          <p className="text-sm italic">{announcementError}</p>
        </div>
      ) : !announcementPreview ? (
        <div className="text-center py-16">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <FaBullhorn className="text-2xl text-gray-400" />
          </div>
          <h3
            className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            {t("noAnnouncementsYet", { default: "No announcements yet" })}
          </h3>
          <p
            className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
          >
            {t("checkBackLater", {
              default: "Check back later for company updates and news",
            })}
          </p>
        </div>
      ) : (
        <div
          className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-xl shadow-md border ${announcementPreview.pinned ? (theme === "dark" ? "bg-yellow-900 border-yellow-700" : "bg-gradient-to-r from-yellow-50 to-white border-yellow-200") : theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-gradient-to-r from-blue-50 to-white border-primary-light/50"} hover:scale-101 transition-all duration-300 group`}
          style={{ opacity: announcementPreview.pinned ? 1 : 0.95 }}
        >
          <div className="flex-1 pr-0 sm:pr-4 w-full min-w-0">
            <span
              className={`block font-bold text-lg sm:text-xl leading-tight break-words ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}
            >
              {announcementPreview.title}
            </span>
            <div
              className={`mt-2 line-clamp-2 break-words ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {announcementPreview.content}
              </ReactMarkdown>
            </div>
            <div className="mt-3 text-xs sm:text-sm font-semibold flex flex-wrap items-center gap-2">
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold text-white ${announcementPreview.pinned ? "bg-yellow-500" : "bg-blue-500"}`}
              >
                {announcementPreview.category}
              </span>
              {announcementPreview.pinned && (
                <span className="ml-2 px-2.5 py-1 bg-yellow-400 text-white text-xs rounded-full font-bold flex items-center gap-1">
                  <FaBullhorn />
                  Pinned
                </span>
              )}
              <span
                className={
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }
              >
                By {announcementPreview.createdBy?.firstName} {announcementPreview.createdBy?.lastName}
              </span>
              <span
                className={
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }
              >
                •{" "}
                {announcementPreview.category === "Event" && announcementPreview.eventDate
                  ? new Date(announcementPreview.eventDate).toLocaleDateString()
                  : announcementPreview.expiresAt
                  ? new Date(announcementPreview.expiresAt).toLocaleDateString()
                  : new Date(announcementPreview.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="self-center pl-0 sm:pl-3 mt-3 sm:mt-0 hidden sm:block">
            <FaBullhorn
              className={`text-3xl sm:text-4xl ${announcementPreview.pinned ? "text-yellow-400" : "text-primary"}`}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(DashboardAnnouncementPreview);
