import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

const TimeTrackingPage = () => {
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [sessions, setSessions] = useState<any[]>([]); // Store sessions
  const [elapsedTime, setElapsedTime] = useState(0); // Track elapsed time in seconds
  const [isRunning, setIsRunning] = useState(false); // Track timer state
  const [user, setUser] = useState<any>(null); // Store user data

  useEffect(() => {
    // Fetch user data
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user'); // Call the user endpoint
        if (response.ok) {
          const data = await response.json();
          setUser(data.user); // Store user data
          console.log("Fetched User Data:", data.user); // Log user data
        } else {
          console.error("Failed to fetch user:", await response.text());
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser(); // Fetch user data on component mount
  }, []);

  // Define fetchSessions as a standalone function
  const fetchSessions = async () => {
    if (user) {
      try {
        const response = await fetch('/api/time-sessions?userId=' + user._id);
        if (response.ok) {
          const data = await response.json();
          setSessions(data);
        } else {
          console.error("Failed to fetch sessions:", await response.text());
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    }
  };

  useEffect(() => {
    fetchSessions(); // Fetch sessions when user is available
  }, [user]); // Dependency on user

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1); // Increment elapsed time every second
      }, 1000);
    }

    return () => clearInterval(interval); // Cleanup interval on component unmount or when isRunning changes
  }, [isRunning]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setElapsedTime(0); // Reset elapsed time to 0
    setIsRunning(false); // Stop the timer
  };

  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleSaveSession = async () => {
    if (!sessionName.trim() || !sessionDescription.trim() || !user) return;

    const sessionData = {
      userId: user._id, // Ensure this is defined
      name: sessionName,
      description: sessionDescription,
      duration: elapsedTime, // Ensure this is a number
    };

    console.log("Session Data:", sessionData); // Log the session data

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
        fetchSessions(); // Refresh the session list
        handleReset(); // Reset the timer after saving the session
      } else {
        const errorText = await response.text();
        console.error("Failed to save session:", errorText);
      }
    } catch (error) {
      console.error("Error saving session:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-800">Time Tracking</h1>
        <div className="text-center">
          <h2 className="text-3xl font-bold">{formatTime(elapsedTime)}</h2>
          <div className="mt-4">
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Session Name"
              className="border border-gray-300 p-2 rounded mr-2"
            />
            <input
              type="text"
              value={sessionDescription}
              onChange={(e) => setSessionDescription(e.target.value)}
              placeholder="Session Description"
              className="border border-gray-300 p-2 rounded mr-2"
            />
            <button
              onClick={handleStart}
              className="bg-green-600 text-white py-2 px-4 rounded mr-2"
              disabled={isRunning}
            >
              Start
            </button>
            <button
              onClick={handleStop}
              className="bg-red-600 text-white py-2 px-4 rounded mr-2"
              disabled={!isRunning}
            >
              Stop
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-600 text-white py-2 px-4 rounded"
            >
              Reset
            </button>
            <button
              onClick={handleSaveSession}
              className="bg-blue-600 text-white py-2 px-4 rounded ml-2"
            >
              Save Session
            </button>
          </div>
        </div>
        <div className="mt-6">
          <h2 className="text-2xl font-bold">Saved Sessions</h2>
          <ul>
            {sessions.map((session) => (
              <li key={session._id} className="border-b py-2">
                {session.name}: {formatTime(session.duration)} - {session.description}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TimeTrackingPage;
