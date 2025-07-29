import { useState, useEffect } from "react";


interface SearchResultItem {
  _id: string;
  type:
    | "task"
    | "user"
    | "expense"
    | "income"
    | "page"
    | "announcement"
    | "event"
    | "file"
    | "tracking"
    | "finance"
    | "session";
  title?: string;
  name?: string;
  fullName?: string;
  email?: string;
  description?: string;
  amount?: number;
  category?: string;
  source?: string;
}


interface SearchResults {
  tasks: SearchResultItem[];
  users: SearchResultItem[];
  announcements: SearchResultItem[];
  calendarEvents: SearchResultItem[];
  storageFiles: SearchResultItem[];
  timeTracking: SearchResultItem[];
  financeRecords: SearchResultItem[];
  timeSessions: SearchResultItem[];
  expenses: SearchResultItem[];
  incomes: SearchResultItem[];
}

export const useDebouncedSearch = (searchTerm: string, delay: number = 300) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  
  const [results, setResults] = useState<SearchResults>({
    tasks: [],
    users: [],
    announcements: [],
    calendarEvents: [],
    storageFiles: [],
    timeTracking: [],
    financeRecords: [],
    timeSessions: [],
    expenses: [],
    incomes: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, delay);

    
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay]);

  
  useEffect(() => {
    if (debouncedSearchTerm) {
      
      setLoading(true);
      setError(null);

      const fetchResults = async () => {
        try {
          
          const response = await fetch(
            `/api/universal-search?q=${encodeURIComponent(debouncedSearchTerm)}`
          );

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(
              errData.message || "Failed to fetch search results."
            );
          }

          const data = await response.json();
          setResults(data.results);
        } catch (err: any) {
          console.error("Search API error:", err);
          setError(err.message || "An error occurred during search.");
          
          setResults({
            tasks: [],
            users: [],
            announcements: [],
            calendarEvents: [],
            storageFiles: [],
            timeTracking: [],
            financeRecords: [],
            timeSessions: [],
            expenses: [],
            incomes: [],
          });
        } finally {
          setLoading(false);
        }
      };

      fetchResults();
    } else {
      
      setResults({
        tasks: [],
        users: [],
        announcements: [],
        calendarEvents: [],
        storageFiles: [],
        timeTracking: [],
        financeRecords: [],
        timeSessions: [],
        expenses: [],
        incomes: [],
      });
      setLoading(false);
    }
  }, [debouncedSearchTerm]);

  return { results, loading, error };
};
