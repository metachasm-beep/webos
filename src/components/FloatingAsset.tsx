"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Maximize2, Move } from "lucide-react";

interface FloatingAssetProps {
  id: string;
  url: string;
  initialPos: { x: number, y: number };
  initialSize: { w: number, h: number };
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
}

export function FloatingAsset({ id, url, initialPos, initialSize, onUpdate, onDelete }: FloatingAssetProps) {
  const [size, setSize] = useState(initialSize);
  const [isResizing, setIsResizing] = useState(false);

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragEnd={(_, info) => {
        onUpdate(id, { x: initialPos.x + info.point.x, y: initialPos.y + info.point.y });
      }}
      style={{
        position: 'absolute',
        top: initialPos.y,
        left: initialPos.x,
        width: size.w,
        height: size.h,
        zIndex: 100,
      }}
      className="group"
    >
      <div className="relative w-full h-full glass rounded-3xl overflow-hidden shadow-2xl border border-white/20 group-hover:border-primary/50 transition-colors">
        <img src={url} alt="Floating Asset" className="w-full h-full object-cover pointer-events-none select-none" />
        
        {/* Toolbar */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <button onClick={() => onDelete(id)} className="p-1.5 rounded-lg bg-red-500/80 text-white hover:bg-red-600 transition-colors">
              <X className="h-3 w-3" />
           </button>
        </div>

        {/* Grab Handle */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-40 pointer-events-none">
           <Move className="h-8 w-8 text-white" />
        </div>

        {/* Resize Handle */}
        <div 
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsResizing(true);
            const startW = size.w;
            const startH = size.h;
            const startX = e.clientX;
            const startY = e.clientY;

            const onMouseMove = (moveEvent: MouseEvent) => {
              const newW = Math.max(100, startW + (moveEvent.clientX - startX));
              const newH = Math.max(100, startH + (moveEvent.clientY - startY));
              setSize({ w: newW, h: newH });
              onUpdate(id, { w: newW, h: newH });
            };

            const onMouseUp = () => {
              document.removeEventListener('mousemove', onMouseMove);
              document.removeEventListener('mouseup', onMouseUp);
              setIsResizing(false);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          }}
          className="absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize flex items-center justify-center text-primary opacity-0 group-hover:opacity-100"
        >
          <Maximize2 className="h-4 w-4 rotate-90" />
        </div>
      </div>
    </motion.div>
  );
}
