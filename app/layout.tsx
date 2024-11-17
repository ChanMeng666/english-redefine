import type {Metadata, Viewport} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// export const metadata: Metadata = {
//   title: 'English Redefine Card Generator',
//   description: 'Redefine English words with modern perspectives',
//   viewport: {
//     width: 'device-width',
//     initialScale: 1,
//     maximumScale: 1,
//     userScalable: false,
//   },
// };

export const metadata: Metadata = {
    title: 'English Redefine Card Generator',
    description: 'Redefine English words with modern perspectives',
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en">
      <body className={inter.className}>{children}</body>
      </html>
  );
}
