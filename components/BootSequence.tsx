'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Cpu, Database, Fingerprint, Radio, ShieldCheck, Terminal } from 'lucide-react';

const BOOT_LINES = [
  'INITIALIZING CODEX MARTIS CYBER CORE',
  'AUTH CHANNEL VERIFIED',
  'FIRESTORE LINK ESTABLISHED',
  'PROJECT CONTEXT INDEXED',
  'OPERATOR COMMAND LAYER READY',
];

export const BootSequence: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [lineCount, setLineCount] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sessionKey = 'codex-martis-cyber-boot-seen';
    if (window.sessionStorage.getItem(sessionKey)) return;

    window.sessionStorage.setItem(sessionKey, '1');
    setVisible(true);

    const timers = BOOT_LINES.map((_, index) =>
      window.setTimeout(() => setLineCount(index + 1), 120 + index * 150)
    );
    const closeTimer = window.setTimeout(() => setVisible(false), reduceMotion ? 250 : 1250);

    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(closeTimer);
    };
  }, [reduceMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.22 }}
          className="fixed inset-0 z-[100] bg-[#030304]/95 backdrop-blur-xl flex items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 cyber-grid opacity-35" />
          <div className="absolute inset-x-[8%] top-1/2 h-px bg-gradient-to-r from-transparent via-[#E84A32]/45 to-transparent shadow-[0_0_24px_rgba(232,74,50,0.4)] cyber-scan-line" />

          <motion.div
            initial={reduceMotion ? undefined : { scale: 0.98, y: 8 }}
            animate={{ scale: 1, y: 0 }}
            className="relative w-[min(760px,92vw)] border border-[#E84A32]/35 bg-[#070709]/90 rounded-xl shadow-[0_0_80px_-24px_rgba(232,74,50,0.5)] overflow-hidden hud-card-corners"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#E84A32]/20 bg-[#0B0808]">
              <div className="flex items-center gap-2 text-[#FF7A59]">
                <Terminal className="w-4 h-4" />
                <span className="text-[11px] font-bold font-mono-code tracking-[0.18em] uppercase">CODEX://BOOT-SEQUENCE</span>
              </div>
              <span className="text-[10px] font-mono-code text-[#66666D]">CORE BUILD // MARS-02</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-0">
              <div className="p-5 md:p-6 font-mono-code text-[11px] min-h-[220px]">
                <div className="text-[#565660] mb-4">&gt; secure_boot --profile operator --mode command</div>
                <div className="space-y-2.5">
                  {BOOT_LINES.slice(0, lineCount).map((line, index) => (
                    <motion.div
                      key={line}
                      initial={reduceMotion ? undefined : { opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-[#E84A32]">[{String(index + 1).padStart(2, '0')}]</span>
                      <span className="text-[#A0A0A7]">{line}</span>
                      <span className="ml-auto text-emerald-400">OK</span>
                    </motion.div>
                  ))}
                  {lineCount < BOOT_LINES.length && <span className="inline-block w-1.5 h-3 bg-[#E84A32] animate-pulse" />}
                </div>
              </div>

              <div className="border-t md:border-t-0 md:border-l border-[#1E1E24] p-5 bg-[#050506]/60 flex flex-col justify-center gap-4">
                {[
                  { icon: ShieldCheck, label: 'SECURITY', value: 'NOMINAL' },
                  { icon: Database, label: 'DATA LINK', value: 'SYNC' },
                  { icon: Radio, label: 'CHANNEL', value: 'LOCKED' },
                  { icon: Cpu, label: 'CYBER CORE', value: 'READY' },
                  { icon: Fingerprint, label: 'OPERATOR', value: 'VERIFIED' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5 text-[#E84A32]" />
                    <div className="min-w-0">
                      <div className="text-[8px] text-[#5C5C65] font-mono-code tracking-wider">{label}</div>
                      <div className="text-[10px] text-[#D8D8DC] font-mono-code">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
