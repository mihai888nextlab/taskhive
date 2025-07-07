import { Button } from "@/components/ui/button";

interface Props {
  statsRange: 'week' | 'month';
  setStatsRange: (range: 'week' | 'month') => void;
}

export default function StatsRangeButtons({ statsRange, setStatsRange }: Props) {
  return (
    <div className="flex justify-end mb-6">
      <Button
        className={`px-4 py-1 rounded-l-full ${statsRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        onClick={() => setStatsRange('week')}
        variant={statsRange === 'week' ? "default" : "outline"}
      >Weekly</Button>
      <Button
        className={`px-4 py-1 rounded-r-full ${statsRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        onClick={() => setStatsRange('month')}
        variant={statsRange === 'month' ? "default" : "outline"}
      >Monthly</Button>
    </div>
  );
}