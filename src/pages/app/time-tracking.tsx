import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Loading from "@/components/Loading"; // Assuming you have a Loading component
import { FaTrash } from "react-icons/fa"; // Import the delete icon
import TimeStatistics from '@/components/TimeStatistics'; // Import the new chart component
import { useTheme } from '@/components/ThemeContext'; // Import the theme context

const TimeTrackingPage = () => {
  const { theme } = useTheme(); // Get the current theme from context
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [sessions, setSessions] = useState<any[]>([]); // Store sessions
  const [elapsedTime, setElapsedTime] = useState(0); // Track elapsed time in seconds
  const [isRunning, setIsRunning] = useState(false); // Track timer state
  const [user, setUser] = useState<any>(null); // Store user data
  const [loading, setLoading] = useState(true); // Loading state for user and sessions
  const [last7DaysHours, setLast7DaysHours] = useState<number[]>(Array(7).fill(0)); // Initialize as an array

  useEffect(() => {
    const fetchUserAndSessions = async () => {
      setLoading(true);
      try {
        // Fetch user data
        const userResponse = await fetch('/api/user');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.user);

          // Fetch sessions after user is set
          if (userData.user?._id) {
            const sessionsResponse = await fetch('/api/time-sessions?userId=' + userData.user._id);
            if (sessionsResponse.ok) {
              const sessionsData = await sessionsResponse.json();
              setSessions(sessionsData.reverse()); // Reverse the array to show newest first
              calculateHours(sessionsData); // Calculate stats after fetching sessions
            } else {
              console.error("Failed to fetch sessions:", await sessionsResponse.text());
            }
          }
        } else {
          console.error("Failed to fetch user:", await userResponse.text());
        }
      } catch (error) {
        console.error("Error fetching user or sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndSessions();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  // This function is now responsible for fetching and updating sessions,
  // and then recalculating statistics.
  const fetchSessionsAndUpdateStats = async () => {
    if (user && user._id) {
      try {
        const response = await fetch('/api/time-sessions?userId=' + user._id);
        if (response.ok) {
          const data = await response.json();
          setSessions(data);
          calculateHours(data); // Recalculate stats after fetching new sessions
        } else {
          console.error("Failed to fetch sessions:", await response.text());
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    }
  };

  // Call fetchSessionsAndUpdateStats when user is available (initial load)
  useEffect(() => {
    if (user) {
      fetchSessionsAndUpdateStats();
    }
  }, [user]);


  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setElapsedTime(0);
    setIsRunning(false);
  };

  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      if (response.ok) {
        setSessionName('');
        setSessionDescription('');
        await fetchSessionsAndUpdateStats(); // Refresh the session list and stats
        handleReset();
      } else {
        const errorText = await response.text();
        console.error("Failed to save session:", errorText);
      }
    } catch (error) {
      console.error("Error saving session:", error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/time-sessions/${sessionId}`, { // Ensure this matches your API route for DELETE
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchSessionsAndUpdateStats(); // Refresh the session list and stats after deletion
      } else {
        const errorText = await response.text();
        console.error("Failed to delete session:", errorText);
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const calculateHours = (sessions: any[]) => {
    const last7DaysTotal = Array(7).fill(0); // Array to hold hours for the last 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to start of day

    sessions.forEach(session => {
        const sessionDate = new Date(session.createdAt); // Assuming you have a createdAt field
        sessionDate.setHours(0, 0, 0, 0); // Normalize session date to start of day

        const timeDifference = today.getTime() - sessionDate.getTime();
        const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));

        if (daysDifference >= 0 && daysDifference < 7) {
            last7DaysTotal[daysDifference] += session.duration; // Fill the array in the correct order
        }
    });

    // Set the state with the last 7 days hours
    setLast7DaysHours(last7DaysTotal.map(hours => hours / 3600)); // Convert seconds to hours
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

        {/* Main Timer and Controls Card */}
        <div className={`rounded-2xl p-6 sm:p-8 mb-8 hover:scale-[1.005] hover:shadow-2xl transition-all duration-200 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="text-center mb-6">
            <h2 className={`text-4xl sm:text-5xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-mono tracking-wide`}>
              {formatTime(elapsedTime)}
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 justify-center items-center mb-8">
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Session Name"
              className={`w-full sm:w-auto flex-grow px-4 py-2 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
            />
            <input
              type="text"
              value={sessionDescription}
              onChange={(e) => setSessionDescription(e.target.value)}
              placeholder="Session Description"
              className={`w-full sm:w-auto flex-grow px-4 py-2 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
            />
            <button
              onClick={handleStart}
              className={`w-full sm:w-auto inline-flex items-center justify-center ${theme === 'dark' ? 'bg-green-600' : 'bg-gradient-to-r from-green-500 to-green-700'} text-white font-bold py-2 sm:py-2.5 px-4 sm:px-5 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-all duration-300 active:scale-95`}
              disabled={isRunning}
            >
              Start
            </button>
            <button
              onClick={handleStop}
              className={`w-full sm:w-auto inline-flex items-center justify-center ${theme === 'dark' ? 'bg-red-600' : 'bg-gradient-to-r from-red-500 to-red-700'} text-white font-bold py-2 sm:py-2.5 px-4 sm:px-5 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-300 active:scale-95`}
              disabled={!isRunning}
            >
              Stop
            </button>
            <button
              onClick={handleReset}
              className={`w-full sm:w-auto inline-flex items-center justify-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-gradient-to-r from-gray-500 to-gray-700'} text-white font-bold py-2 sm:py-2.5 px-4 sm:px-5 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-300 active:scale-95`}
            >
              Reset
            </button>
            <button
              onClick={handleSaveSession}
              className={`w-full sm:w-auto inline-flex items-center justify-center ${theme === 'dark' ? 'bg-blue-600' : 'bg-gradient-to-r from-blue-500 to-blue-700'} text-white font-bold py-2 sm:py-2.5 px-4 sm:px-5 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 active:scale-95`}
            >
              Save Session
            </button>
          </div>
        </div>

        {/* Saved Sessions List Card */}
        <div className={`rounded-2xl shadow-xl p-6 sm:p-8 mb-8 hover:scale-[1.005] hover:shadow-2xl transition-all duration-200 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4 border-b-2 border-blue-200 pb-2`}>
            Saved Sessions
          </h2>
          <ul className="space-y-4">
            {sessions.length === 0 ? (
              <p className={`text-gray-600 italic text-center py-4 ${theme === 'dark' ? 'text-gray-400' : ''}`}>No sessions saved yet.</p>
            ) : (
              sessions.slice().reverse().map((session) => (
                <li
                  key={session._id}
                  className={`p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'} hover:border-blue-200 transition-transform transform hover:scale-101 hover:shadow-md transition-all duration-200`}
                >
                  <div className="flex-1 mb-2 sm:mb-0">
                    <p className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{session.name}</p>
                    <p className={`text-md ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{session.description}</p>
                    {session.createdAt && (
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                        Saved on: {new Date(session.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className={`text-2xl font-mono ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'} font-bold mr-4`}>
                      {formatTime(session.duration)}
                    </span>
                    <button
                      onClick={() => handleDeleteSession(session._id)}
                      className={`text-red-500 hover:text-red-700 p-3 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors active:scale-95`}
                      title="Delete Session"
                    >
                      <FaTrash className="text-lg" />
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Statistics Card */}
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
