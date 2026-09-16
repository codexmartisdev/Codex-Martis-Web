'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export const MartianAtmosphere: React.FC = () => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="martian-atmosphere" aria-hidden="true">
      <motion.div
        className="absolute -top-56 right-[8%] h-[34rem] w-[34rem] rounded-full bg-[#E84A32]/[0.055] blur-[110px]"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, 18, -10, 0],
                y: [0, 12, 4, 0],
                scale: [1, 1.05, 0.98, 1],
              }
        }
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute left-[20%] top-[38%] h-72 w-72 rounded-full bg-[#7D1A12]/[0.045] blur-[100px]"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, -16, 12, 0],
                y: [0, 10, -8, 0],
              }
        }
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="mars-horizon-glow" />
    </div>
  );
};
