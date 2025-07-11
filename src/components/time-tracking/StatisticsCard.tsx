import React from "react";
import { useTranslations } from "next-intl";

interface Props {
  title: string;
  theme: string;
  children: React.ReactNode;
}

const StatisticsCard: React.FC<Props> = ({ title, theme, children }) => {
  const t = useTranslations("TimeTrackingPage");
  return (
    <div className={`rounded-2xl shadow-xl p-6 sm:p-8 mb-8 hover:scale-[1.005] hover:shadow-2xl transition-all duration-200 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4 border-b-2 border-blue-200 pb-2`}>
        {t(title)}
      </h2>
      {children}
    </div>
  );
};

export default StatisticsCard;