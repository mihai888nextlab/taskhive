import React, { useState, useCallback } from "react";
import DatePicker from "react-datepicker";
import { FaSpinner, FaMagic, FaCalendarAlt, FaTags } from "react-icons/fa";
import { useTheme } from '@/components/ThemeContext';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import "react-datepicker/dist/react-datepicker.css";
import { useTranslations } from "next-intl";

interface IncomeFormProps {
  title: string;
  amount: string;
  description: string;
  date: Date;
  category: string;
  loading: boolean;
  onTitleChange: (v: string) => void;
  onAmountChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onDateChange: (v: Date) => void;
  onCategoryChange: (v: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

const categories = [
  'Salary', 'Freelance', 'Investment', 'Business', 'Bonus', 'Gift', 'Refund', 'Other'
];

const IncomeForm: React.FC<IncomeFormProps> = ({
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
  const t = useTranslations("FinancePage");
  const [generatingDescription, setGeneratingDescription] = useState(false);

  // Set default category if not set
  React.useEffect(() => {
    if (!category && categories.length > 0) {
      onCategoryChange(categories[0]);
    }
    // Only run on mount or if category changes to empty
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

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

  // Memoize input handlers
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onTitleChange(e.target.value);
  }, [onTitleChange]);
  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onAmountChange(e.target.value);
  }, [onAmountChange]);
  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onDescriptionChange(e.target.value);
  }, [onDescriptionChange]);
  const handleDateChange = useCallback((d: Date | null) => {
    if (d) {
      onDateChange(d);
    }
  }, [onDateChange]);
  const handleCategoryChange = useCallback((v: string) => {
    onCategoryChange(v);
  }, [onCategoryChange]);
  const handleFormSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    onSubmit(e);
  }, [onSubmit]);

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      {/* Title Input */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {t("incomeTitle")}
        </label>
        <Input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder={t("incomeTitle")}
          className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
            theme === "dark"
              ? "bg-gray-700 text-white border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              : "bg-white text-gray-900 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
          }`}
          required
          disabled={loading}
        />
      </div>

      {/* Amount Input */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {t("amount")}
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            $
          </div>
          <Input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.00"
            className={`w-full pl-8 pr-4 py-3 rounded-xl border transition-all duration-200 ${
              theme === "dark"
                ? "bg-gray-700 text-white border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                : "bg-white text-gray-900 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
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
          {t("description")}
        </label>
        <div className="flex gap-2">
          <Textarea
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Describe this income..."
            className={`flex-1 px-4 py-3 rounded-xl border transition-all duration-200 resize-none ${
              theme === "dark"
                ? "bg-gray-700 text-white border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                : "bg-white text-gray-900 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
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
            title={t("generateDescription")}
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
            <span>{t("generatingDescription")}</span>
          </div>
        )}
      </div>

      {/* Date and Category Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <FaCalendarAlt className="inline w-3 h-3 mr-1" />
            {t("date")}
          </label>
          <DatePicker
            selected={date}
            onChange={handleDateChange}
            className={`w-full px-4 py-2 h-[36px] rounded-xl border transition-all duration-200 ${
              theme === "dark"
                ? "bg-gray-700 text-white border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                : "bg-white text-gray-900 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
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
            {t("category")}
          </label>
          <Select
            value={category || categories[0]}
            onValueChange={handleCategoryChange}
            disabled={loading}
          >
            <SelectTrigger
              className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                theme === "dark"
                  ? "bg-gray-700 text-white border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  : "bg-white text-gray-900 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              }`}
              style={{ height: "36px" }}
            >
              <SelectValue placeholder={t("selectCategory")} />
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
                  className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors"
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
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <FaSpinner className="animate-spin w-4 h-4" />
              <span>{t("saving")}</span>
            </div>
          ) : (
            t("addIncome")
          )}
        </Button>
      </div>
    </form>
  );
};

export default React.memo(IncomeForm);