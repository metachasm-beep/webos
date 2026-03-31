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
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative group ${isDragging ? 'opacity-50' : ''}`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="absolute -left-12 top-1/2 -translate-y-1/2 p-2 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-primary transition-colors opacity-0 group-hover:opacity-100 z-50 glass rounded-xl"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      {children}
    </div>
  );
}
