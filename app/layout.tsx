import type {Metadata} from 'next';
import './globals.css';

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

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#050505] text-[#F2F2F3] antialiased selection:bg-[#E84A32]/30 selection:text-white min-h-screen font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
