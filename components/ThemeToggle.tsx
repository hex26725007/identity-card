'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      className={`theme-toggle ${isDark ? 'is-dark' : ''}`}
      aria-label={isDark ? '切换到日间模式' : '切换到夜间模式'}
      title={isDark ? '日间模式' : '夜间模式'}
      disabled={!mounted}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {mounted ? (isDark ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />) : <Moon size={18} strokeWidth={2} />}
    </button>
  );
}
