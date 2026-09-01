'use client';

import React from 'react';

interface CodexLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const CodexLogo: React.FC<CodexLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const dimensionMap = {
    sm: { box: 36, orbit: 34, fontTitle: 'text-sm', fontSub: 'text-[9px]' },
    md: { box: 48, orbit: 46, fontTitle: 'text-base', fontSub: 'text-[10px]' },
    lg: { box: 72, orbit: 70, fontTitle: 'text-xl', fontSub: 'text-xs' },
    xl: { box: 140, orbit: 136, fontTitle: 'text-3xl', fontSub: 'text-sm' },
  };

  const { box, fontTitle, fontSub } = dimensionMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Precision Circular Sci-Fi Emblem */}
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{ width: box, height: box }}
      >
        <svg
          viewBox="0 0 160 160"
          className="w-full h-full drop-shadow-[0_0_15px_rgba(232,74,50,0.4)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="marsGradient" cx="45%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FF7A59" />
              <stop offset="40%" stopColor="#E84A32" />
              <stop offset="75%" stopColor="#9E2214" />
              <stop offset="100%" stopColor="#380603" />
            </radialGradient>
            <linearGradient id="orbitGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E84A32" />
              <stop offset="50%" stopColor="#7D1A12" />
              <stop offset="100%" stopColor="#E84A32" />
            </linearGradient>
            <radialGradient id="atmosphereGlow" cx="50%" cy="50%" r="50%">
              <stop offset="80%" stopColor="transparent" />
              <stop offset="100%" stopColor="#E84A32" stopOpacity="0.8" />
            </radialGradient>
          </defs>

          {/* Outer target radar ring */}
          <circle cx="80" cy="80" r="74" stroke="#E84A32" strokeWidth="1.5" strokeOpacity="0.5" />
          <circle cx="80" cy="80" r="70" stroke="#7D1A12" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.8" />

          {/* Outer 4-axis target notches */}
          <circle cx="80" cy="6" r="3.5" stroke="#E84A32" strokeWidth="1.5" fill="#050505" />
          <circle cx="80" cy="154" r="3.5" stroke="#E84A32" strokeWidth="1.5" fill="#050505" />
          <circle cx="6" cy="80" r="3.5" stroke="#E84A32" strokeWidth="1.5" fill="#050505" />
          <circle cx="154" cy="80" r="3.5" stroke="#E84A32" strokeWidth="1.5" fill="#050505" />

          {/* Mars Sphere */}
          <circle cx="80" cy="80" r="48" fill="url(#marsGradient)" />
          <circle cx="80" cy="80" r="48" fill="url(#atmosphereGlow)" />

          {/* Surface Craters details */}
          <ellipse cx="66" cy="65" rx="7" ry="5" fill="#580E08" fillOpacity="0.5" />
          <circle cx="95" cy="60" r="4.5" fill="#580E08" fillOpacity="0.4" />
          <circle cx="78" cy="98" r="5" fill="#3D0905" fillOpacity="0.5" />
          <circle cx="98" cy="90" r="6" fill="#380603" fillOpacity="0.6" />
          <ellipse cx="58" cy="85" rx="4" ry="3" fill="#4B0B06" fillOpacity="0.4" />

          {/* Equatorial Tech Orbit Split Lines */}
          <path d="M 12 80 L 42 80" stroke="#E84A32" strokeWidth="1.5" />
          <path d="M 118 80 L 148 80" stroke="#E84A32" strokeWidth="1.5" />

          {/* HUD Lower Bracket */}
          <path
            d="M 50 115 L 60 128 L 100 128 L 110 115"
            stroke="#E84A32"
            strokeWidth="1.5"
            strokeOpacity="0.8"
            fill="none"
          />
          <line x1="80" y1="128" x2="80" y2="150" stroke="#E84A32" strokeWidth="1.5" />

          {/* Tech Code Chevron </ > in Center-Lower */}
          <text
            x="80"
            y="118"
            fill="#E84A32"
            fontSize="15"
            fontWeight="bold"
            fontFamily="monospace"
            textAnchor="middle"
            alignmentBaseline="middle"
            letterSpacing="2"
          >
            &lt;/&gt;
          </text>
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-heading tracking-[0.25em] font-extrabold text-[#F2F2F3] uppercase leading-none ${fontTitle}`}
            >
              CODEX
            </span>
          </div>
          <div className="flex items-center justify-between w-full mt-0.5">
            <span className="h-[1px] w-3 bg-[#E84A32]/60 inline-block" />
            <span
              className={`font-heading tracking-[0.45em] font-semibold text-[#E84A32] uppercase leading-none px-1 ${fontSub}`}
            >
              MARTIS
            </span>
            <span className="h-[1px] w-3 bg-[#E84A32]/60 inline-block" />
          </div>
        </div>
      )}
    </div>
  );
};
