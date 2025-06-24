import { useState, useEffect } from "react";

// Definește interfața pentru un element de rezultat generic
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
    | "session"; // Tipul rezultatului
  title?: string; // Pentru task, page, project
  name?: string; // Pentru user, expense, income (poate fi folosit ca titlu principal)
  fullName?: string; // Pentru user
  email?: string; // Pentru user
  description?: string; // Pentru task, expense, income, document
  amount?: number; // Pentru expense, income
  category?: string; // Pentru expense
  source?: string; // Pentru income
  // TODO: Adaugă aici orice alte proprietăți relevante pentru afișare în lista de rezultate
}

// Definește structura generală a obiectului de rezultate
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
  // Inițializează `results` cu toate categoriile goale
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

  // Efect pentru a actualiza `debouncedSearchTerm` după un delay
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, delay);

    // Funcția de curățare: anulează timeout-ul dacă `searchTerm` se schimbă înainte de expirarea delay-ului
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay]); // Dependențe: se re-rulează dacă `searchTerm` sau `delay` se schimbă

  // Efect pentru a face cererea API atunci când `debouncedSearchTerm` se schimbă
  useEffect(() => {
    if (debouncedSearchTerm) {
      // Efectuează căutarea doar dacă termenul nu este gol
      setLoading(true);
      setError(null);

      const fetchResults = async () => {
        try {
          // encodeURIComponent este important pentru a gestiona caractere speciale în URL
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
          setResults(data.results); // Setează rezultatele primite de la backend
        } catch (err: any) {
          console.error("Search API error:", err);
          setError(err.message || "An error occurred during search.");
          // Curăță rezultatele în caz de eroare
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
          setLoading(false); // Indiferent de rezultat, oprește starea de loading
        }
      };

      fetchResults();
    } else {
      // Dacă termenul de căutare este gol, curăță rezultatele și oprește loading
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
  }, [debouncedSearchTerm]); // Dependență: se re-rulează când termenul debounced se schimbă

  return { results, loading, error };
};
