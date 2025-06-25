import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/sidebar/DashboardLayout';
import Loading from "@/components/Loading";
import TimeStatistics from '@/components/TimeStatistics';
import { useTheme } from '@/components/ThemeContext';
import TimerPanel from '@/components/time-tracking/TimerPanel';
import SessionForm from '@/components/time-tracking/SessionForm';
import SessionList from '@/components/time-tracking/SessionList';
import TimeTrackingHeader from '@/components/time-tracking/TimeTrackingHeader';
import PomodoroSavePanel from '@/components/time-tracking/PomodoroSavePanel';
import StatisticsCard from '@/components/time-tracking/StatisticsCard';
import { Pie } from 'react-chartjs-2';
import { saveAs } from "file-saver";

const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

const TimeTrackingPage = () => {
  const { theme } = useTheme();
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [sessionTag, setSessionTag] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [last7DaysHours, setLast7DaysHours] = useState<number[]>(Array(7).fill(0));
  const [pomodoroMode, setPomodoroMode] = useState(false);
  const [pomodoroPhase, setPomodoroPhase] = useState<'work' | 'break'>('work');
  const [pomodoroTime, setPomodoroTime] = useState(WORK_DURATION);
  const [pomodoroCycles, setPomodoroCycles] = useState(0);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroMessage, setPomodoroMessage] = useState('');

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      const userResponse = await fetch('/api/user');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);
      }
    };
    fetchUser();
  }, []);

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

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Pomodoro logic
  useEffect(() => {
    if (!pomodoroMode || !pomodoroRunning) return;
    if (pomodoroTime === 0) {
      if (pomodoroPhase === 'work') {
        setPomodoroPhase('break');
        setPomodoroTime(BREAK_DURATION);
        setPomodoroCycles(c => c + 1);
      } else {
        setPomodoroPhase('work');
        setPomodoroTime(WORK_DURATION);
      }
      return;
    }
    const interval = setInterval(() => setPomodoroTime(t => t > 0 ? t - 1 : 0), 1000);
    return () => clearInterval(interval);
  }, [pomodoroMode, pomodoroRunning, pomodoroTime, pomodoroPhase]);

  useEffect(() => {
    if (
      pomodoroMode &&
      pomodoroPhase === 'work' &&
      pomodoroTime === 0
    ) {
      setSessionName('Pomodoro Session');
      setSessionDescription('Completed a Pomodoro work session');
      setSessionTag('Pomodoro');
      setElapsedTime(WORK_DURATION);
      setPomodoroRunning(false);
    }
  }, [pomodoroMode, pomodoroPhase, pomodoroTime]);

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

  const handleSaveSession = async () => {
    if (!sessionName.trim() || !sessionDescription.trim() || !user || !user._id) return;
    await fetch('/api/time-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: sessionName,
        description: sessionDescription,
        duration: elapsedTime,
        tag: sessionTag,
        userId: user._id,
      }),
    });
    setSessionName('');
    setSessionDescription('');
    setSessionTag('');
    setElapsedTime(0);
    setIsRunning(false);
    fetchSessions();
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!user?._id) return;
    await fetch(`/api/time-sessions?id=${sessionId}&userId=${user._id}`, { method: 'DELETE' });
    fetchSessions();
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <DashboardLayout>
      <div className={`relative min-h-screen p-2 sm:p-4 md:p-8 font-sans overflow-hidden`}>
        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 text-center tracking-tighter leading-tight`}>
          Time Tracking
        </h1>
        <TimeTrackingHeader
          theme={theme}
          streak={streak}
          pomodoroMode={pomodoroMode}
          onExport={handleExportCSV}
          onPomodoroToggle={() => {
            setPomodoroMode(m => !m);
            setPomodoroPhase('work');
            setPomodoroTime(WORK_DURATION);
            setPomodoroRunning(false);
            setPomodoroCycles(0);
          }}
        />
        {pomodoroMode ? (
          <>
            <TimerPanel
              elapsedTime={pomodoroTime}
              isRunning={pomodoroRunning}
              onStart={() => setPomodoroRunning(true)}
              onStop={() => setPomodoroRunning(false)}
              onReset={() => {
                setPomodoroRunning(false);
                setPomodoroPhase('work');
                setPomodoroTime(WORK_DURATION);
                setPomodoroCycles(0);
              }}
              theme={theme}
              pomodoroMode={pomodoroMode}
              pomodoroPhase={pomodoroPhase}
              pomodoroTime={pomodoroTime}
              pomodoroCycles={pomodoroCycles}
              workDuration={WORK_DURATION}
              breakDuration={BREAK_DURATION}
            />
            <PomodoroSavePanel
              onSave={async () => {
                const justFinishedWork = pomodoroPhase === 'break';
                if (!justFinishedWork) {
                  setPomodoroMessage("⏳ You can only save a Pomodoro session immediately after completing a work interval.");
                  return;
                }
                if (!user || !user._id) {
                  setPomodoroMessage("User not loaded. Please refresh the page.");
                  return;
                }
                setPomodoroMessage('');
                await fetch('/api/time-sessions', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: 'Pomodoro Session',
                    description: 'Completed a Pomodoro work session',
                    duration: WORK_DURATION,
                    tag: 'Pomodoro',
                    cycles: pomodoroCycles,
                    userId: user._id,
                  }),
                });
                setElapsedTime(0);
                setPomodoroPhase('work');
                setPomodoroTime(WORK_DURATION);
                setPomodoroRunning(false);
                setPomodoroCycles(0);
                fetchSessions();
              }}
              message={pomodoroMessage}
            />
          </>
        ) : (
          <>
            <TimerPanel
              elapsedTime={elapsedTime}
              isRunning={isRunning}
              onStart={() => setIsRunning(true)}
              onStop={() => setIsRunning(false)}
              onReset={() => {
                setElapsedTime(0);
                setIsRunning(false);
              }}
              theme={theme}
              pomodoroMode={false}
            />
            <SessionForm
              sessionName={sessionName}
              sessionDescription={sessionDescription}
              sessionTag={sessionTag}
              setSessionTag={setSessionTag}
              onNameChange={setSessionName}
              onDescriptionChange={setSessionDescription}
              onSave={handleSaveSession}
              theme={theme}
            />
          </>
        )}
        <SessionList
          sessions={sessions}
          onDelete={handleDeleteSession}
          theme={theme}
        />
        <StatisticsCard title="Time Statistics (Last 7 Days)" theme={theme}>
          <TimeStatistics last7DaysHours={last7DaysHours} />
        </StatisticsCard>
        <StatisticsCard title="Time by Tag (Last 7 Days)" theme={theme}>
          <div className="flex justify-center items-center" style={{ minHeight: 520 }}>
            <div style={{ maxWidth: 540, maxHeight: 540, width: 540, height: 540 }}>
              <Pie data={pieData} width={520} height={520} />
            </div>
          </div>
        </StatisticsCard>
      </div>
    </DashboardLayout>
  );
};

export default TimeTrackingPage;