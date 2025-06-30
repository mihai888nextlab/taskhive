import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Timer and Pomodoro durations (in seconds)
const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

interface TimeTrackingContextType {
  sessionName: string;
  setSessionName: React.Dispatch<React.SetStateAction<string>>;
  sessionDescription: string;
  setSessionDescription: React.Dispatch<React.SetStateAction<string>>;
  sessionTag: string;
  setSessionTag: React.Dispatch<React.SetStateAction<string>>;
  elapsedTime: number;
  setElapsedTime: React.Dispatch<React.SetStateAction<number>>;
  isRunning: boolean;
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
  pomodoroMode: boolean;
  setPomodoroMode: React.Dispatch<React.SetStateAction<boolean>>;
  pomodoroPhase: 'work' | 'break';
  setPomodoroPhase: React.Dispatch<React.SetStateAction<'work' | 'break'>>;
  pomodoroTime: number;
  setPomodoroTime: React.Dispatch<React.SetStateAction<number>>;
  pomodoroCycles: number;
  setPomodoroCycles: React.Dispatch<React.SetStateAction<number>>;
  pomodoroRunning: boolean;
  setPomodoroRunning: React.Dispatch<React.SetStateAction<boolean>>;
  resetAll: () => void;
  WORK_DURATION: number;
  BREAK_DURATION: number;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  saveSession: () => Promise<void>;
}

const TimeTrackingContext = createContext<TimeTrackingContextType | null>(null);

export const useTimeTracking = () => {
  const ctx = useContext(TimeTrackingContext);
  if (!ctx) throw new Error('useTimeTracking must be used within a TimeTrackingProvider');
  return ctx;
};

export const TimeTrackingProvider = ({ children }: { children: ReactNode }) => {
  // Timer state
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [sessionTag, setSessionTag] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  // Pomodoro
  const [pomodoroMode, setPomodoroMode] = useState(false);
  const [pomodoroPhase, setPomodoroPhase] = useState<'work' | 'break'>('work');
  const [pomodoroTime, setPomodoroTime] = useState(WORK_DURATION);
  const [pomodoroCycles, setPomodoroCycles] = useState(0);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  // User state
  const [user, setUser] = useState<any>(null);

  // Fetch user on mount
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

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRunning && !pomodoroMode) {
      interval = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isRunning, pomodoroMode]);

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

  // When a Pomodoro work phase completes, set session fields and stop Pomodoro
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

  // Reset all state (for when session is saved)
  const resetAll = useCallback(() => {
    setSessionName('');
    setSessionDescription('');
    setSessionTag('');
    setElapsedTime(0);
    setIsRunning(false);
    setPomodoroMode(false);
    setPomodoroPhase('work');
    setPomodoroTime(WORK_DURATION);
    setPomodoroRunning(false);
    setPomodoroCycles(0);
  }, []);

  // Save session handler
  const saveSession = useCallback(async () => {
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
    resetAll();
    // Optionally: trigger a callback or event to refresh session list
  }, [sessionName, sessionDescription, user, elapsedTime, sessionTag, resetAll]);

  // Timer/Pomodoro controls
  const startTimer = () => {
    if (pomodoroMode) {
      setPomodoroRunning(true);
    } else {
      setIsRunning(true);
    }
  };
  const stopTimer = () => {
    if (pomodoroMode) {
      setPomodoroRunning(false);
    } else {
      setIsRunning(false);
    }
  };
  const resetTimer = () => {
    if (pomodoroMode) {
      setPomodoroPhase('work');
      setPomodoroTime(WORK_DURATION);
      setPomodoroRunning(false);
      setPomodoroCycles(0);
    } else {
      setElapsedTime(0);
      setIsRunning(false);
    }
  };

  return (
    <TimeTrackingContext.Provider
      value={{
        sessionName, setSessionName,
        sessionDescription, setSessionDescription,
        sessionTag, setSessionTag,
        elapsedTime, setElapsedTime,
        isRunning, setIsRunning,
        pomodoroMode, setPomodoroMode,
        pomodoroPhase, setPomodoroPhase,
        pomodoroTime, setPomodoroTime,
        pomodoroCycles, setPomodoroCycles,
        pomodoroRunning, setPomodoroRunning,
        resetAll,
        WORK_DURATION, BREAK_DURATION,
        startTimer, stopTimer, resetTimer,
        user,
        setUser,
        saveSession,
      }}
    >
      {children}
    </TimeTrackingContext.Provider>
  );
};
