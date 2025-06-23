interface Props {
  statsRange: 'week' | 'month';
  setStatsRange: (range: 'week' | 'month') => void;
}

export default function StatsRangeButtons({ statsRange, setStatsRange }: Props) {
  return (
    <div className="flex justify-end mb-6">
      <button
        className={`px-4 py-1 rounded-l-full ${statsRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        onClick={() => setStatsRange('week')}
      >Weekly</button>
      <button
        className={`px-4 py-1 rounded-r-full ${statsRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        onClick={() => setStatsRange('month')}
      >Monthly</button>
    </div>
  );
}