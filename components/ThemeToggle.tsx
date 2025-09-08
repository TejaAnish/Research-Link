import React from 'react';
import { SunIcon, MoonIcon } from './icons';

interface ThemeToggleProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-full bg-slate-200 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-600/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? (
        <SunIcon className="w-5 h-5 text-yellow-300" />
      ) : (
        <MoonIcon className="w-5 h-5 text-slate-500" />
      )}
    </button>
  );
};