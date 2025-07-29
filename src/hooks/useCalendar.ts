import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTheme } from '@/components/ThemeContext';

export function useCalendarPage() {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState<boolean>(false);
  const [listError, setListError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [announcementEvents, setAnnouncementEvents] = useState<any[]>([]);

  const fetchAnnouncementEvents = useCallback(async () => {
    try {
      const response = await fetch("/api/announcements?category=Event", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch announcement events.");
      }
      let data = await response.json();
      data = data.filter((ev: any) => ev.eventDate);
      const mapped = data.map((ev: any) => ({ ...ev, description: ev.content }));
      setAnnouncementEvents(mapped);
      localStorage.setItem("announcementEvents", JSON.stringify(mapped));
    } catch (err) {
    }
  }, []);

  const handleDateChange = useCallback((date: Date | null) => {
    setSelectedDate(date);
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const response = await fetch("/api/tasks", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch tasks.");
      }
      let data = await response.json();
      data.sort((a: any, b: any) => {
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
        const dateA = new Date(a.deadline).getTime();
        const dateB = new Date(b.deadline).getTime();
        return dateA - dateB;
      });
      setTasks(data);
      localStorage.setItem("userTasks", JSON.stringify(data));
    } catch (err) {
      setListError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchAnnouncementEvents();
  }, [fetchTasks, fetchAnnouncementEvents]);

  const handleTaskDrop = useCallback(async (dragData: string, date: Date) => {
    setLoading(true);
    setListError(null);
    let type = 'task';
    let itemId = dragData;
    if (dragData.includes(':')) {
      const [prefix, id] = dragData.split(':');
      type = prefix;
      itemId = id;
    }
    try {
      if (type === 'task') {
        const response = await fetch(`/api/tasks/${itemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deadline: date }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update task deadline.");
        }
        await fetchTasks();
      } else if (type === 'event') {
        const response = await fetch(`/api/announcements/${itemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventDate: date }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update event date.");
        }
        await fetchAnnouncementEvents();
      }
    } catch (err) {
      setListError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [fetchTasks, fetchAnnouncementEvents]);

  const deadlines = useMemo(() => tasks.map((task: any) => new Date(task.deadline).toDateString()), [tasks]);
  const eventDates = useMemo(() => announcementEvents.map((ev: any) => new Date(ev.eventDate).toDateString()), [announcementEvents]);

  return {
    theme,
    selectedDate,
    setSelectedDate,
    loading,
    setLoading,
    listError,
    setListError,
    tasks,
    setTasks,
    announcementEvents,
    setAnnouncementEvents,
    fetchAnnouncementEvents,
    handleDateChange,
    fetchTasks,
    handleTaskDrop,
    deadlines,
    eventDates,
  };
}
