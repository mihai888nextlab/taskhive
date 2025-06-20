import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Loading from "@/components/Loading";
import TimeStatistics from '@/components/TimeStatistics';
import { useTheme } from '@/components/ThemeContext';
import TimerPanel from '@/components/time-tracking/TimerPanel';
import SessionForm from '@/components/time-tracking/SessionForm';
import SessionList from '@/components/time-tracking/SessionList';
import { Pie } from 'react-chartjs-2';
import { saveAs } from "file-saver";

const TimeTrackingPage = () => {
  const { theme } = useTheme();
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [sessionTag, setSessionTag] = useState(''); // Added state for session tag
  const [sessions, setSessions] = useState<any[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [last7DaysHours, setLast7DaysHours] = useState<number[]>(Array(7).fill(0));
  const [pomodoroMode, setPomodoroMode] = useState(false);
  const [pomodoroPhase, setPomodoroPhase] = useState<'work' | 'break'>('work');
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 min default
  const [pomodoroCycles, setPomodoroCycles] = useState(0);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroMessage, setPomodoroMessage] = useState(''); // Message state for Pomodoro actions

  // Pomodoro durations (customizable)
  const WORK_DURATION = 25 * 60;
  const BREAK_DURATION = 5 * 60;

  useEffect(() => {
    const fetchUserAndSessions = async () => {
      setLoading(true);
      try {
        const userResponse = await fetch('/api/user');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.user);

          if (userData.user?._id) {
            const sessionsResponse = await fetch('/api/time-sessions?userId=' + userData.user._id);
            if (sessionsResponse.ok) {
              const sessionsData = await sessionsResponse.json();
              setSessions(sessionsData.reverse());
              calculateHours(sessionsData);
            }
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndSessions();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const fetchSessionsAndUpdateStats = async () => {
    if (user && user._id) {
      try {
        const response = await fetch('/api/time-sessions?userId=' + user._id);
        if (response.ok) {
          const data = await response.json();
          setSessions(data);
          calculateHours(data);
        }
      } catch {}
    }
  };

  useEffect(() => {
    if (user) {
      fetchSessionsAndUpdateStats();
    }
  }, [user]);

  const handleStart = () => setIsRunning(true);
  const handleStop = () => setIsRunning(false);
  const handleReset = () => {
    setElapsedTime(0);
    setIsRunning(false);
  };

  const handleSaveSession = async () => {
    if (!sessionName.trim() || !sessionDescription.trim() || !user || !user._id) return;
    const sessionData = {
      userId: user._id,
      name: sessionName,
      description: sessionDescription,
      duration: elapsedTime,
      tag: sessionTag, // Include tag in session data
    };
    try {
      const response = await fetch('/api/time-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });
      if (response.ok) {
        setSessionName('');
        setSessionDescription('');
        setSessionTag(''); // Reset tag
        await fetchSessionsAndUpdateStats();
        handleReset();
      }
    } catch {}
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!user || !user._id) {
      console.error("User ID is required for deletion.");
      return;
    }

    try {
      console.log(`Attempting to delete session with ID: ${sessionId} for user ID: ${user._id}`);
      const response = await fetch(`/api/time-sessions?id=${sessionId}&userId=${user._id}`, { method: 'DELETE' });
      if (response.ok) {
        console.log(`Successfully deleted session with ID: ${sessionId}`);
        await fetchSessionsAndUpdateStats();
      } else {
        const errorData = await response.json();
        console.error(`Failed to delete session. Status: ${response.status}, Message: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const calculateHours = (sessions: any[]) => {
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
  };

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
      data: Object.values(tagTotals).map(d => d / 3600), // hours
      backgroundColor: ["#60a5fa", "#f87171", "#34d399", "#fbbf24", "#a78bfa", "#f472b6", "#38bdf8", "#facc15", "#818cf8"],
    }]
  };

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
    const interval = setInterval(() => {
      setPomodoroTime(t => t > 0 ? t - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [pomodoroMode, pomodoroRunning, pomodoroTime, pomodoroPhase]);

  useEffect(() => {
    // When a Pomodoro work session ends, prefill the session form
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
    // eslint-disable-next-line
  }, [pomodoroMode, pomodoroPhase, pomodoroTime]);

  const canSavePomodoro = 
    (pomodoroPhase === 'work' && pomodoroTime === 0) ||
    (pomodoroPhase === 'break');

  if (loading) {
    return <Loading />;
  }

  return (
    <DashboardLayout>
      <div className={`relative min-h-screen p-2 sm:p-4 md:p-8 font-sans overflow-hidden`}>
        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 text-center tracking-tighter leading-tight`}>
          Time Tracking
        </h1>
        {/* Top controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-3 items-center">
            <button
              className="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-all"
              onClick={handleExportCSV}
            >
              Export Sessions as CSV
            </button>
            <button
              className={`px-4 py-2 rounded-full font-semibold shadow transition-all duration-200 ${
                pomodoroMode
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-red-100"
              }`}
              onClick={() => {
                setPomodoroMode(m => !m);
                setPomodoroPhase('work');
                setPomodoroTime(WORK_DURATION);
                setPomodoroRunning(false);
                setPomodoroCycles(0);
              }}
            >
              {pomodoroMode ? "Exit Pomodoro Mode" : "Pomodoro Mode"}
            </button>
          </div>
          <div className="flex justify-center md:justify-end">
            <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-lg shadow">
              🔥 Productivity Streak: {streak} day{streak !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        {pomodoroMode ? (
          <>
            <TimerPanel
              elapsedTime={pomodoroTime} // Pomodoro countdown
              isRunning={pomodoroRunning}
              onStart={() => setPomodoroRunning(true)}
              onStop={() => setPomodoroRunning(false)}
              onReset={() => {
                setPomodoroRunning(false);
                setPomodoroPhase('work');
                setPomodoroTime(WORK_DURATION);
                setPomodoroCycles(0); // <-- Reset cycles on reset
              }}
              theme={theme}
              pomodoroMode={pomodoroMode}
              pomodoroPhase={pomodoroPhase}
              pomodoroTime={pomodoroTime}
              pomodoroCycles={pomodoroCycles}
              workDuration={WORK_DURATION}
              breakDuration={BREAK_DURATION}
            />
            <div className="flex flex-col items-center mb-8">
              <button
                className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold shadow hover:bg-red-700 transition-all text-lg"
                onClick={async () => {
                  // Allow save if just finished a work interval (now in break mode and timer just reset)
                  const justFinishedWork = pomodoroPhase === 'break';
                  if (!(justFinishedWork)) {
                    setPomodoroMessage("⏳ You can only save a Pomodoro session immediately after completing a work interval.");
                    return;
                  }
                  if (!user || !user._id) {
                    setPomodoroMessage("User not loaded. Please refresh the page.");
                    return;
                  }
                  setPomodoroMessage('');
                  const sessionData = {
                    userId: user._id,
                    name: 'Pomodoro Session',
                    description: 'Completed a Pomodoro work session',
                    duration: WORK_DURATION,
                    tag: 'Pomodoro',
                    cycles: pomodoroCycles,
                  };
                  try {
                    const response = await fetch('/api/time-sessions', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(sessionData),
                    });
                    if (response.ok) {
                      await fetchSessionsAndUpdateStats();
                      setElapsedTime(0);
                      setPomodoroPhase('work');
                      setPomodoroTime(WORK_DURATION);
                      setPomodoroRunning(false);
                      setPomodoroCycles(0); // <-- Reset cycles after saving
                    }
                  } catch {
                    setPomodoroMessage("Failed to save session. Please try again.");
                  }
                }}
              >
                Save Pomodoro Session
              </button>
              {pomodoroMessage && (
                <div className="mt-3 text-red-600 font-semibold text-center">
                  {pomodoroMessage}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <TimerPanel
              elapsedTime={elapsedTime} // Stopwatch
              isRunning={isRunning}
              onStart={handleStart}
              onStop={handleStop}
              onReset={handleReset}
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
        <div className={`rounded-2xl shadow-xl p-6 sm:p-8 mb-8 hover:scale-[1.005] hover:shadow-2xl transition-all duration-200 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4 border-b-2 border-blue-200 pb-2`}>
            Time Statistics (Last 7 Days)
          </h2>
          <TimeStatistics last7DaysHours={last7DaysHours} />
        </div>
        <div className={`rounded-2xl shadow-xl p-6 sm:p-8 mb-8 hover:scale-[1.005] hover:shadow-2xl transition-all duration-200 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4 border-b-2 border-blue-200 pb-2`}>
            Time by Tag (Last 7 Days)
          </h2>
          <div style={{ maxWidth: 260, maxHeight: 260 }}>
            <Pie data={pieData} width={200} height={200} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TimeTrackingPage;