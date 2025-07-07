import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/sidebar/DashboardLayout';
import { NextPageWithLayout } from "@/types";
import Loading from "@/components/Loading";
import TimerAndFormPanel from '@/components/time-tracking/TimerAndFormPanel';
import SessionList from '@/components/time-tracking/SessionList';
import TimeTrackingHeader from '@/components/time-tracking/TimeTrackingHeader';
import { FaClock, FaChartLine } from 'react-icons/fa';
import { saveAs } from "file-saver";
import { useTimeTracking } from '@/components/time-tracking/TimeTrackingContext';
import { useTheme } from '@/components/ThemeContext';

const TimeTrackingPage: NextPageWithLayout = () => {
  const { theme } = useTheme();
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

  const calculateStreak = (sessions: any[]) => {
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
  };
  const streak = calculateStreak(sessions);

  const handleExportCSV = () => {
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
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!user?._id) return;
    await fetch(`/api/time-sessions?id=${sessionId}&userId=${user._id}`, { method: 'DELETE' });
    fetchSessions();
  };

  const handleSaveSession = async () => {
    await saveSession();
    fetchSessions();
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={`relative min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Main Content */}
      <div className="px-2 lg:px-4 py-4">
        <div className="max-w-[100vw] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            
            {/* Timer Column */}
            <div className="lg:col-span-1">
              <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} overflow-hidden mx-2`}>
                {/* Timer Header */}
                <div className={`px-4 py-3 ${
                  theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-blue-50 border-gray-200"
                } border-b`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
                    }`}>
                      <FaClock className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        Time Tracker
                      </h2>
                      <p className={`text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                        Track your work sessions and productivity
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timer Content */}
                <div className="p-4">
                  <TimerAndFormPanel
                    elapsedTime={elapsedTime}
                    isRunning={pomodoroMode ? pomodoroRunning : isRunning}
                    onStart={startTimer}
                    onStop={stopTimer}
                    onReset={resetTimer}
                    theme={theme}
                    sessionName={sessionName}
                    sessionDescription={sessionDescription}
                    sessionTag={sessionTag}
                    setSessionTag={setSessionTag}
                    onNameChange={setSessionName}
                    onDescriptionChange={setSessionDescription}
                    onSave={handleSaveSession}
                    pomodoroMode={pomodoroMode}
                    pomodoroPhase={pomodoroPhase}
                    pomodoroTime={pomodoroTime}
                    pomodoroCycles={pomodoroCycles}
                    workDuration={WORK_DURATION}
                    breakDuration={BREAK_DURATION}
                  />
                </div>

                {/* Timer Footer */}
                <div className={`px-4 py-3 ${
                  theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                } border-t`}>
                  <TimeTrackingHeader
                    theme={theme}
                    streak={streak}
                    pomodoroMode={pomodoroMode}
                    onExport={handleExportCSV}
                    onPomodoroToggle={() => {
                      setPomodoroMode(!pomodoroMode);
                      resetTimer();
                      resetAll();
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Sessions List Column */}
            <div className="lg:col-span-2">
              <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} h-full max-h-[900px] flex flex-col overflow-hidden mx-2`}>
                {/* Sessions Header */}
                <div className={`flex-shrink-0 px-4 py-3 ${
                  theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-green-50 border-gray-200"
                } border-b`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      theme === 'dark' ? 'bg-green-600' : 'bg-green-500'
                    }`}>
                      <FaChartLine className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        Time Sessions
                      </h2>
                      <p className={`text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                        View and manage your recorded time sessions
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sessions List */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  <SessionList
                    sessions={sessions}
                    onDelete={handleDeleteSession}
                    theme={theme}
                    sessionSearch={sessionSearch}
                    setSessionSearch={setSessionSearch}
                    sessionTagFilter={sessionTagFilter}
                    setSessionTagFilter={setSessionTagFilter}
                    sessionSort={sessionSort}
                    setSessionSort={setSessionSort}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

TimeTrackingPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default TimeTrackingPage;