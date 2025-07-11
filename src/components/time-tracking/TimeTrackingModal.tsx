import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface TimeTrackingModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; duration: number; description: string; tag: string }) => void;
  defaultTitle: string;
  loading?: boolean;
}

const TimeTrackingModal: React.FC<TimeTrackingModalProps> = ({ show, onClose, onSubmit, defaultTitle, loading }) => {
  const [title, setTitle] = useState(defaultTitle);
  // Use number inputs for 24-hour time entry
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [description, setDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const t = useTranslations("TimeTrackingPage");

  // Update title when defaultTitle changes (e.g., when opening for a new task)
  useEffect(() => {
    setTitle(defaultTitle);
  }, [defaultTitle]);

  const handleGenerateDescription = async () => {
    setGenerating(true);
    try {
      const prompt = `Generate a short description for a time tracking entry with the title: "${title}". Do not use markdown or special formatting. Only output the description.`;
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.response) setDescription(data.response);
    } finally {
      setGenerating(false);
    }
  };

  // Helper to get total duration in seconds
  const getTotalDuration = () => hours * 3600 + minutes * 60 + seconds;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = getTotalDuration();
    if (!title || duration === 0) return;
    onSubmit({ title, duration, description, tag: "Tasks" });
  };

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-0 relative border border-gray-200 animate-fadeIn">
        <form onSubmit={handleSubmit} className="p-4 sm:p-8 rounded-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">{t("logTimeForTask")}</h2>
          <button onClick={onClose} type="button" className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold">✕</button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2 after:content-['*'] after:ml-0.5 after:text-red-500">{t("title")}:</label>
              <input
                type="text"
                className="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 placeholder-gray-400 text-base"
                placeholder={t("title")}
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                disabled={loading}
                aria-label="Time entry title"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2 after:content-['*'] after:ml-0.5 after:text-red-500">{t("duration24h")}:</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={hours}
                  onChange={e => setHours(Math.max(0, Math.min(23, Number(e.target.value))))}
                  disabled={loading}
                  aria-label={t("hours")}
                  placeholder={t("hours")}
                  className="w-16 py-3 px-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary text-base"
                />
                <span className="self-center">:</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={minutes}
                  onChange={e => setMinutes(Math.max(0, Math.min(59, Number(e.target.value))))}
                  disabled={loading}
                  aria-label={t("minutes")}
                  placeholder={t("minutes")}
                  className="w-16 py-3 px-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary text-base"
                />
                <span className="self-center">:</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={seconds}
                  onChange={e => setSeconds(Math.max(0, Math.min(59, Number(e.target.value))))}
                  disabled={loading}
                  aria-label={t("seconds")}
                  placeholder={t("seconds")}
                  className="w-16 py-3 px-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary text-base"
                />
              </div>
            </div>
          </div>
          <div className="mb-6 sm:mb-8">
            <label className="block text-gray-700 text-sm font-semibold mb-2">{t("descriptionOptional")}</label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <textarea
                rows={4}
                className="flex-1 py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y transition-all duration-200 placeholder-gray-400 text-base"
                placeholder={t("describeWorkedOn")}
                value={description}
                onChange={e => setDescription(e.target.value)}
                disabled={loading || generating}
                aria-label="Time entry description"
              />
              <button
                type="button"
                className="sm:ml-2 px-3 py-2 bg-primary text-white rounded-lg flex items-center font-semibold shadow hover:bg-primary-dark transition disabled:opacity-60 mt-2 sm:mt-0"
                onClick={handleGenerateDescription}
                disabled={!title || generating}
                title={t("generateDescription")}
              >
                {generating ? <span className="animate-spin">...</span> : <span className="mr-1">⚡</span>}
                {t("generate")}
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-300 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 text-lg"
              disabled={loading}
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 text-lg"
              disabled={loading || !title || getTotalDuration() === 0}
            >
              {t("logTime")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimeTrackingModal;
