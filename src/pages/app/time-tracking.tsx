import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Loading from "@/components/Loading";
import TimeStatistics from '@/components/TimeStatistics';
import { useTheme } from '@/components/ThemeContext';
import TimerPanel from '@/components/time-tracking/TimerPanel';
import SessionForm from '@/components/time-tracking/SessionForm';
import SessionList from '@/components/time-tracking/SessionList';

const TimeTrackingPage = () => {
  const { theme } = useTheme();
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [sessions, setSessions] = useState<any[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [last7DaysHours, setLast7DaysHours] = useState<number[]>(Array(7).fill(0));

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
        await fetchSessionsAndUpdateStats();
        handleReset();
      }
    } catch {}
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/time-sessions/${sessionId}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchSessionsAndUpdateStats();
      }
    } catch {}
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

  if (loading) {
    return <Loading />;
  }

  return (
    <DashboardLayout>
      <div className={`relative min-h-screen p-2 sm:p-4 md:p-8 font-sans overflow-hidden`}>
        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 text-center tracking-tighter leading-tight`}>
          Time Tracking
        </h1>
        <TimerPanel
          elapsedTime={elapsedTime}
          isRunning={isRunning}
          onStart={handleStart}
          onStop={handleStop}
          onReset={handleReset}
          theme={theme}
        />
        <SessionForm
          sessionName={sessionName}
          sessionDescription={sessionDescription}
          onNameChange={setSessionName}
          onDescriptionChange={setSessionDescription}
          onSave={handleSaveSession}
          theme={theme}
        />
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
      </div>
    </DashboardLayout>
  );
};

export default TimeTrackingPage;