import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { FaSpinner, FaMagic } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";

interface IncomeFormProps {
  title: string;
  amount: string;
  description: string;
  date: Date;
  category: string;
  loading: boolean;
  theme: string;
  onTitleChange: (v: string) => void;
  onAmountChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onDateChange: (v: Date) => void;
  onCategoryChange: (v: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

const categories = [
  'General', 'Food', 'Transport', 'Utilities', 'Shopping', 'Health', 'Salary', 'Investment', 'Other'
];

const IncomeForm: React.FC<IncomeFormProps> = ({
  title,
  amount,
  description,
  date,
  category,
  loading,
  theme,
  onTitleChange,
  onAmountChange,
  onDescriptionChange,
  onDateChange,
  onCategoryChange,
  onSubmit,
}) => {
  const [generatingDescription, setGeneratingDescription] = useState(false);

  const handleGenerateDescription = async () => {
    if (!title) return;
    setGeneratingDescription(true);
    try {
      const prompt = `
You are a finance assistant. Write a clear, concise, and professional description for an income with the following title: "${title}".

- The description should be 1-2 sentences.
- Do not provide multiple options, explanations, or recommendations.
- Do not include headings, labels, or formatting—just the plain description.
- Focus on what the income is for and any relevant context.
- Do not mention that you are an AI or assistant.
- Output only the description, nothing else.
`;
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.response) {
        onDescriptionChange(data.response);
      }
    } finally {
      setGeneratingDescription(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className={`space-y-4 rounded-xl shadow-md p-6 transition-all duration-200 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700"
          : "bg-gradient-to-br from-white to-green-50 border border-green-100"
      }`}
    >
      <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Add Income
      </h3>
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Income Title"
        className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 text-lg font-semibold shadow-sm transition-all duration-200 ${
          theme === "dark"
            ? "bg-gray-700 text-white border-gray-600 focus:ring-green-400"
            : "bg-white text-gray-900 border-green-200 focus:ring-green-400"
        }`}
        required
      />
      <input
        type="number"
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
        placeholder="Amount (e.g., 500.00)"
        className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 text-lg font-semibold shadow-sm transition-all duration-200 ${
          theme === "dark"
            ? "bg-gray-700 text-white border-gray-600 focus:ring-green-400"
            : "bg-white text-gray-900 border-green-200 focus:ring-green-400"
        }`}
        step="0.01"
        required
      />
      <div className="flex items-center mb-2">
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Description of the income"
          className={`flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 text-base shadow-sm transition-all duration-200 resize-y ${
            theme === "dark"
              ? "bg-gray-700 text-white border-gray-600 focus:ring-green-400"
              : "bg-white text-gray-900 border-green-200 focus:ring-green-400"
          }`}
          required
          rows={3}
          disabled={loading || generatingDescription}
        />
        <button
          type="button"
          className="ml-2 px-3 py-2 bg-primary text-white rounded-lg flex items-center font-semibold shadow hover:bg-primary-dark transition disabled:opacity-60"
          onClick={handleGenerateDescription}
          disabled={!title || generatingDescription}
          title="Generate description from title"
        >
          {generatingDescription ? <FaSpinner className="animate-spin" /> : <FaMagic className="mr-1" />}
          Generate
        </button>
      </div>
      {generatingDescription && (
        <div className="flex items-center text-sm text-gray-500 mt-2">
          <FaSpinner className="animate-spin mr-2" /> Generating description...
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 text-gray-500 dark:text-gray-300">Date</label>
          <DatePicker
            selected={date}
            onChange={(d) => { if (d) onDateChange(d); }}
            className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 shadow-sm transition-all duration-200 ${
              theme === "dark"
                ? "bg-gray-700 text-white border-gray-600 focus:ring-green-400"
                : "bg-white text-gray-900 border-green-200 focus:ring-green-400"
            }`}
            dateFormat="yyyy-MM-dd"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 text-gray-500 dark:text-gray-300">Category</label>
          <select
            value={category}
            onChange={e => onCategoryChange(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 shadow-sm transition-all duration-200 ${
              theme === "dark"
                ? "bg-gray-700 text-white border-gray-600 focus:ring-green-400"
                : "bg-white text-gray-900 border-green-200 focus:ring-green-400"
            }`}
            required
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>
      <button
        type="submit"
        className={`w-full py-3 rounded-xl font-bold shadow-md transition-all duration-300 text-lg ${
          theme === "dark"
            ? "bg-green-600 text-white hover:bg-green-700"
            : "bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-600 hover:to-green-800"
        }`}
        disabled={loading}
      >
        {loading ? "Saving..." : "Add Income"}
      </button>
    </form>
  );
};

export default IncomeForm;