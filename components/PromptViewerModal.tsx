'use client';

import React, { useState } from 'react';
import { X, Copy, Download, Check, FileText } from 'lucide-react';

interface PromptViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  schemaName: string;
  promptContent: string;
  downloadFilename?: string;
}

export const PromptViewerModal: React.FC<PromptViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  schemaName,
  promptContent,
  downloadFilename = 'codex-martis-prompt.txt',
}) => {
  const [copied, setCopied] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(promptContent);
        setCopied(true);
        setCopyFeedback('Prompt copiado.');
        setTimeout(() => {
          setCopied(false);
          setCopyFeedback(null);
        }, 3000);
      } else {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = promptContent;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        setCopyFeedback('Prompt copiado.');
        setTimeout(() => {
          setCopied(false);
          setCopyFeedback(null);
        }, 3000);
      }
    } catch {
      setCopyFeedback('Não foi possível copiar automaticamente.');
      setTimeout(() => setCopyFeedback(null), 3000);
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([promptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[70] flex items-center justify-center p-4">
      <div className="bg-[#0C0C0E] border border-[#282830] rounded-xl max-w-3xl w-full p-6 relative shadow-2xl hud-card-corners animate-in fade-in max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1C1C22]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#141418] border border-[#282832] flex items-center justify-center text-[#E84A32]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-heading text-[#F2F2F3] uppercase tracking-wider">
                {title}
              </h2>
              <p className="text-[10px] text-[#808088] font-mono-code">
                Schema: <span className="text-[#E84A32]">{schemaName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#808088] hover:text-[#F2F2F3] p-1.5 rounded-lg hover:bg-[#181820] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-[#1C1C22] text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-lg font-bold font-heading text-[11px] tracking-wider uppercase flex items-center gap-1.5 transition-all ${
                copied
                  ? 'bg-emerald-950/60 border border-emerald-700 text-emerald-300'
                  : 'bg-[#141418] hover:bg-[#1E1E26] border border-[#282832] text-[#F2F2F3]'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#E84A32]" />}
              <span>{copied ? 'PROMPT COPIADO' : 'COPIAR'}</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="px-3 py-1.5 rounded-lg bg-[#141418] hover:bg-[#1E1E26] border border-[#282832] text-[#F2F2F3] font-bold font-heading text-[11px] tracking-wider uppercase flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-[#E84A32]" />
              <span>BAIXAR TXT</span>
            </button>
          </div>

          {copyFeedback && (
            <span className="text-[11px] font-mono-code text-emerald-400">
              {copyFeedback}
            </span>
          )}
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-y-auto my-4 p-4 bg-[#070709] border border-[#1C1C22] rounded-lg">
          <pre className="text-[11px] font-mono-code text-[#C5C5CB] whitespace-pre-wrap leading-relaxed select-all">
            {promptContent}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1C1C22]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#141418] hover:bg-[#1E1E26] border border-[#282832] text-[#808088] hover:text-[#F2F2F3] text-xs font-bold font-heading uppercase tracking-wider transition-colors"
          >
            FECHAR
          </button>
        </div>
      </div>
    </div>
  );
};
