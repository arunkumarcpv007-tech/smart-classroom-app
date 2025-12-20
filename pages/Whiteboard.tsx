import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Trash2, Download, Square, Minus, Type, Palette, MousePointer2 } from 'lucide-react';

export const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = brushSize;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getPos = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const clearBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'scms-whiteboard-export.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Digital Whiteboard</h1>
          <p className="text-primary-600 font-bold uppercase tracking-widest text-xs mt-1">Freehand Study & Scribble Pad</p>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center bg-white dark:bg-slate-900 p-2 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setTool('pen')}
            className={`p-3 rounded-2xl transition-all ${tool === 'pen' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <MousePointer2 size={20} />
          </button>
          <button 
            onClick={() => setTool('eraser')}
            className={`p-3 rounded-2xl transition-all ${tool === 'eraser' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <Eraser size={20} />
          </button>
          
          <div className="w-[2px] h-6 bg-slate-100 dark:bg-slate-800 mx-1"></div>
          
          <div className="flex items-center gap-2 px-3">
            <div 
              onClick={() => setColor('#000000')}
              className={`w-6 h-6 rounded-full cursor-pointer border-2 ${color === '#000000' ? 'border-primary-600 scale-125' : 'border-transparent'}`}
              style={{ backgroundColor: '#000000' }}
            />
            <div 
              onClick={() => setColor('#ef4444')}
              className={`w-6 h-6 rounded-full cursor-pointer border-2 ${color === '#ef4444' ? 'border-primary-600 scale-125' : 'border-transparent'}`}
              style={{ backgroundColor: '#ef4444' }}
            />
            <div 
              onClick={() => setColor('#2563eb')}
              className={`w-6 h-6 rounded-full cursor-pointer border-2 ${color === '#2563eb' ? 'border-primary-600 scale-125' : 'border-transparent'}`}
              style={{ backgroundColor: '#2563eb' }}
            />
            <input 
              type="color" value={color} onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none"
            />
          </div>

          <div className="w-[2px] h-6 bg-slate-100 dark:bg-slate-800 mx-1"></div>

          <div className="flex items-center gap-3 px-3">
             <Minus size={14} className="text-slate-400" />
             <input 
               type="range" min="1" max="50" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))}
               className="w-24 accent-primary-600"
             />
             <Square size={20} className="text-slate-400" />
          </div>

          <div className="w-[2px] h-6 bg-slate-100 dark:bg-slate-800 mx-1"></div>

          <button onClick={clearBoard} className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all" title="Clear All">
            <Trash2 size={20} />
          </button>
          <button onClick={downloadBoard} className="p-3 text-emerald-500 hover:bg-emerald-50 rounded-2xl transition-all" title="Save Drawing">
            <Download size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 glass rounded-[48px] border-4 border-slate-200 dark:border-slate-800 overflow-hidden cursor-crosshair shadow-inner bg-white">
        <canvas 
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full touch-none"
        />
      </div>
    </div>
  );
};