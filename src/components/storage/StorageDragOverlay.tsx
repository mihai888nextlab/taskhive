import React from "react";

const StorageDragOverlay: React.FC = () => (
  <div className="absolute inset-0 bg-blue-100 bg-opacity-60 flex items-center justify-center z-50 pointer-events-none text-2xl font-bold text-blue-700">
    Drop files to upload
  </div>
);

export default StorageDragOverlay;