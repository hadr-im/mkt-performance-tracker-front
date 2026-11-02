import './globals.css';
import { Outfit, Work_Sans } from 'next/font/google';
import Sidebar from '../components/Sidebar';
import FilterBar from '../components/FilterBar';
import { FilterProvider } from '../components/FilterContext';
import { ThemeProvider, themeInitScript } from '../components/ThemeProvider';

// "Geometric Modern": Outfit for headings and figures, Work Sans for body.
const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-outfit',
});

const workSans = Work_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-work-sans',
});

export const metadata = {
  title: 'Marketing Physical Campaigns Performance Tracker',
  description: 'Physical campaigns analytics dashboard',
  icons: {
    icon: '/assets/hadrumet_rocket.png',
    shortcut: '/assets/hadrumet_rocket.png',
    apple: '/assets/hadrumet_rocket.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F4F7FB' },
    { media: '(prefers-color-scheme: dark)', color: '#071225' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${workSans.variable}`} suppressHydrationWarning>
      <head>
        {/* Applies the saved theme before first paint to avoid a light flash */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="app-canvas min-h-dvh font-body text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>

        <ThemeProvider>
          <FilterProvider>
            <div className="flex min-h-dvh">
              <Sidebar />
              <div className="flex min-h-dvh w-full min-w-0 flex-1 flex-col lg:ml-[232px] lg:max-w-[calc(100vw-232px)]">
                <FilterBar />
                <main id="main" className="w-full min-w-0 flex-1 px-4 py-5 sm:px-5 sm:py-6 lg:px-6 2xl:px-8">
                  <div className="mx-auto w-full max-w-[1800px]">{children}</div>
                </main>
              </div>
            </div>
          </FilterProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
