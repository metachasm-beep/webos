"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';

interface SortableNodeProps {
  id: string;
  children: React.ReactNode;
  index: number;
  isIsometric?: boolean;
}

export function SortableNode({ id, children, index, isIsometric }: SortableNodeProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : (isIsometric ? index * 10 : 0),
    position: 'relative' as const,
  };

  return (
    <motion.div 
      ref={setNodeRef} 
      style={style} 
      animate={{
        scale: isDragging ? 1.02 : 1,
        boxShadow: isDragging 
          ? "0 20px 40px rgba(0,0,0,0.4), 0 0 0 2px var(--primary)" 
          : "0 0 0 0px rgba(0,0,0,0)",
      }}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className={`absolute -left-12 top-1/2 -translate-y-1/2 p-2 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-primary transition-all z-50 glass rounded-xl ${isDragging ? 'opacity-100 scale-110 text-primary' : 'opacity-0 group-hover:opacity-100'}`}
      >
        <GripVertical className="h-4 w-4" />
      </div>
      {children}
    </motion.div>
  );
}
