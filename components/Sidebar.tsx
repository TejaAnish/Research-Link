import React from 'react';
import { DashboardIcon } from './icons';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    disabled={!onClick}
    className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none ${
      isActive
        ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 shadow-lg'
        : 'text-gray-600 dark:text-gray-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
    }`}
  >
    {icon}
    <span className="ml-4 font-semibold">{label}</span>
  </button>
);

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-slate-100 dark:bg-slate-800/50 p-4 border-r border-slate-200 dark:border-slate-700/50 flex flex-col space-y-4">
      <div className="flex items-center space-x-2 p-2">
         <svg className="w-10 h-10 text-cyan-500 dark:text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
          </svg>
        <span className="text-xl font-bold text-slate-900 dark:text-white">Workspace</span>
      </div>
      <nav className="flex-1 space-y-2">
        <NavItem
          icon={<DashboardIcon className="w-6 h-6" />}
          label="Dashboard"
          isActive={true}
        />
      </nav>
      <div className="mt-auto p-4 bg-slate-200 dark:bg-slate-900/50 rounded-lg text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Logged in as</p>
        <p className="font-semibold text-slate-900 dark:text-white">Dr. Alisha Khan</p>
      </div>
    </aside>
  );
};