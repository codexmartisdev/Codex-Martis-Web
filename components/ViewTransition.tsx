'use client';

import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

interface ViewTransitionProps {
  viewKey: string;
  children: React.ReactNode;
  className?: string;
}

export const ViewTransition: React.FC<ViewTransitionProps> = ({
  viewKey,
  children,
  className = '',
}) => {
  const reduceMotion = useReducedMotion();
  const marsEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

  const initial = reduceMotion
    ? { opacity: 1 }
    : { opacity: 0, y: 8, scale: 0.997 };

  const animate = { opacity: 1, y: 0, scale: 1 };

  const exit = reduceMotion
    ? { opacity: 1 }
    : { opacity: 0, y: -4, scale: 0.998 };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={viewKey}
        initial={initial}
        animate={animate}
        exit={exit}
        transition={{
          duration: reduceMotion ? 0 : 0.22,
          ease: marsEase,
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
