import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/sidebar/DashboardLayout';
import Loading from "@/components/Loading";
import TimeStatistics from '@/components/TimeStatistics';
import TimerAndFormPanel from '@/components/time-tracking/TimerAndFormPanel';
import SessionList from '@/components/time-tracking/SessionList';
import TimeTrackingHeader from '@/components/time-tracking/TimeTrackingHeader';
import PomodoroSavePanel from '@/components/time-tracking/PomodoroSavePanel';
import StatisticsCard from '@/components/time-tracking/StatisticsCard';
import { Pie } from 'react-chartjs-2';
import { saveAs } from "file-saver";
import { useTimeTracking } from '@/components/time-tracking/TimeTrackingContext';

const TimeTrackingPage = () => {
  const { sessionName, setSessionName, sessionDescription, setSessionDescription, sessionTag, setSessionTag, elapsedTime, isRunning, pomodoroMode, pomodoroPhase, pomodoroTime, pomodoroCycles, pomodoroRunning, WORK_DURATION, BREAK_DURATION, startTimer, stopTimer, resetTimer, resetAll, saveSession, user } = useTimeTracking();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [last7DaysHours, setLast7DaysHours] = useState<number[]>(Array(7).fill(0));
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionTagFilter, setSessionTagFilter] = useState("all");
  const [sessionSort, setSessionSort] = useState("dateDesc");
  const { theme } = { theme: 'light' };

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

  // Statistics
  useEffect(() => {
    if (!sessions.length) return;
    const last7DaysTotal = Array(7).fill(0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    sessions.forEach(session => {
      const sessionDate = new Date(session.createdAt);
      sessionDate.setHours(0, 0, 0, 0);
      const timeDifference = today.getTime() - sessionDate.getTime();
      const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));
      if (daysDifference >= 0 && daysDifference < 7) {
        last7DaysTotal[daysDifference] += session.duration;
      }
    });
    setLast7DaysHours(last7DaysTotal.map(hours => hours / 3600));
  }, [sessions]);

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

  const tagTotals: Record<string, number> = {};
  sessions.forEach(s => {
    const tag = s.tag || "General";
    tagTotals[tag] = (tagTotals[tag] || 0) + s.duration;
  });
  const pieData = {
    labels: Object.keys(tagTotals),
    datasets: [{
      data: Object.values(tagTotals).map(d => d / 3600),
      backgroundColor: ["#60a5fa", "#f87171", "#34d399", "#fbbf24", "#a78bfa", "#f472b6", "#38bdf8", "#facc15", "#818cf8"],
    }]
  };

  // Handlers
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

  // Filtered and sorted sessions
  const filteredSessions = sessions.filter(s => {
    const matchesSearch =
      sessionSearch.trim() === "" ||
      s.name?.toLowerCase().includes(sessionSearch.toLowerCase()) ||
      s.description?.toLowerCase().includes(sessionSearch.toLowerCase());
    const matchesTag =
      sessionTagFilter === "all" || (s.tag || "General") === sessionTagFilter;
    return matchesSearch && matchesTag;
  }).sort((a, b) => {
    if (sessionSort === "dateDesc") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sessionSort === "dateAsc") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sessionSort === "durationDesc") {
      return b.duration - a.duration;
    } else if (sessionSort === "durationAsc") {
      return a.duration - b.duration;
    }
    return 0;
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <DashboardLayout>
      <div className="relative min-h-screen p-2 sm:p-4 md:p-8 font-sans overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-8 w-full">
          {/* Left: Session List */}
          <div className="w-full lg:w-2/3">
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
          {/* Right: Timer + Form (now combined) + Header below */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
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
              onSave={saveSession}
              pomodoroMode={pomodoroMode}
              pomodoroPhase={pomodoroPhase}
              pomodoroTime={pomodoroTime}
              pomodoroCycles={pomodoroCycles}
              workDuration={WORK_DURATION}
              breakDuration={BREAK_DURATION}
            />
            <TimeTrackingHeader
              theme={theme}
              streak={streak}
              pomodoroMode={pomodoroMode}
              onExport={handleExportCSV}
              onPomodoroToggle={() => {
                resetTimer();
                resetAll();
              }}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TimeTrackingPage;