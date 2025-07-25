import React, { useState, useCallback } from "react";
import { useTheme } from "@/components/ThemeContext";
import { FaSpinner, FaPlus, FaTimes } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

interface AddManualSessionModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  onAdded?: () => void;
}

const tags = ["General", "Deep Work", "Meeting", "Break", "Learning"];

function parseDurationFromFields(hours: string, minutes: string, seconds: string) {
  return (
    (parseInt(hours, 10) || 0) * 3600 +
    (parseInt(minutes, 10) || 0) * 60 +
    (parseInt(seconds, 10) || 0)
  );
}

function formatDurationToFields(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return {
    hours: String(h).padStart(2, "0"),
    minutes: String(m).padStart(2, "0"),
    seconds: String(s).padStart(2, "0"),
  };
}

const AddManualSessionModal: React.FC<AddManualSessionModalProps> = React.memo(({
  open,
  onClose,
  userId,
  onAdded,
}) => {
  const t = useTranslations("TimeTrackingPage");
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState(tags[0]);
  const [duration, setDuration] = useState(0);
  const [cycles, setCycles] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [seconds, setSeconds] = useState("00");

  if (!open) return null;

  // Sync duration fields when duration changes (if you want to support external changes)
  React.useEffect(() => {
    const { hours: h, minutes: m, seconds: s } = formatDurationToFields(duration);
    setHours(h);
    setMinutes(m);
    setSeconds(s);
    // eslint-disable-next-line
  }, [duration]);

  // Fix: Use parseDurationFromFields for validation in Save button
  const isSaveDisabled =
    loading ||
    !name ||
    !description ||
    !tag ||
    parseDurationFromFields(hours, minutes, seconds) === 0 ||
    !cycles;

  // Memoize submit handler
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const totalDuration = parseDurationFromFields(hours, minutes, seconds);
    if (totalDuration === 0) {
      setError("Duration must be greater than 0.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/time-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name,
          description,
          duration: totalDuration,
          tag,
          cycles,
        }),
      });
      if (!res.ok) {
        setError("Failed to add session.");
        setLoading(false);
        return;
      }
      setName("");
      setDescription("");
      setTag(tags[0]);
      setDuration(0);
      setHours("00");
      setMinutes("00");
      setSeconds("00");
      setCycles(1);
      if (onAdded) onAdded();
      onClose();
    } catch (err) {
      setError("Failed to add session.");
    } finally {
      setLoading(false);
    }
  }, [userId, name, description, tag, hours, minutes, seconds, cycles, onAdded, onClose, loading]);

  // Memoize input handlers
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);
  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  }, []);
  const handleTagChange = useCallback((v: string) => {
    setTag(v);
  }, []);
  const handleHoursChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setHours(e.target.value.padStart(2, "0"));
  }, []);
  const handleMinutesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMinutes(e.target.value.padStart(2, "0"));
  }, []);
  const handleSecondsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSeconds(e.target.value.padStart(2, "0"));
  }, []);
  const handleCyclesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCycles(Number(e.target.value));
  }, []);

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4`}>
      <div className={`rounded-3xl shadow-2xl w-full max-w-md relative animate-fadeIn overflow-hidden ${theme === 'dark' ? 'bg-gray-900 border border-gray-700 text-white' : 'bg-white'}`}>
        {/* Close Button */}
        <button
          className={`absolute top-4 right-4 text-xl font-bold z-10 transition-colors ${theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
          onClick={onClose}
          aria-label="Close modal"
        >
          <FaTimes />
        </button>
        {/* Header */}
        <div className={`p-6 border-b flex items-center gap-4 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <div className={`p-3 ${theme === 'dark' ? 'bg-blue-700' : 'bg-blue-600'} rounded-xl shadow-lg`}>
            <FaPlus className="text-xl text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("logNewSession")}</h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t("logTimeForTask")}</p>
          </div>
        </div>
        {/* Content */}
        <div className="p-6">
          {error && (
            <div className={`mb-2 p-2 rounded-lg border ${theme === 'dark' ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'}`}> 
              <p className={`font-medium text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4" id="manual-session-form">
            <div>
              <label className={`block font-semibold mb-2 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("sessionName")}</label>
              <Input
                type="text"
                value={name}
                onChange={handleNameChange}
                required
                placeholder={t("sessionName")}
                disabled={loading}
                className={`w-full px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm ${theme === 'dark' ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'}`}
              />
            </div>
            <div>
              <label className={`block font-semibold mb-2 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("sessionDescription")}</label>
              <Textarea
                value={description}
                onChange={handleDescriptionChange}
                required
                placeholder={t("sessionDescription")}
                rows={2}
                disabled={loading}
                className={`w-full px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm ${theme === 'dark' ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'}`}
              />
            </div>
            <div>
              <label className={`block font-semibold mb-2 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("tag")}</label>
              <Select
                value={tag}
                onValueChange={handleTagChange}
                required
                disabled={loading}
              >
                <SelectTrigger className={`w-full px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm ${theme === 'dark' ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white border border-gray-300'}`}>
                  <SelectValue placeholder={t("selectCategory")} />
                </SelectTrigger>
                <SelectContent className={`${theme === 'dark' ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white border border-gray-300'} rounded-lg shadow-lg p-0 z-[250]`}>
                  {tags.map(tagName => (
                    <SelectItem key={tagName} value={tagName} className={`px-4 py-2 text-sm cursor-pointer transition-colors ${theme === 'dark' ? 'text-white bg-gray-800 hover:bg-green-900 focus:bg-green-900 data-[state=checked]:bg-green-900 data-[state=checked]:text-green-400' : 'text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700'}`}>
                      {tagName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className={`block font-semibold mb-2 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("duration24h")}</label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  min={0}
                  max={99}
                  value={hours}
                  onChange={handleHoursChange}
                  placeholder={t("hours")}
                  className={`w-16 text-center px-2 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm ${theme === 'dark' ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'}`}
                  disabled={loading}
                />
                <span className={`mx-1 font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>:</span>
                <Input
                  type="number"
                  min={0}
                  max={59}
                  value={minutes}
                  onChange={handleMinutesChange}
                  placeholder={t("minutes")}
                  className={`w-16 text-center px-2 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm ${theme === 'dark' ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'}`}
                  disabled={loading}
                />
                <span className={`mx-1 font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>:</span>
                <Input
                  type="number"
                  min={0}
                  max={59}
                  value={seconds}
                  onChange={handleSecondsChange}
                  placeholder={t("seconds")}
                  className={`w-16 text-center px-2 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm ${theme === 'dark' ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'}`}
                  disabled={loading}
                />
                <span className={`text-xs ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>hh:mm:ss</span>
              </div>
            </div>
          </form>
        </div>
        {/* Footer */}
        <div className={`p-6 border-t flex gap-3 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 text-sm ${theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            disabled={loading}
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            form="manual-session-form"
            onClick={handleSubmit}
            disabled={isSaveDisabled}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 text-sm ${
              isSaveDisabled
                ? theme === 'dark'
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : theme === 'dark'
                  ? 'bg-blue-700 text-white hover:bg-blue-800 shadow-sm hover:shadow-md'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin w-3 h-3" />
                {t("saving")}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <FaPlus className="w-3 h-3" />
                {t("saveSession")}
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});

export default React.memo(AddManualSessionModal);
