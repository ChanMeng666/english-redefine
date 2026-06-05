import type {Metadata, Viewport} from 'next';
import { Inter } from 'next/font/google';
import Image from 'next/image';
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
      <body className={inter.className}>
      {children}
      {/* Developer brand credit — Chan Meng */}
      <footer className="border-t border-gray-200 py-6 px-4">
        <div className="container mx-auto flex flex-col items-center gap-2 text-xs text-gray-500">
          <a
            href="https://github.com/ChanMeng666"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition-colors hover:text-gray-800"
          >
            <Image src="/chan_logo.svg" alt="Chan Meng" width={18} height={18} className="rounded-sm" />
            <span className="font-medium">Built by Chan Meng — need a custom app like this one?</span>
          </a>
          <a href="mailto:chanmeng.dev@gmail.com" className="transition-colors hover:text-gray-800">
            chanmeng.dev@gmail.com
          </a>
        </div>
      </footer>
      </body>
      </html>
  );
}
