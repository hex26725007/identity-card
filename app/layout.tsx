import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '英文身份助手 · Find Your English Identity',
  description: '为你找到自然、好记、适合场景的英文名。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        {/* Privacy-friendly analytics by Plausible */}
        <script async src="https://plausible.io/js/pa-RbLg8n_iTPv3BFKAIvHno.js" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
  plausible.init()`,
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
