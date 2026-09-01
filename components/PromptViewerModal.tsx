'use client';

import React, { useState } from 'react';
import { X, Copy, Download, Check, FileText, Sparkles, Layers } from 'lucide-react';

interface PromptViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  schemaName: string;
  promptContent: string;
  promptWithContext?: string;
  downloadFilename?: string;
}

export const PromptViewerModal: React.FC<PromptViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  schemaName,
  promptContent,
  promptWithContext,
  downloadFilename = 'codex-martis-project-update-schema-1.0.txt',
}) => {
  const [activeView, setActiveView] = useState<'base' | 'context'>(promptWithContext ? 'context' : 'base');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentContent = activeView === 'context' && promptWithContext ? promptWithContext : promptContent;

  const copyToClipboard = async (text: string, type: string, label: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedType(type);
      setFeedback(label);
      setTimeout(() => {
        setCopiedType(null);
        setFeedback(null);
      }, 3000);
    } catch {
      setFeedback('Não foi possível copiar automaticamente.');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleDownloadTxt = (withContext: boolean = false) => {
    const textToDownload = withContext && promptWithContext ? promptWithContext : currentContent;
    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[70] flex items-center justify-center p-4">
      <div className="bg-[#0C0C0E] border border-[#282830] rounded-xl max-w-4xl w-full p-6 relative shadow-2xl hud-card-corners animate-in fade-in max-h-[92vh] flex flex-col">
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

        {/* View Toggle Tabs if context exists */}
        {promptWithContext && (
          <div className="flex items-center gap-2 pt-3 pb-1">
            <button
              onClick={() => setActiveView('context')}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold uppercase transition-all flex items-center gap-1.5 ${
                activeView === 'context'
                  ? 'bg-[#E84A32]/20 border border-[#E84A32] text-[#E84A32]'
                  : 'bg-[#141418] text-[#808088] hover:text-[#D8D8DC] border border-transparent'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Prompt + Contexto do Projeto
            </button>
            <button
              onClick={() => setActiveView('base')}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold uppercase transition-all flex items-center gap-1.5 ${
                activeView === 'base'
                  ? 'bg-[#E84A32]/20 border border-[#E84A32] text-[#E84A32]'
                  : 'bg-[#141418] text-[#808088] hover:text-[#D8D8DC] border border-transparent'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Prompt Base (Template)
            </button>
          </div>
        )}

        {/* Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-[#1C1C22] text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => copyToClipboard(promptContent, 'base', 'Prompt base copiado.')}
              className={`px-3 py-1.5 rounded-lg font-bold font-heading text-[11px] tracking-wider uppercase flex items-center gap-1.5 transition-all ${
                copiedType === 'base'
                  ? 'bg-emerald-950/60 border border-emerald-700 text-emerald-300'
                  : 'bg-[#141418] hover:bg-[#1E1E26] border border-[#282832] text-[#F2F2F3]'
              }`}
            >
              {copiedType === 'base' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#E84A32]" />}
              <span>{copiedType === 'base' ? 'PROMPT COPIADO' : 'COPIAR PROMPT'}</span>
            </button>

            {promptWithContext && (
              <button
                onClick={() => copyToClipboard(promptWithContext, 'context', 'Prompt + contexto copiado.')}
                className={`px-3 py-1.5 rounded-lg font-bold font-heading text-[11px] tracking-wider uppercase flex items-center gap-1.5 transition-all ${
                  copiedType === 'context'
                    ? 'bg-emerald-950/60 border border-emerald-700 text-emerald-300'
                    : 'bg-[#E84A32] hover:bg-[#F06447] text-white shadow-[0_0_12px_rgba(232,74,50,0.3)]'
                }`}
              >
                {copiedType === 'context' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'context' ? 'COPIADO' : 'COPIAR + CONTEXTO'}</span>
              </button>
            )}

            <button
              onClick={() => handleDownloadTxt(activeView === 'context')}
              className="px-3 py-1.5 rounded-lg bg-[#141418] hover:bg-[#1E1E26] border border-[#282832] text-[#F2F2F3] font-bold font-heading text-[11px] tracking-wider uppercase flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-[#E84A32]" />
              <span>BAIXAR TXT</span>
            </button>
          </div>

          {feedback && (
            <span className="text-[11px] font-mono-code text-emerald-400">
              {feedback}
            </span>
          )}
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-y-auto my-4 p-4 bg-[#070709] border border-[#1C1C22] rounded-lg">
          <pre className="text-[11px] font-mono-code text-[#C5C5CB] whitespace-pre-wrap leading-relaxed select-all">
            {currentContent}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1C1C22]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#141418] hover:bg-[#1E1E26] border border-[#282832] text-[#808088] hover:text-[#F2F2F3] text-xs font-bold font-heading uppercase tracking-wider transition-colors"
          >
            FECHAR
          </button>
        </div>
      </div>
    </div>
  );
};
