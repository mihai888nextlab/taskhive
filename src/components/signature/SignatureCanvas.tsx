import React, { useRef, useEffect, useState } from 'react';
import { useTheme } from "@/components/ThemeContext";
import { FaEraser, FaPencilAlt, FaUndo, FaPalette, FaExpandArrowsAlt } from 'react-icons/fa';
import { useTranslations } from "next-intl";

interface SignatureCanvasProps {
  onSignatureChange: (signature: string) => void;
  width?: number;
  height?: number;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({ 
  onSignatureChange, 
  width = 600, 
  height = 250 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth, setLineWidth] = useState(3);
  const [color, setColor] = useState('#000000');
  const [lastPath, setLastPath] = useState<ImageData | null>(null);
  const t = useTranslations("Signature");
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Remove the white background - let it be transparent
    // ctx.fillStyle = '#ffffff';
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Just clear the canvas to make it transparent
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set drawing properties
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
  }, [color, lineWidth]);

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setLastPath(ctx.getImageData(0, 0, canvas.width, canvas.height));
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation(); // Stop event bubbling
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    saveCanvasState();
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation(); // Stop event bubbling
    
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement>) => {
    if (e) {
      e.preventDefault(); // Prevent default behavior
      e.stopPropagation(); // Stop event bubbling
    }
    
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL('image/png');
    onSignatureChange(dataURL.split(',')[1]);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear to transparent instead of white
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSignatureChange('');
  };

  const undoLastStroke = () => {
    if (!lastPath) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.putImageData(lastPath, 0, 0);
    
    const dataURL = canvas.toDataURL('image/png');
    onSignatureChange(dataURL.split(',')[1]);
  };

  const predefinedColors = [
    '#000000', '#1e40af', '#dc2626', '#059669', 
    '#7c2d12', '#581c87', '#be185d', '#374151'
  ];

  return (
    <div className="space-y-6">
      {/* Compact Canvas Controls */}
      <div className={`flex items-center justify-between p-3 rounded-lg border ${theme === "dark" ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
        {/* Pen Size */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FaPencilAlt className="text-blue-600 text-sm" />
            <span
              className={`font-medium text-sm ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
              style={{ color: theme === "dark" ? "#e0e7ff" : undefined }}
            >
              {t("size")}: {lineWidth}px
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="8"
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            className="w-24 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((lineWidth - 1) / 7) * 100}%, #e5e7eb ${((lineWidth - 1) / 7) * 100}%, #e5e7eb 100%)`
            }}
          />
        </div>

        {/* Color Picker */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FaPalette className="text-purple-600 text-sm" />
            <span
              className={`font-medium text-sm ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
              style={{ color: theme === "dark" ? "#e0e7ff" : undefined }}
            >
              {t("color")}
            </span>
          </div>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 rounded-md cursor-pointer bg-white dark:bg-gray-900"
            title={t("pickPenColor")}
          />
        </div>
      </div>

      {/* Canvas */}
      <div className="relative">
        <div className={`rounded-xl border-2 p-4 ${theme === "dark" ? "bg-gray-900 border-gray-700" : "bg-white border-gray-300"}`}>
          <div 
            className={`relative rounded-lg border ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
            style={{
              backgroundImage: `
                linear-gradient(45deg, ${theme === "dark" ? "#1e293b" : "#f9fafb"} 25%, transparent 25%),
                linear-gradient(-45deg, ${theme === "dark" ? "#1e293b" : "#f9fafb"} 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, ${theme === "dark" ? "#1e293b" : "#f9fafb"} 75%),
                linear-gradient(-45deg, transparent 75%, ${theme === "dark" ? "#1e293b" : "#f9fafb"} 75%)
              `,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
              backgroundColor: theme === "dark" ? "#0f172a" : "#fff"
            }}
          >
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              className="cursor-crosshair w-full rounded-lg"
              // Mouse events
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              // Touch events for mobile
              onTouchStart={(e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const mouseEvent = new MouseEvent('mousedown', {
                  clientX: touch.clientX,
                  clientY: touch.clientY
                });
                startDrawing(mouseEvent as any);
              }}
              onTouchMove={(e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const mouseEvent = new MouseEvent('mousemove', {
                  clientX: touch.clientX,
                  clientY: touch.clientY
                });
                draw(mouseEvent as any);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                stopDrawing();
              }}
              // Prevent dragging and selection
              onDragStart={(e) => e.preventDefault()}
              onDrag={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
              style={{ 
                maxWidth: '100%', 
                height: 'auto', 
                display: 'block',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                touchAction: 'none'
              }}
            />
          </div>
          
          {/* Canvas Instructions */}
          <div
            className={`absolute top-4 left-4 text-xs px-3 py-1 rounded-md pointer-events-none ${theme === "dark" ? "bg-blue-900 text-blue-200" : "bg-blue-600 text-white"}`}
            style={{
              color: theme === "dark" ? "#e0e7ff" : "#fff",
              backgroundColor: theme === "dark" ? "#1e293b" : "#2563eb"
            }}
          >
            {t("drawSignatureHere")}
          </div>
        </div>
      </div>

      {/* Compact Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={clearCanvas}
          className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 border text-sm ${theme === "dark" ? "bg-red-900 text-red-200 hover:bg-red-800 border-red-700" : "bg-red-100 text-red-700 hover:bg-red-200 border-red-200"}`}
        >
          <div className="flex items-center justify-center gap-2">
            <FaEraser className="text-xs" />
            {t("clear")}
          </div>
        </button>
        <button
          onClick={undoLastStroke}
          className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 border text-sm ${theme === "dark" ? "bg-gray-800 text-gray-200 hover:bg-gray-700 border-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"}`}
        >
          <div className="flex items-center justify-center gap-2">
            <FaUndo className="text-xs" />
            {t("undo")}
          </div>
        </button>
      </div>

      {/* Compact Signature Tips */}
      <div className={`rounded-lg p-3 border flex items-center gap-2 ${theme === "dark" ? "bg-blue-950 border-blue-900" : "bg-blue-50 border-blue-200"}`}>
        <span className={`text-sm ${theme === "dark" ? "text-blue-300" : "text-blue-600"}`}>💡</span>
        <span className={`text-sm font-medium ${theme === "dark" ? "text-blue-200" : "text-blue-800"}`}>{t("signNaturallyTip")}</span>
      </div>
    </div>
  );
};

export default SignatureCanvas;