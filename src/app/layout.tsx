import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cardápio Semanal | Banlek',
  description: 'Consulte as refeições da semana preparadas pela nossa equipe da cozinha Banlek.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2222%22 fill=%22%231E7BE8%22/><text y=%22.78em%22 x=%2250%25%22 font-size=%2260%22 text-anchor=%22middle%22>🍽️</text></svg>',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1E7BE8',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[#F5F7FA] text-[#1A1F2B] antialiased">
        {children}
      </body>
    </html>
  );
}
