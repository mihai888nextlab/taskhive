import { Pie } from 'react-chartjs-2';
import { useTranslations } from "next-intl";

interface Props {
  data: any;
  options: any;
  theme: string;
}

export default function CategoryPieChart({ data, options, theme }: Props) {
  const t = useTranslations("FinancePage");
  return (
    <div className={`rounded-2xl shadow-xl p-6 sm:p-8 mb-8 hover:scale-[1.005] hover:shadow-2xl transition-all duration-100 mt-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      <h2 className={`text-2xl font-bold mb-4 border-b-2 pb-2 ${theme === 'dark' ? 'text-white border-blue-200' : 'text-gray-900 border-blue-200'}`}>
        {t("categoryBreakdown")}
      </h2>
      <div className="flex justify-center items-center" style={{ maxWidth: 540, maxHeight: 540, margin: "0 auto" }}>
        <Pie data={data} options={options} width={500} height={500} />
      </div>
    </div>
  );
}