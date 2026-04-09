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
  const [pos, setPos] = useState(initialPos);
  const [isResizing, setIsResizing] = useState(false);

  const startResize = (e: React.MouseEvent, type: 'tl' | 'tr' | 'bl' | 'br') => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);

    const startW = size.w;
    const startH = size.h;
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = pos.x;
    const startPosY = pos.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newW = startW;
      let newH = startH;
      let newX = startPosX;
      let newY = startPosY;

      if (type === 'br') {
        newW = Math.max(100, startW + deltaX);
        newH = Math.max(100, startH + deltaY);
      } else if (type === 'tl') {
        newW = Math.max(100, startW - deltaX);
        newH = Math.max(100, startH - deltaY);
        newX = startPosX + (startW - newW);
        newY = startPosY + (startH - newH);
      } else if (type === 'tr') {
        newW = Math.max(100, startW + deltaX);
        newH = Math.max(100, startH - deltaY);
        newY = startPosY + (startH - newH);
      } else if (type === 'bl') {
        newW = Math.max(100, startW - deltaX);
        newH = Math.max(100, startH + deltaY);
        newX = startPosX + (startW - newW);
      }

      setSize({ w: newW, h: newH });
      setPos({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      setIsResizing(false);
      onUpdate(id, { ...size, ...pos });
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <motion.div
      drag={!isResizing}
      dragMomentum={false}
      onDragEnd={(_, info) => {
        const newPos = { x: pos.x + info.delta.x, y: pos.y + info.delta.y };
        setPos(newPos);
        onUpdate(id, newPos);
      }}
      style={{
        position: 'absolute',
        top: pos.y,
        left: pos.x,
        width: size.w,
        height: size.h,
        zIndex: 100,
      }}
      className="group"
    >
      <div className="relative w-full h-full glass rounded-3xl overflow-hidden shadow-2xl border border-white/20 group-hover:border-primary/50 transition-colors">
        <img src={url} alt="Floating Asset" className="w-full h-full object-cover pointer-events-none select-none" />
        
        {/* Toolbar */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-50">
           <button onClick={() => onDelete(id)} className="p-1.5 rounded-lg bg-red-500/80 text-white hover:bg-red-600 transition-colors">
              <X className="h-3 w-3" />
           </button>
        </div>

        {/* Grab Handle */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-40 pointer-events-none">
           <Move className="h-8 w-8 text-white" />
        </div>

        {/* Resizing Synthesis: 4-Corner Handles */}
        {[
          { type: 'tl', class: 'top-[-8px] left-[-8px] cursor-nw-resize' },
          { type: 'tr', class: 'top-[-8px] right-[-8px] cursor-ne-resize' },
          { type: 'bl', class: 'bottom-[-8px] left-[-8px] cursor-sw-resize' },
          { type: 'br', class: 'bottom-[-8px] right-[-8px] cursor-se-resize' }
        ].map((handle) => (
          <motion.div 
            key={handle.type}
            onMouseDown={(e) => startResize(e, handle.type as any)}
            whileHover={{ scale: 1.4 }}
            whileTap={{ scale: 0.8 }}
            className={`absolute w-6 h-6 bg-primary border-2 border-white/20 rounded-full shadow-xl ${handle.class} opacity-0 group-hover:opacity-100 transition-opacity z-50 flex items-center justify-center`}
          >
             <Maximize2 className="h-3 w-3 text-white" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
