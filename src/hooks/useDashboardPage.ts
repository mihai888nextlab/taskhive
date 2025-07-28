import { useEffect, useState, useMemo } from "react";
import { useTheme } from "@/components/ThemeContext";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { Task } from "@/types/task";

export function useDashboardPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const t = useTranslations("DashboardPage");

  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncomes, setTotalIncomes] = useState(0);
  const [profit, setProfit] = useState(0);

  const [announcementPreview, setAnnouncementPreview] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [loadingAnnouncement, setLoadingAnnouncement] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const [announcementError, setAnnouncementError] = useState<string | null>(
    null
  );
  const [tasksError, setTasksError] = useState<string | null>(null);

  // Add state for the Tasks card title
  const [tasksCardTitle, setTasksCardTitle] = useState(
    t("tasks", { default: "Tasks" })
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/get-users");
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data.users);
      } catch {}
      setLoadingUsers(false);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/get-stats");
        if (!response.ok) throw new Error("Failed to fetch statistics");
        const data = await response.json();
        setStats(data);
      } catch {
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        const response = await fetch("/api/expenses");
        if (!response.ok) throw new Error("Failed to fetch finance data");
        const data = await response.json();
        // Only company finances
        const companyData = data.filter(
          (item: any) => item.companyId === user?.companyId
        );
        const expenses = companyData.filter(
          (item: any) => item.type === "expense"
        );
        const incomes = companyData.filter(
          (item: any) => item.type === "income"
        );
        setTotalExpenses(
          expenses.reduce(
            (total: number, expense: any) => total + expense.amount,
            0
          )
        );
        setTotalIncomes(
          incomes.reduce(
            (total: number, income: any) => total + income.amount,
            0
          )
        );
        setProfit(
          incomes.reduce(
            (total: number, income: any) => total + income.amount,
            0
          ) -
            expenses.reduce(
              (total: number, expense: any) => total + expense.amount,
              0
            )
        );
      } catch {}
    };
    if (user?.companyId) fetchFinanceData();
  }, [user]);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      setLoadingAnnouncement(true);
      setAnnouncementError(null);
      try {
        const res = await fetch("/api/announcements");
        if (!res.ok) throw new Error("Failed to fetch announcements");
        const data = await res.json();
        // Sort: pinned first, then by createdAt desc
        const sorted = [...data].sort(
          (a, b) =>
            (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setAnnouncementPreview(sorted[0] || null);
      } catch (e: any) {
        setAnnouncementError(e.message || "Error loading announcement");
      } finally {
        setLoadingAnnouncement(false);
      }
    };
    fetchAnnouncement();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      setTasksError(null);
      setLoadingTasks(true);
      try {
        const response = await fetch("/api/tasks");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to fetch tasks preview."
          );
        }
        const data: Task[] = await response.json();
        // Filter out completed tasks, sort by priority and deadline, then take first 2
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const filteredTasks = data
          .filter((task) => !task.completed)
          .sort((a, b) => {
            const aPriority = priorityOrder[a.priority] || 0;
            const bPriority = priorityOrder[b.priority] || 0;
            if (aPriority !== bPriority) return bPriority - aPriority; // higher number = higher priority
            return (
              new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
            );
          })
          .slice(0, 2);
        setTasks(filteredTasks);
      } catch (err) {
        console.error("Error fetching tasks preview:", err);
        setTasksError(
          (err as Error).message || "Failed to fetch tasks preview."
        );
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, []);

  // Memoize filtered users for Table
  const filteredTableUsers = useMemo(() => {
    return users
      .filter((u) => u.companyId === user?.companyId)
      .slice(0, 5)
      .map((user) => ({
        id: user._id,
        firstName: user.userId.firstName,
        lastName: user.userId.lastName,
        email: user.userId.email,
      }));
  }, [users, user]);

  // Memoize Table columns
  const tableColumns = useMemo(
    () => [
      { key: "firstName", header: t("firstName", { default: "First Name" }) },
      { key: "lastName", header: t("lastName", { default: "Last Name" }) },
      { key: "email", header: t("email", { default: "Email" }) },
    ],
    [t]
  );

  return {
    user,
    theme,
    t,
    users,
    loadingUsers,
    stats,
    loadingStats,
    totalExpenses,
    totalIncomes,
    profit,
    announcementPreview,
    loadingAnnouncement,
    announcementError,
    tasks,
    loadingTasks,
    setLoadingTasks,
    tasksError,
    setTasksError,
    setTasks,
    tasksCardTitle,
    setTasksCardTitle,
    filteredTableUsers,
    tableColumns,
  };
}
