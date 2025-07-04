import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { FaSpinner, FaMagic, FaCalendarAlt, FaTags } from "react-icons/fa";
import { useTheme } from '@/components/ThemeContext';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import "react-datepicker/dist/react-datepicker.css";

interface ExpenseFormProps {
  title: string;
  amount: string;
  description: string;
  date: Date;
  category: string;
  loading: boolean;
  onTitleChange: (v: string) => void;
  onAmountChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onDateChange: (v: Date | null) => void;
  onCategoryChange: (v: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

const categories = [
  'General', 'Food', 'Transport', 'Utilities', 'Shopping', 'Health', 'Entertainment', 'Business', 'Other'
];

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  title,
  amount,
  description,
  date,
  category,
  loading,
  onTitleChange,
  onAmountChange,
  onDescriptionChange,
  onDateChange,
  onCategoryChange,
  onSubmit,
}) => {
  const { theme } = useTheme();
  const [generatingDescription, setGeneratingDescription] = useState(false);

  const handleGenerateDescription = async () => {
    if (!title) return;
    setGeneratingDescription(true);
    try {
      const prompt = `
You are a finance assistant. Write a clear, concise, and professional description for an expense with the following title: "${title}".

- The description should be 1-2 sentences.
- Do not provide multiple options, explanations, or recommendations.
- Do not include headings, labels, or formatting—just the plain description.
- Focus on what the expense is for and any relevant context.
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
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Title Input */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Expense Title
        </label>
        <Input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="What did you spend on?"
          className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
            theme === "dark"
              ? "bg-gray-700 text-white border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              : "bg-white text-gray-900 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
          }`}
          required
          disabled={loading}
        />
      </div>

      {/* Amount Input */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Amount
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            $
          </div>
          <Input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.00"
            className={`w-full pl-8 pr-4 py-3 rounded-xl border transition-all duration-200 ${
              theme === "dark"
                ? "bg-gray-700 text-white border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : "bg-white text-gray-900 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            }`}
            step="0.01"
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* Description with AI Generate */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Description
        </label>
        <div className="flex gap-2">
          <Textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Describe this expense..."
            className={`flex-1 px-4 py-3 rounded-xl border transition-all duration-200 resize-none ${
              theme === "dark"
                ? "bg-gray-700 text-white border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : "bg-white text-gray-900 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            }`}
            required
            disabled={loading || generatingDescription}
            rows={3}
          />
          <Button
            type="button"
            onClick={handleGenerateDescription}
            disabled={!title || generatingDescription || loading}
            className={`px-3 py-2 rounded-xl font-medium transition-all duration-200 self-start ${
              !title || generatingDescription || loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : theme === 'dark'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            title="Generate description with AI"
          >
            {generatingDescription ? (
              <FaSpinner className="animate-spin w-4 h-4" />
            ) : (
              <FaMagic className="w-4 h-4" />
            )}
          </Button>
        </div>
        {generatingDescription && (
          <div className={`flex items-center gap-2 mt-2 text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
            <FaSpinner className="animate-spin w-3 h-3" />
            <span>Generating description...</span>
          </div>
        )}
      </div>

      {/* Date and Category Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <FaCalendarAlt className="inline w-3 h-3 mr-1" />
            Date
          </label>
          <DatePicker
            selected={date}
            onChange={(d) => onDateChange(d)}
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
              theme === "dark"
                ? "bg-gray-700 text-white border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : "bg-white text-gray-900 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            }`}
            dateFormat="yyyy-MM-dd"
            required
            disabled={loading}
          />
        </div>

        {/* Category */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <FaTags className="inline w-3 h-3 mr-1" />
            Category
          </label>
          <Select
            value={category}
            onValueChange={onCategoryChange}
            disabled={loading}
          >
            <SelectTrigger
              className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                theme === "dark"
                  ? "bg-gray-700 text-white border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "bg-white text-gray-900 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              }`}
            >
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent
              className={`rounded-xl border mt-1 ${
                theme === "dark"
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-gray-900 border-gray-200"
              }`}
            >
              {categories.map(cat => (
                <SelectItem
                  key={cat}
                  value={cat}
                  className={`cursor-pointer transition-colors ${
                    theme === "dark"
                      ? "data-[state=highlighted]:bg-gray-600 data-[state=highlighted]:text-white"
                      : "data-[state=highlighted]:bg-gray-100 data-[state=highlighted]:text-gray-900"
                  }`}
                >
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl font-bold transition-all duration-200 ${
            loading
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : theme === "dark"
                ? "bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl"
                : "bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <FaSpinner className="animate-spin w-4 h-4" />
              <span>Saving...</span>
            </div>
          ) : (
            "Add Expense"
          )}
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;