import React, { useMemo, useCallback } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilePdf } from "react-icons/fa";
import { saveAs } from "file-saver";
import { FaPlay, FaPause, FaStop, FaSave, FaDownload } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

interface TimeSession {
  name: string;
  description: string;
  tag?: string;
  duration: number;
  createdAt: string;
}

interface TimerAndFormPanelProps {
  elapsedTime: number;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  theme: string;
  sessionName: string;
  sessionDescription: string;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onSave: () => void;
  sessionTag: string;
  setSessionTag: (v: string) => void;
  // Pomodoro props
  pomodoroMode?: boolean;
  pomodoroPhase?: 'work' | 'break';
  pomodoroTime?: number;
  pomodoroCycles?: number;
  workDuration?: number;
  breakDuration?: number;
  sessions?: TimeSession[];
  onExportCSV?: () => void;
}

const TimerAndFormPanel: React.FC<TimerAndFormPanelProps> = React.memo(({
  elapsedTime,
  isRunning,
  onStart,
  onStop,
  onReset,
  theme,
  sessionName,
  sessionDescription,
  onNameChange,
  onDescriptionChange,
  onSave,
  sessionTag,
  setSessionTag,
  pomodoroMode = false,
  pomodoroPhase = 'work',
  pomodoroTime = 0,
  pomodoroCycles = 0,
  workDuration = 25 * 60,
  breakDuration = 5 * 60,
  sessions = [],
  onExportCSV,
}) => {
  // PDF Export Handler for time sessions
  const handleExportPDF = useCallback(() => {
    if (!sessions || sessions.length === 0) {
      alert("No sessions to export.");
      return;
    }
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    // Header (dark blue, like expense list)
    doc.setFillColor(17, 24, 39);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text("Time Sessions Report", 14, 20);
    doc.setFontSize(12);
    doc.setTextColor(34, 34, 34);

    // Table columns
    const columns = [
      { header: "Name", dataKey: "name" },
      { header: "Description", dataKey: "description" },
      { header: "Tag", dataKey: "tag" },
      { header: "Duration (h)", dataKey: "duration" },
      { header: "Date", dataKey: "createdAt" },
    ];

    // Prepare rows
    const rows = sessions.map(s => ({
      name: s.name,
      description: s.description,
      tag: s.tag || "General",
      duration: (s.duration / 3600).toFixed(2),
      createdAt: s.createdAt ? new Date(s.createdAt).toLocaleString() : "",
    }));

    autoTable(doc, {
      startY: 38,
      columns,
      body: rows,
      headStyles: {
        fillColor: [17, 24, 39],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 12,
        halign: 'center',
        valign: 'middle',
        cellPadding: 3.5,
        lineWidth: 0.1,
      },
      bodyStyles: {
        fontSize: 11,
        textColor: 34,
        cellPadding: 2.5,
        halign: 'left',
        valign: 'top',
        lineColor: [220, 220, 220],
        minCellHeight: 8,
        overflow: 'linebreak',
        font: 'helvetica',
      },
      alternateRowStyles: {
        fillColor: [241, 245, 249],
        textColor: 34,
      },
      columnStyles: {
        name: { cellWidth: 32, halign: 'left' },
        description: { cellWidth: 70, halign: 'left' },
        tag: { cellWidth: 22, halign: 'center' },
        duration: { cellWidth: 24, halign: 'center' },
        createdAt: { cellWidth: 38, halign: 'center' },
      },
      margin: { left: (210 - (32 + 70 + 22 + 24 + 38)) / 2, right: (210 - (32 + 70 + 22 + 24 + 38)) / 2 },
      styles: {
        font: 'helvetica',
        fontSize: 11,
        cellPadding: 2.5,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'top',
        minCellHeight: 8,
        textColor: 34,
      },
      didDrawPage: (data) => {
        // Footer (jsPDF types workaround)
        const pageCount = doc.getNumberOfPages();
        const pageNumber = doc.getCurrentPageInfo().pageNumber;
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Page ${pageNumber} of ${pageCount}`,
          200, 290, { align: 'right' });
      },
      didParseCell: function (data) {
        if (data.column.dataKey === 'description') {
          data.cell.styles.valign = 'top';
          data.cell.styles.fontStyle = 'normal';
        }
      },
    });
    doc.save("time_sessions.pdf");
  }, [sessions]);
  const t = useTranslations("TimeTrackingPage");

  // Memoize formatTime
  const formatTime = useCallback((timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, []);

  // Memoize tags
  const tags = useMemo(() => ["General", "Deep Work", "Meeting", "Break", "Learning"], []);

  // Memoize progress calculation
  const totalPhase = useMemo(() => pomodoroPhase === 'work' ? workDuration : breakDuration, [pomodoroPhase, workDuration, breakDuration]);
  const progress = useMemo(() => pomodoroMode ? ((totalPhase - (pomodoroTime || 0)) / totalPhase) * 100 : 0, [pomodoroMode, totalPhase, pomodoroTime]);

  // Memoize input handlers
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onNameChange(e.target.value);
  }, [onNameChange]);
  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onDescriptionChange(e.target.value);
  }, [onDescriptionChange]);
  const handleTagChange = useCallback((v: string) => {
    setSessionTag(v);
  }, [setSessionTag]);
  const handleSave = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  }, [onSave]);

  return (
    <div className="space-y-6">
      {/* Timer Display */}
      <div className="text-center">
        {pomodoroMode ? (
          <>
            <div className={`text-sm font-semibold mb-2 ${pomodoroPhase === 'work' ? 'text-red-600' : 'text-blue-600'}`}>
              {pomodoroPhase === 'work' ? t("workSession") : t("breakTime")} • {t("cycles", { count: pomodoroCycles })}
            </div>
            <div className={`w-full rounded-full h-2 mb-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div
                className={`h-2 rounded-full transition-all duration-300 ${pomodoroPhase === 'work' ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className={`text-3xl font-mono font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {formatTime(pomodoroTime || 0)}
            </div>
          </>
        ) : (
          <div className={`text-3xl font-mono font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatTime(elapsedTime)}
          </div>
        )}
        
      {/* Timer Controls */}
      <div className="flex justify-center gap-2 mb-6">
        {/* Export Buttons moved to session list header */}
          <Button
            onClick={onStart}
            disabled={isRunning}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
              isRunning
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : theme === 'dark'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            <FaPlay className="w-3 h-3" />
            {t("start")}
          </Button>
          <Button
            onClick={onStop}
            disabled={!isRunning}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
              !isRunning
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : theme === 'dark'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            <FaPause className="w-3 h-3" />
            {t("stop")}
          </Button>
          <Button
            onClick={onReset}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            <FaStop className="w-3 h-3" />
            {t("reset")}
          </Button>
        </div>
      </div>

      {/* Session Form */}
      <form
        onSubmit={handleSave}
        className="space-y-4"
      >
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t("sessionName")}
          </label>
          <Input
            type="text"
            value={sessionName}
            onChange={handleNameChange}
            placeholder={t("sessionName")}
            className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 ${
              theme === "dark"
                ? "bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                : "bg-white text-gray-900 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            }`}
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t("sessionDescription")}
          </label>
          <Textarea
            value={sessionDescription}
            onChange={handleDescriptionChange}
            placeholder={t("addNotesContext")}
            rows={3}
            className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 resize-none ${
              theme === "dark"
                ? "bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                : "bg-white text-gray-900 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            }`}
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {t("tag")}
          </label>
          <Select
            value={sessionTag}
            onValueChange={handleTagChange}
            required
            disabled={false}
          >
            <SelectTrigger
              className={`w-full pl-9 pr-8 text-sm rounded-xl border transition-all duration-200 min-w-[140px] ${
                theme === 'dark'
                  ? 'border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500'
                  : 'border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500'
              }`}
            >
              <SelectValue placeholder={t("selectCategory")} />
            </SelectTrigger>
            <SelectContent
              className={`rounded-xl border mt-1 ${
                theme === 'dark'
                  ? 'bg-gray-800 text-white border-gray-700'
                  : 'bg-white text-gray-900 border-gray-200'
              }`}
            >
              {tags.map(tag => (
                <SelectItem
                  key={tag}
                  value={tag}
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-800 text-white hover:bg-green-700/20 data-[state=checked]:bg-green-700/40'
                      : 'bg-white text-gray-900 hover:bg-green-100 data-[state=checked]:bg-green-200'
                  }`}
                >
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          disabled={!sessionName || !sessionDescription || !sessionTag}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-200 ${
            !sessionName || !sessionDescription || !sessionTag
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : theme === 'dark'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <FaSave className="w-4 h-4" />
          {t("saveSession")}
        </Button>
      </form>
    </div>
  );
});

export default React.memo(TimerAndFormPanel);