import { useState, useEffect, useMemo, useCallback } from "react";
import { useTheme } from "../../components/ThemeContext";
import { useTranslations } from "next-intl";

export function useInsightsPage() {
  const [user, setUser] = useState<{ _id?: string; id?: string } | null>(null);
  const [expenses, setExpenses] = useState<
    {
      amount: number;
      category?: string;
      type?: string;
      date?: string;
      createdAt?: string;
    }[]
  >([]);
  const [incomes, setIncomes] = useState<
    {
      amount: number;
      category?: string;
      type?: string;
      date?: string;
      createdAt?: string;
    }[]
  >([]);
  const [timeSessions, setTimeSessions] = useState<
    { duration: number; createdAt?: string }[]
  >([]);
  const [aiTab, setAiTab] = useState<"analytics" | "suggestions">("analytics");
  const [aiAnalytics, setAiAnalytics] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState("");
  const [loading, setLoading] = useState(true);
  const [taskStats, setTaskStats] = useState({
    completed: 0,
    total: 0,
    last7Days: [0, 0, 0, 0, 0, 0, 0],
  });
  const [financeStats, setFinanceStats] = useState({
    expenses: [0, 0, 0, 0, 0, 0, 0],
    incomes: [0, 0, 0, 0, 0, 0, 0],
    labels: [
      "6d ago",
      "5d ago",
      "4d ago",
      "3d ago",
      "2d ago",
      "Yesterday",
      "Today",
    ],
  });
  const [pieData, setPieData] = useState({});
  const [incomePieData, setIncomePieData] = useState({});
  const t = useTranslations("InsightsPage");
  const { theme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userRes = await fetch("/api/user");
        if (!userRes.ok) throw new Error("Failed to fetch user");
        const userData = await userRes.json();
        setUser(userData.user);
        const userId = userData.user._id || userData.user.id;
        const expensesRes = await fetch(`/api/expenses`);
        const allData = await expensesRes.json();
        const expensesData = Array.isArray(allData)
          ? allData.filter((e) => e.type === "expense")
          : [];
        const incomesData = Array.isArray(allData)
          ? allData.filter((e) => e.type === "income")
          : [];
        setExpenses(expensesData);
        setIncomes(incomesData);
        const timeRes = await fetch(`/api/time-sessions?userId=${userId}`);
        const timeData = await timeRes.json();
        setTimeSessions(Array.isArray(timeData) ? timeData : []);
        const now = new Date();
        const last7dTasks: {
          completed?: boolean;
          updatedAt?: string;
          createdAt?: string;
        }[] = [];
        const tasksRes = await fetch(`/api/tasks`);
        const tasksData = await tasksRes.json();
        tasksData.forEach((t: any) => {
          const date = new Date(t.updatedAt || t.createdAt);
          const daysAgo =
            (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
          if (daysAgo >= 0 && daysAgo < 7) last7dTasks.push(t);
        });
        const completedTasks = last7dTasks.filter((t) => t.completed).length;
        const last7Days = Array(7).fill(0);
        last7dTasks.forEach((t) => {
          if (t.completed && t.updatedAt) {
            const daysAgo = Math.floor(
              (now.getTime() - new Date(t.updatedAt).getTime()) /
                (1000 * 60 * 60 * 24)
            );
            if (daysAgo >= 0 && daysAgo < 7) last7Days[6 - daysAgo]++;
          }
        });
        setTaskStats({
          completed: completedTasks,
          total: last7dTasks.length,
          last7Days,
        });
        const expensesByDay = [0, 0, 0, 0, 0, 0, 0];
        const incomesByDay = [0, 0, 0, 0, 0, 0, 0];
        expensesData.forEach((e) => {
          const daysAgo = Math.floor(
            (now.getTime() - new Date(e.date || e.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          );
          if (daysAgo >= 0 && daysAgo < 7)
            expensesByDay[6 - daysAgo] += e.amount;
        });
        incomesData.forEach((i) => {
          const daysAgo = Math.floor(
            (now.getTime() - new Date(i.date || i.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          );
          if (daysAgo >= 0 && daysAgo < 7)
            incomesByDay[6 - daysAgo] += i.amount;
        });
        setFinanceStats({
          expenses: expensesByDay,
          incomes: incomesByDay,
          labels: [
            "6d ago",
            "5d ago",
            "4d ago",
            "3d ago",
            "2d ago",
            "Yesterday",
            "Today",
          ],
        });
        const pie: { [cat: string]: number } = {};
        expensesData.forEach((e: { category?: string; amount: number }) => {
          pie[e.category || "Other"] =
            (pie[e.category || "Other"] || 0) + e.amount;
        });
        setPieData(pie);
        const incomePie: { [cat: string]: number } = {};
        incomesData.forEach((i: { category?: string; amount: number }) => {
          incomePie[i.category || "Other"] =
            (incomePie[i.category || "Other"] || 0) + i.amount;
        });
        setIncomePieData(incomePie);
        const statsSummary = `User statistics summary:\n- Total expenses: ${expensesData.length}, total spent: ${expensesData.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)}\n- Total incomes: ${incomesData.length}, total earned: ${incomesData.reduce((sum: number, i: { amount: number }) => sum + i.amount, 0)}\n- Expenses by category: ${Object.entries(
          pie
        )
          .map(([k, v]) => `${k}: ${v}`)
          .join(
            ", "
          )}\n- Time sessions: ${timeData.length}, total hours: ${(timeData.reduce((sum: number, t: { duration: number }) => sum + t.duration, 0) / 3600).toFixed(2)}\n- Tasks: total ${last7dTasks.length}, completed last 7d: ${completedTasks}, trend: ${last7Days.join(", ")}.`;
        const analyticsPrompt = `You are a world-class business and productivity analyst. Given the following user statistics, provide a highly structured, data-driven analysis using only bullet points. Each bullet should start with a bolded label (e.g., *Business Expenses: 40%*) followed by a concise insight. Use clear section headers in bold markdown (e.g., **Financial Analysis:**, **Time Analysis:**, **Task Analysis:**). Use percentages, comparisons, and highlight strengths and weaknesses. Do not give advice or suggestions—focus only on analysis and insights. No paragraphs, only bullet points. Limit your response to the 3 most important insights per section, and keep each bullet point under 15 words. Make the response as short as possible while remaining useful.\n\nUser statistics:\n- Total expenses: ${expensesData.length}, total spent: ${expensesData.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)}\n- Total incomes: ${incomesData.length}, total earned: ${incomesData.reduce((sum: number, i: { amount: number }) => sum + i.amount, 0)}\n- Expenses by category: ${Object.entries(
          pie
        )
          .map(([k, v]) => `${k}: ${v}`)
          .join(
            ", "
          )}\n- Time sessions: ${timeData.length}, total hours: ${(timeData.reduce((sum: number, t: { duration: number }) => sum + t.duration, 0) / 3600).toFixed(2)}\n- Tasks: total ${last7dTasks.length}, completed last 7d: ${completedTasks}, trend: ${last7Days.join(", ")}.`;
        const suggestionsPrompt = `You are a world-class productivity and finance coach. Given the following user statistics, provide highly structured, actionable suggestions using only bullet points. Each bullet should start with a bolded label (e.g., *Prioritize Tasks:*) followed by a concise, motivating suggestion. Use clear section headers in bold markdown (e.g., **Financial Suggestions:**, **Time Management Suggestions:**, **Task Suggestions:**). Reference the user's most frequent categories, time usage, and task completion trends. Use a friendly, motivating tone. No paragraphs, only bullet points. Limit your response to the 3 most important suggestions per section, and keep each bullet point under 15 words. Make the response as short as possible while remaining useful.\n\nUser statistics:\n- Total expenses: ${expensesData.length}, total spent: ${expensesData.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)}\n- Total incomes: ${incomesData.length}, total earned: ${incomesData.reduce((sum: number, i: { amount: number }) => sum + i.amount, 0)}\n- Expenses by category: ${Object.entries(
          pie
        )
          .map(([k, v]) => `${k}: ${v}`)
          .join(
            ", "
          )}\n- Time sessions: ${timeData.length}, total hours: ${(timeData.reduce((sum: number, t: { duration: number }) => sum + t.duration, 0) / 3600).toFixed(2)}\n- Tasks: total ${last7dTasks.length}, completed last 7d: ${completedTasks}, trend: ${last7Days.join(", ")}.`;
        setTimeout(() => {
          Promise.all([
            fetch("/api/gemini", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt: analyticsPrompt }),
            })
              .then((res) => res.json())
              .then((data) =>
                setAiAnalytics(data.response || "No analytics available.")
              )
              .catch(() => setAiAnalytics("Failed to load AI analytics.")),
            fetch("/api/gemini", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt: suggestionsPrompt }),
            })
              .then((res) => res.json())
              .then((data) =>
                setAiSuggestions(data.response || "No suggestions available.")
              )
              .catch(() => setAiSuggestions("Failed to load AI suggestions.")),
          ]);
        }, 0);
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const last7DaysHours = useMemo(() => {
    const arr = Array(7).fill(0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    timeSessions.forEach((session) => {
      const sessionDate = new Date(session.createdAt ?? 0);
      sessionDate.setHours(0, 0, 0, 0);
      const diff = Math.floor(
        (today.getTime() - sessionDate.getTime()) / (1000 * 3600 * 24)
      );
      if (diff >= 0 && diff < 7) arr[6 - diff] += session.duration / 3600;
    });
    return arr;
  }, [timeSessions]);

  const memoPieData = useMemo(() => {
    const pie: { [cat: string]: number } = {};
    expenses.forEach((e) => {
      pie[e.category || "Other"] = (pie[e.category || "Other"] || 0) + e.amount;
    });
    return pie;
  }, [expenses]);
  const memoIncomePieData = useMemo(() => {
    const pie: { [cat: string]: number } = {};
    incomes.forEach((i) => {
      pie[i.category || "Other"] = (pie[i.category || "Other"] || 0) + i.amount;
    });
    return pie;
  }, [incomes]);
  const memoFinanceStats = useMemo(() => {
    const expensesByDay = [0, 0, 0, 0, 0, 0, 0];
    const incomesByDay = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    expenses.forEach((e) => {
      const daysAgo = Math.floor(
        (now.getTime() - new Date(e.date ?? e.createdAt ?? 0).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (daysAgo >= 0 && daysAgo < 7) expensesByDay[6 - daysAgo] += e.amount;
    });
    incomes.forEach((i) => {
      const daysAgo = Math.floor(
        (now.getTime() - new Date(i.date ?? i.createdAt ?? 0).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (daysAgo >= 0 && daysAgo < 7) incomesByDay[6 - daysAgo] += i.amount;
    });
    return {
      expenses: expensesByDay,
      incomes: incomesByDay,
      labels: [
        "6d ago",
        "5d ago",
        "4d ago",
        "3d ago",
        "2d ago",
        "Yesterday",
        "Today",
      ],
    };
  }, [expenses, incomes]);
  const memoTaskStats = useMemo(() => taskStats.last7Days, [taskStats]);
  const handleAiTabSwitch = useCallback(
    (tab: "analytics" | "suggestions") => setAiTab(tab),
    []
  );

  return {
    theme,
    t,
    user,
    expenses,
    incomes,
    timeSessions,
    aiTab,
    setAiTab,
    aiAnalytics,
    aiSuggestions,
    loading,
    taskStats,
    financeStats,
    pieData,
    incomePieData,
    last7DaysHours,
    memoPieData,
    memoIncomePieData,
    memoFinanceStats,
    memoTaskStats,
    handleAiTabSwitch,
  };
}
