import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PNG Gallery',
  description: 'Upload and manage PNG images',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <style>{`
          [data-nextjs-loading] {
            display: none !important;
          }
          svg[data-next-mark-loading] {
            display: none !important;
          }
          .nextjs-toast-errors-parent {
            display: none !important;
          }
        `}</style>
      </head>
      <body className={inter.className}>
        <nav className="bg-gray-800 text-white p-4">
          <div className="container mx-auto flex gap-4">
            <Link href="/" className="hover:text-gray-300">
              Home
            </Link>
            <Link href="/admin" className="hover:text-gray-300">
              Admin
            </Link>
            <Link href="/gallery" className="hover:text-gray-300">
              Gallery
            </Link>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
} 