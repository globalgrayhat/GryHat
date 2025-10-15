import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * A simple theme context to toggle between light and dark themes. The theme
 * state is persisted to localStorage so that user preferences persist
 * across sessions. When the theme changes, the appropriate class is
 * applied to the document root to enable CSS-based theming.
 */
export type Theme = 'light' | 'dark';

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: 'light',
  // default toggle does nothing; real implementation provided in provider
  toggleTheme: () => {},
});

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialise theme from localStorage if available, otherwise default to light.
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
    }
    return 'light';
  });

  // Apply the theme class to the document root whenever it changes.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => useContext(ThemeContext);

export { ThemeProvider, useTheme };