import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  weight: ['500', '600', '700'],
  variable: '--font-heading',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Codex Martis — Central de Comando',
  description: 'Central de comando para gestão e preservação de contexto de projetos, tarefas, sessões, ambientes e histórico.',
  openGraph: {
    title: 'Codex Martis — Central de Comando',
    description: 'Central de comando para gestão e preservação de contexto de projetos, tarefas, sessões, ambientes e histórico.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Codex Martis — Central de Comando',
    description: 'Central de comando para gestão e preservação de contexto de projetos, tarefas, sessões, ambientes e histórico.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`dark ${plusJakarta.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable}`}>
      <body className="bg-[#050505] text-[#F2F2F3] antialiased selection:bg-[#E84A32]/30 selection:text-white min-h-screen font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

