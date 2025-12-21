"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    try {
      const saved = localStorage.getItem('theme') as Theme | null;
      if (saved) return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
      if (document.documentElement.classList.contains('dark')) return 'dark';
    } catch (e) {
      /* ignore */
    }
    return 'light';
  });

  useEffect(() => {
    // ensure localStorage and document class are synced on mount
    try {
      localStorage.setItem('theme', theme);
      if (theme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    } catch (e) {
      /* ignore */
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
