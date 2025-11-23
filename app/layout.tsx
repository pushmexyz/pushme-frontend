import type { Metadata } from 'next';
import './globals.css';
import WalletProvider from '@/components/WalletProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import ClientErrorBoundary from '@/components/ClientErrorBoundary';

export const metadata: Metadata = {
  title: 'PressMe.xyz - Solana-Powered Interactive Livestream Button',
  description: 'Press the button, trigger events, play games, win SOL. Everything runs in real time.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.cdnfonts.com/css/bangers" rel="stylesheet" />
      </head>
      <body className="font-body">
        <ClientErrorBoundary>
          <WalletProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </WalletProvider>
        </ClientErrorBoundary>
      </body>
    </html>
  );
}

