import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTimeTracking } from '@/components/time-tracking/TimeTrackingContext';
import { useTheme } from '@/components/ThemeContext';
import { useTranslations } from 'next-intl';
import { saveAs } from 'file-saver';

export function useTimeTrackingPage() {
  const { theme } = useTheme();
  const t = useTranslations('TimeTrackingPage');
  const {
    sessionName, setSessionName,
    sessionDescription, setSessionDescription,
    sessionTag, setSessionTag,
    elapsedTime, isRunning,
    pomodoroMode, setPomodoroMode,
    pomodoroPhase, pomodoroTime, pomodoroCycles, pomodoroRunning,
    WORK_DURATION, BREAK_DURATION,
    startTimer, stopTimer, resetTimer, resetAll, saveSession, user
  } = useTimeTracking();

  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionTagFilter, setSessionTagFilter] = useState("all");
  const [sessionSort, setSessionSort] = useState("dateDesc");
  const [manualModalOpen, setManualModalOpen] = useState(false);

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await fetch('/api/time-sessions?userId=' + user._id);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.reverse());
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?._id) fetchSessions();
  }, [user, fetchSessions]);

  // Memoize streak calculation
  const streak = useMemo(() => {
    const days = new Set(
      sessions.map(s => new Date(s.createdAt).toDateString())
    );
    let streak = 0;
    let d = new Date();
    while (days.has(d.toDateString())) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }, [sessions]);

  // Memoize handleExportCSV
  const handleExportCSV = useCallback(() => {
    if (!sessions.length) return;
    const rows = [
      ["Name", "Description", "Tag", "Duration (h)", "Date"],
      ...sessions.map(s => [
        s.name,
        s.description,
        s.tag || "General",
        (s.duration / 3600).toFixed(2),
        new Date(s.createdAt).toLocaleString(),
      ])
    ];
    const csv = rows.map(r => r.map(f => `"${String(f).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "time_sessions.csv");
  }, [sessions]);

  // Memoize handleDeleteSession
  const handleDeleteSession = useCallback(async (sessionId: string) => {
    if (!user?._id) return;
    await fetch(`/api/time-sessions?id=${sessionId}&userId=${user._id}`, { method: 'DELETE' });
    fetchSessions();
  }, [user, fetchSessions]);

  // Memoize handleSaveSession
  const handleSaveSession = useCallback(async () => {
    await saveSession();
    fetchSessions();
  }, [saveSession, fetchSessions]);

  // Memoize userId
  const userId = useMemo(
    () =>
      user?._id ||
      (typeof window !== "undefined" && localStorage.getItem("userId")) ||
      undefined,
    [user]
  );

  return {
    theme,
    t,
    sessionName, setSessionName,
    sessionDescription, setSessionDescription,
    sessionTag, setSessionTag,
    elapsedTime, isRunning,
    pomodoroMode, setPomodoroMode,
    pomodoroPhase, pomodoroTime, pomodoroCycles, pomodoroRunning,
    WORK_DURATION, BREAK_DURATION,
    startTimer, stopTimer, resetTimer, resetAll, saveSession,
    user,
    sessions, setSessions,
    loading, setLoading,
    sessionSearch, setSessionSearch,
    sessionTagFilter, setSessionTagFilter,
    sessionSort, setSessionSort,
    manualModalOpen, setManualModalOpen,
    fetchSessions,
    streak,
    handleExportCSV,
    handleDeleteSession,
    handleSaveSession,
    userId,
  };
}
