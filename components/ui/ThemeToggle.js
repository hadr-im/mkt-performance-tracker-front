'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../ThemeProvider';

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
      className="relative grid h-10 w-10 shrink-0 place-items-center rounded-md2 border border-line bg-surface text-ink-2 transition-colors duration-200 ease-out2 hover:border-line-2 hover:bg-surface-2 hover:text-ink"
    >
      <Sun
        size={17}
        strokeWidth={2.2}
        className={`absolute transition-all duration-300 ease-out2 ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
      />
      <Moon
        size={17}
        strokeWidth={2.2}
        className={`absolute transition-all duration-300 ease-out2 ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}
      />
    </button>
  );
}
