'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { MarsSphere } from './MarsSphere';
import { CodexLogo } from './CodexLogo';
import {
  Lock,
  ShieldAlert,
  AlertTriangle,
  Copy,
  Check,
  Globe,
  UserCheck,
  ArrowRight,
  Terminal,
} from 'lucide-react';
import { AUTHORIZED_OPERATOR_EMAIL } from '@/lib/firebase/auth';
import { isFirebaseConfigured } from '@/lib/firebase/config';

export const LoginView: React.FC = () => {
  const { signInWithGoogleAuth, loginAsAuthorizedOperator, authError, clearAuthError } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [currentHostname, setCurrentHostname] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.hostname;
    }
    return '';
  });

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setLocalError(null);
    clearAuthError();

    try {
      const result = await signInWithGoogleAuth();
      if (!result.success && result.error) {
        setLocalError(result.error);
      }
    } catch (err: any) {
      setLocalError(err?.message || 'Ocorreu um erro inesperado durante a autenticação.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyHostname = () => {
    if (currentHostname) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const activeError = localError || authError;
  const isUnauthorizedDomainError =
    Boolean(activeError && (
      activeError.includes('Authorized Domains') ||
      activeError.includes('unauthorized-domain') ||
      activeError.includes('não está cadastrado')
    ));

  return (
    <div className="min-h-screen w-full bg-[#050505] text-[#F2F2F3] flex flex-col justify-between p-6 relative overflow-hidden select-none">
      {/* Sci-Fi HUD Outer Framing Lines & Notches */}
      <div className="absolute inset-4 border border-[#202026] rounded-2xl pointer-events-none z-0">
        {/* Top-left corner tech notches */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#E84A32] rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#E84A32] rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#E84A32] rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#E84A32] rounded-br-2xl" />

        {/* Framing tick marks */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-3 h-0.5 bg-[#E84A32]" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-3 h-0.5 bg-[#E84A32]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-[#E84A32]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-[#E84A32]" />
      </div>

      {/* Main Content Grid */}
      <div className="relative z-10 max-w-6xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-8">
        {/* Left Column: Planetary Visual & Brand identity */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative flex items-center justify-center">
            <MarsSphere size={360} withReticle={true} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <CodexLogo size="xl" showText={false} />
            </div>
          </div>

          <div className="space-y-2 max-w-sm">
            <h1 className="text-2xl font-extrabold tracking-[0.3em] font-heading text-[#F2F2F3] uppercase">
              CODEX <span className="text-[#E84A32]">MARTIS</span>
            </h1>
            <p className="text-xs text-[#A0A0A7] leading-relaxed">
              Central de comando para gestão e preservação de contexto dos seus projetos.
            </p>
          </div>
        </div>

        {/* Right Column: Real Authentication Card */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md bg-[#0C0C0E]/90 border border-[#232328] rounded-xl p-7 relative shadow-2xl backdrop-blur-xl hud-card-corners space-y-5">
            {/* Header */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#1F0E0B] border border-[#E84A32]/60 flex items-center justify-center text-[#E84A32] mb-3 shadow-[0_0_20px_rgba(232,74,50,0.3)]">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold font-heading text-[#F2F2F3] tracking-wide">
                Acesso Operacional
              </h2>
              <p className="text-xs text-[#808088] mt-0.5 font-mono-code">
                Autenticação de comando via Firebase Auth
              </p>
            </div>

            {/* Config Status Pill */}
            {!isFirebaseConfigured && (
              <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Credenciais Firebase Web não detectadas</p>
                  <p className="text-[11px] text-amber-300/80">
                    Defina as variáveis <span className="font-mono-code">NEXT_PUBLIC_FIREBASE_*</span> no ambiente para conexão com o Firebase Auth.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message Box */}
            {activeError && (
              <div className="p-3.5 rounded-lg bg-red-950/50 border border-red-800/80 text-red-200 text-xs space-y-2 animate-in fade-in zoom-in-95">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-[#E84A32] shrink-0 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <p className="font-bold text-[#F2F2F3] font-heading">
                      {isUnauthorizedDomainError ? 'Domínio Não Autorizado no Firebase' : 'Autenticação Não Concedida'}
                    </p>
                    <p className="text-[11px] leading-relaxed text-red-200">{activeError}</p>
                  </div>
                </div>

                {/* Domain Quick-Copy Diagnostic */}
                {isUnauthorizedDomainError && currentHostname && (
                  <div className="pt-2 border-t border-red-900/40 space-y-2">
                    <p className="text-[10px] text-red-300 font-mono-code uppercase">
                      Domínio atual para adicionar no Firebase Console:
                    </p>
                    <div className="flex items-center gap-2 bg-[#08080A] p-2 rounded border border-red-900/60 font-mono-code text-[11px] text-[#F2F2F3] break-all">
                      <Globe className="w-3.5 h-3.5 text-[#E84A32] shrink-0" />
                      <span className="flex-1 select-all">{currentHostname}</span>
                      <button
                        type="button"
                        onClick={handleCopyHostname}
                        className="px-2 py-1 bg-[#1A1A22] hover:bg-[#252530] text-[#D8D8DC] rounded text-[10px] font-heading font-bold flex items-center gap-1 shrink-0"
                      >
                        {copiedDomain ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-[#E84A32]" />}
                        <span>{copiedDomain ? 'COPIADO' : 'COPIAR'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Single Operator Whitelist Banner */}
            <div className="p-3.5 rounded-lg bg-[#070709] border border-[#1E1E24] space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#808088] font-mono-code uppercase">Controle de Acesso:</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-[10px] font-bold font-heading">
                  OPERADOR SOLO
                </span>
              </div>
              <p className="text-xs text-[#C5C5CB] font-mono-code truncate font-medium">
                {AUTHORIZED_OPERATOR_EMAIL}
              </p>
              <p className="text-[10px] text-[#66666D] leading-tight">
                Apenas a conta Google autorizada acima tem autorização para operar o sistema.
              </p>
            </div>

            {/* Actions Stack */}
            <div className="space-y-3">
              {/* Primary Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-lg bg-[#E84A32] hover:bg-[#F06447] active:bg-[#C93822] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-3 shadow-[0_0_25px_-5px_rgba(232,74,50,0.5)] transition-all font-heading"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Conectando com o Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#FFFFFF"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#FFFFFF"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FFFFFF"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#FFFFFF"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Entrar com Google</span>
                  </>
                )}
              </button>

              {/* Direct Authorized Operator Access (Sandbox / Dev Bypass) */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => loginAsAuthorizedOperator()}
                  className="w-full py-2.5 px-3 rounded-lg bg-[#14141A] hover:bg-[#1C1C24] active:bg-[#252530] border border-[#2B2B38] hover:border-[#E84A32]/60 text-[#D8D8DC] hover:text-white font-bold text-[11px] tracking-wide uppercase flex items-center justify-between transition-all font-heading group"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400 group-hover:text-[#E84A32] transition-colors" />
                    <span>Acesso Direto do Operador Solo</span>
                  </div>
                  <span className="text-[10px] text-[#808088] font-mono-code group-hover:text-[#D8D8DC]">
                    Sandbox / Dev &rarr;
                  </span>
                </button>
                <p className="text-[10px] text-[#555560] text-center mt-1.5 font-mono-code">
                  Concede acesso imediato à conta de comando cadastrada.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center text-xs text-[#505058] font-mono-code">
        Codex Martis • v1.0 • Autenticação de Comando
      </footer>
    </div>
  );
};

