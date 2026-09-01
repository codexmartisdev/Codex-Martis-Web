'use client';

import React from 'react';

interface MarsSphereProps {
  size?: number;
  className?: string;
  withReticle?: boolean;
}

export const MarsSphere: React.FC<MarsSphereProps> = ({
  size = 380,
  className = '',
  withReticle = true,
}) => {
  return (
    <div
      className={`relative select-none flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Ambient Red Atmospheric Glow behind Mars */}
      <div
        className="absolute inset-0 rounded-full bg-radial from-[#E84A32]/40 via-[#7D1A12]/15 to-transparent blur-3xl pointer-events-none"
        style={{ transform: 'scale(1.2)' }}
      />

      <svg
        viewBox="0 0 400 400"
        className="w-full h-full drop-shadow-[0_0_40px_rgba(232,74,50,0.3)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="marsHugeSurface" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFA07A" />
            <stop offset="25%" stopColor="#E84A32" />
            <stop offset="60%" stopColor="#961B0E" />
            <stop offset="85%" stopColor="#4A0803" />
            <stop offset="100%" stopColor="#150201" />
          </radialGradient>
          <radialGradient id="marsHaze" cx="50%" cy="50%" r="50%">
            <stop offset="88%" stopColor="transparent" />
            <stop offset="98%" stopColor="#FF6B4A" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#E84A32" stopOpacity="1" />
          </radialGradient>
          <linearGradient id="hudLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E84A32" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#7D1A12" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#E84A32" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {withReticle && (
          <>
            {/* Outer Orbit HUD Arcs */}
            <circle cx="200" cy="200" r="188" stroke="#E84A32" strokeWidth="1" strokeOpacity="0.25" />
            <circle cx="200" cy="200" r="180" stroke="#E84A32" strokeWidth="1.2" strokeDasharray="4 8" strokeOpacity="0.5" />
            <circle cx="200" cy="200" r="165" stroke="#7D1A12" strokeWidth="0.8" strokeOpacity="0.4" />

            {/* Orbit Target Notches */}
            <circle cx="200" cy="12" r="3.5" stroke="#E84A32" strokeWidth="1.5" fill="#050505" />
            <circle cx="200" cy="388" r="3.5" stroke="#E84A32" strokeWidth="1.5" fill="#050505" />
            <circle cx="12" cy="200" r="3.5" stroke="#E84A32" strokeWidth="1.5" fill="#050505" />
            <circle cx="388" cy="200" r="3.5" stroke="#E84A32" strokeWidth="1.5" fill="#050505" />

            {/* Diagonal Tech Crosshairs */}
            <line x1="45" y1="45" x2="65" y2="65" stroke="#E84A32" strokeWidth="1.5" strokeOpacity="0.7" />
            <line x1="355" y1="45" x2="335" y2="65" stroke="#E84A32" strokeWidth="1.5" strokeOpacity="0.7" />
            <line x1="45" y1="355" x2="65" y2="335" stroke="#E84A32" strokeWidth="1.5" strokeOpacity="0.7" />
            <line x1="355" y1="355" x2="335" y2="335" stroke="#E84A32" strokeWidth="1.5" strokeOpacity="0.7" />
          </>
        )}

        {/* Mars Celestial Body */}
        <circle cx="200" cy="200" r="135" fill="url(#marsHugeSurface)" />
        <circle cx="200" cy="200" r="135" fill="url(#marsHaze)" />

        {/* Detailed Surface Geology / Craters */}
        <g opacity="0.65">
          {/* Olympus Mons & Tharsis Montes volcanic region */}
          <ellipse cx="160" cy="155" rx="20" ry="14" fill="#3D0602" />
          <circle cx="160" cy="155" r="7" fill="#250301" />

          {/* Valles Marineris Canyon system */}
          <path
            d="M 175 190 Q 215 210 255 195 Q 275 190 285 200"
            stroke="#2B0401"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 180 196 Q 220 216 260 200"
            stroke="#1D0201"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Hellas Planitia Impact Basin */}
          <ellipse cx="230" cy="245" rx="28" ry="18" fill="#380703" />

          {/* Various craters */}
          <circle cx="130" cy="230" r="12" fill="#350602" />
          <circle cx="245" cy="140" r="9" fill="#3B0803" />
          <circle cx="185" cy="120" r="6" fill="#420A04" />
          <circle cx="120" cy="180" r="8" fill="#310502" />
          <circle cx="270" cy="165" r="7" fill="#380703" />
          <circle cx="220" cy="110" r="5" fill="#4B0C05" />
          <circle cx="150" cy="265" r="10" fill="#2D0401" />
        </g>

        {/* Planetary Shadow Curvature Overlay */}
        <path
          d="M 200 65 A 135 135 0 0 1 200 335 A 135 110 0 0 0 200 65"
          fill="#000000"
          fillOpacity="0.45"
        />
      </svg>
    </div>
  );
};
