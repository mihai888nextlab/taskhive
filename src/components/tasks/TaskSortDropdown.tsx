import React from "react";

interface TaskSortDropdownProps {
  sortBy: string;
  setSortBy: (v: string) => void;
  loading: boolean;
  theme: string;
}

const TaskSortDropdown: React.FC<TaskSortDropdownProps> = ({ sortBy, setSortBy, loading, theme }) => (
  <div className="mb-6 flex items-center justify-end">
    <label htmlFor="sort-tasks" className={`block text-${theme === 'light' ? 'gray-700' : 'gray-300'} text-sm font-semibold mr-2`}>Sort By:</label>
    <select
      id="sort-tasks"
      className={`w-full sm:w-auto py-2 px-3 bg-${theme === 'light' ? 'white' : 'gray-700'} border border-gray-300 rounded-lg text-${theme === 'light' ? 'gray-800' : 'white'} shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-base cursor-pointer`}
      value={sortBy}
      onChange={e => setSortBy(e.target.value)}
      disabled={loading}
    >
      <option value="createdAtDesc">Created Date (Newest First)</option>
      <option value="deadlineAsc">Deadline (Earliest First)</option>
    </select>
  </div>
);

export default TaskSortDropdown;