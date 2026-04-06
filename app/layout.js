import './globals.css';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Sidebar from '../components/Sidebar';
import FilterBar from '../components/FilterBar';
import { FilterProvider } from '../components/FilterContext';

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Marketing Physical Campaigns Performance tracker',
  description: 'Physical Campaigns Analytics Dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.className} grid-bg min-h-screen`}>
        <FilterProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen ml-0 md:ml-64 min-w-0 w-full overflow-x-hidden max-w-[100vw] md:max-w-[calc(100vw-16rem)] relative">
              <FilterBar />
              <main className="flex-1 p-3 sm:p-4 md:p-8 min-w-0 w-full overflow-x-hidden">
                {children}
              </main>
            </div>
          </div>
        </FilterProvider>
      </body>
    </html>
  );
}
