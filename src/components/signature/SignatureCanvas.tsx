import React, { useRef, useEffect, useState } from 'react';
import { FaEraser, FaPencilAlt, FaUndo, FaPalette, FaExpandArrowsAlt } from 'react-icons/fa';

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
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

  const stopDrawing = () => {
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

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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
      {/* Canvas Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
        {/* Pen Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <FaPencilAlt className="text-blue-300" />
            </div>
            <h4 className="text-white font-bold">Pen Settings</h4>
          </div>
          
          <div>
            <label className="block text-white/90 text-sm font-semibold mb-2">
              Pen Size: {lineWidth}px
            </label>
            <input
              type="range"
              min="1"
              max="12"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="w-full h-3 bg-white/20 rounded-full appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-white/70 mt-1">
              <span>Fine</span>
              <span>Bold</span>
            </div>
          </div>
        </div>

        {/* Color Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-xl">
              <FaPalette className="text-purple-300" />
            </div>
            <h4 className="text-white font-bold">Pen Color</h4>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {predefinedColors.map((presetColor) => (
              <button
                key={presetColor}
                onClick={() => setColor(presetColor)}
                className={`w-12 h-12 rounded-xl border-2 transition-all duration-200 ${
                  color === presetColor 
                    ? 'border-white scale-110 shadow-lg' 
                    : 'border-white/30 hover:border-white/60 hover:scale-105'
                }`}
                style={{ backgroundColor: presetColor }}
              />
            ))}
          </div>
          
          <div className="relative">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-12 rounded-xl cursor-pointer opacity-0 absolute inset-0"
            />
            <div 
              className="w-full h-12 rounded-xl border-2 border-white/30 flex items-center justify-center text-white/70 hover:border-white/60 transition-colors cursor-pointer"
              style={{ backgroundColor: color }}
            >
              <span className="text-sm font-medium" style={{ color: color === '#000000' ? 'white' : 'black' }}>
                Custom Color
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative">
        <div className="bg-white rounded-2xl p-4 shadow-2xl border border-gray-200">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="border-2 border-dashed border-gray-300 rounded-xl cursor-crosshair bg-white shadow-inner w-full"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
          
          {/* Canvas Instructions */}
          <div className="absolute top-8 left-8 bg-black/70 text-white text-sm px-4 py-2 rounded-xl backdrop-blur-sm pointer-events-none">
            Draw your signature here
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={undoLastStroke}
          disabled={!lastPath}
          className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold transition-all duration-300 ${
            lastPath 
              ? 'bg-yellow-500/20 text-yellow-100 border border-yellow-500/30 hover:bg-yellow-500/30 backdrop-blur-sm' 
              : 'bg-white/10 text-white/50 border border-white/20 cursor-not-allowed'
          }`}
        >
          <FaUndo />
          Undo Last Stroke
        </button>
        
        <button
          onClick={clearCanvas}
          className="flex-1 flex items-center justify-center gap-3 py-4 px-6 bg-red-500/20 text-red-100 border border-red-500/30 rounded-2xl hover:bg-red-500/30 font-bold transition-all duration-300 backdrop-blur-sm"
        >
          <FaEraser />
          Clear All
        </button>
      </div>

      {/* Tips */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 backdrop-blur-sm">
        <h5 className="text-blue-200 font-bold mb-2">💡 Signature Tips:</h5>
        <ul className="text-blue-100 text-sm space-y-1">
          <li>• Use a consistent, natural writing style</li>
          <li>• Write at a comfortable speed for best results</li>
          <li>• Try different pen sizes to find your preference</li>
          <li>• Dark colors work best for document signing</li>
        </ul>
      </div>

      {/* CSS for slider styling */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  );
};

export default SignatureCanvas;