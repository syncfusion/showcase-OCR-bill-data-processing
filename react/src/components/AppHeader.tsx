import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

interface Props {
  onThemeChange: (theme: Theme) => void;
}

type Theme = 'light' | 'dark';

function readTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return (document.documentElement.dataset.theme as Theme | undefined) ?? 'light';
}

function writeTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}

export function AppHeader({ onThemeChange }: Props) {
  const [theme, setTheme] = useState<Theme>(() => readTheme());
  useEffect(() => {
    writeTheme(theme);
    onThemeChange(theme);
  }, [theme, onThemeChange]);

  return (
    <header id="top-wrapper" className="app-header">
      <div>
        <h1 style={{ margin: 0 }}>Document Data Extractor</h1>
      </div>
      <button
        type="button"
        className="theme-toggle"
        aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
        onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
      >
        {theme === 'light' ? <Moon size={16} aria-hidden /> : <Sun size={16} aria-hidden />}
        {theme === 'light' ? 'Dark' : 'Light'}
      </button>
    </header>
  );
}
