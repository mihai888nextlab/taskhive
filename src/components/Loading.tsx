export default function Loading() {
  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center z-50 bg-white opacity-60">
      <div className="relative inline-flex">
        <div className="w-10 h-10 bg-blue-500 rounded-full"></div>
        <div className="w-10 h-10 bg-blue-500 rounded-full absolute top-0 left-0 animate-ping"></div>
        <div className="w-10 h-10 bg-blue-500 rounded-full absolute top-0 left-0 animate-pulse"></div>
      </div>
    </div>
  );
}
