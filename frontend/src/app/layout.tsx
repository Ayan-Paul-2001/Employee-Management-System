import type { Metadata } from 'next';
import { Manrope, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/auth-context';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-instrument-serif',
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Next Hunt Management System',
  description:
    'Executive Workforce, Attendance Analytics, Leave & Notice Management Platform for HR, Admins & Employees.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#F6F5F1] text-[#111318] antialiased selection:bg-[#C9A25B]/25 selection:text-[#0B0E14]"
      >
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0D1017',
                color: '#FAF8F5',
                border: '1px solid rgba(201, 162, 91, 0.25)',
                borderRadius: '14px',
                fontSize: '13px',
                fontWeight: 500,
                padding: '12px 16px',
                boxShadow: '0 16px 40px rgba(9, 11, 16, 0.28)',
              },
              success: {
                iconTheme: { primary: '#10B981', secondary: '#0D1017' },
              },
              error: {
                iconTheme: { primary: '#F43F5E', secondary: '#0D1017' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
