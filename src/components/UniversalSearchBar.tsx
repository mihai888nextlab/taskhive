import React, { useState } from "react";
import { useDebouncedSearch } from "@/hooks/useDebounceSearch"; // Importă hook-ul custom
import { useRouter } from "next/router"; // Pentru navigare
import Link from "next/link"; // Pentru link-uri către rezultate

// Asigură-te că `SearchResultItem` este exportat din hooks/useDebouncedSearch
interface SearchResultItem {
  _id: string;
  type: string;
  title?: string;
  name?: string;
  fullName?: string;
  email?: string;
  description?: string;
  amount?: number;
  // ... adaugă aici toate proprietățile posibile ale unui rezultat
}

const UniversalSearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  // Utilizează hook-ul de căutare cu debounce
  const { results, loading, error } = useDebouncedSearch(searchTerm, 300); // 300ms delay
  const router = useRouter();

  // Verifică dacă există rezultate în oricare categorie
  const hasResults = Object.keys(results).some(
    (key) => (results as any)[key].length > 0
  );

  // Funcție pentru a genera URL-ul corect bazat pe tipul de entitate
  const getResultUrl = (item: SearchResultItem): string => {
    switch (item.type) {
      case "task":
        return `/dashboard/tasks/${item._id}`;
      case "user":
        return `/dashboard/users/${item._id}`;
      case "expense":
        return `/dashboard/finance/expenses/${item._id}`;
      case "income":
        return `/dashboard/finance/incomes/${item._id}`;
      // TODO: Adaugă aici rutele pentru celelalte tipuri de date
      // case 'page':
      //   return `/dashboard/pages/${item._id}`;
      // case 'project':
      //   return `/dashboard/projects/${item._id}`;
      default:
        return "#"; // Fallback dacă tipul nu este recunoscut
    }
  };

  // Funcție pentru a obține titlul afișabil al unui element
  const getItemTitle = (item: SearchResultItem): string => {
    return (
      item.title ||
      item.fullName ||
      item.name ||
      item.email ||
      (item.description ? item.description.substring(0, 50) + "..." : "N/A")
    );
  };

  // Funcție pentru a obține o pictogramă relevantă
  const getItemIcon = (type: string): string => {
    switch (type) {
      case "task":
        return "📝";
      case "user":
        return "👤";
      case "expense":
        return "💸";
      case "income":
        return "💰";
      // TODO: Adaugă pictograme pentru alte tipuri
      // case 'page': return '📄';
      // case 'project': return '🏗️';
      default:
        return "🔍";
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <input
        type="text"
        placeholder="Search tasks, users, expenses, pages..."
        className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Iconiță de căutare */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </div>

      {/* Indicator de Loading */}
      {loading && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg
            className="animate-spin h-5 w-5 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}

      {/* Container pentru rezultate */}
      {searchTerm && !loading && !error && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-2 max-h-96 overflow-y-auto transform transition-all duration-200 ease-out">
          {hasResults ? (
            Object.entries(results).map(
              ([category, items]) =>
                (items as SearchResultItem[]).length > 0 && (
                  <div key={category} className="mb-2 last:mb-0">
                    <h3 className="text-xs font-semibold uppercase text-gray-500 px-4 pt-3 pb-1 border-b border-gray-100 sticky top-0 bg-white z-10">
                      {category.replace(/s$/, "") + "s"}{" "}
                      {/* Ex: 'tasks' -> 'Tasks', 'users' -> 'Users' */}
                    </h3>
                    <ul>
                      {(items as SearchResultItem[]).map((item) => (
                        <li
                          key={item._id}
                          className="p-3 hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                        >
                          <Link
                            href={getResultUrl(item)}
                            onClick={() => setSearchTerm("")}
                            className="flex items-center space-x-3"
                          >
                            <span className="text-lg">
                              {getItemIcon(item.type)}
                            </span>
                            <div>
                              <p className="font-medium text-gray-800">
                                {getItemTitle(item)}
                              </p>
                              {/* Afișează o descriere secundară dacă există */}
                              {item.description &&
                                item.description.length > 50 && (
                                  <p className="text-sm text-gray-500 line-clamp-1">
                                    {item.description}
                                  </p>
                                )}
                              {item.email && item.type === "user" && (
                                <p className="text-sm text-gray-500">
                                  {item.email}
                                </p>
                              )}
                              {item.amount &&
                                (item.type === "expense" ||
                                  item.type === "income") && (
                                  <p className="text-sm text-gray-500">
                                    Amount: ${item.amount}
                                  </p>
                                )}
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
            )
          ) : (
            <p className="p-4 text-center text-gray-500">No results found.</p>
          )}
        </div>
      )}

      {/* Mesaj de eroare */}
      {error && searchTerm && !loading && (
        <div className="absolute z-50 w-full bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mt-2 shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default UniversalSearchBar;
