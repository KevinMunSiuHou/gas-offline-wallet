
import React from 'react';
import { ICON_MAP } from '../constants';

interface IconSelectorProps {
  selectedIcon: string;
  onSelect: (iconName: string) => void;
  isDarkMode?: boolean;
}

export const IconSelector: React.FC<IconSelectorProps> = ({ selectedIcon, onSelect, isDarkMode }) => {
  return (
    <div className={`grid grid-cols-5 gap-3 max-h-64 overflow-y-auto p-3 border rounded-2xl transition-colors no-scrollbar ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
      {Object.entries(ICON_MAP).map(([name, icon]) => (
        <button
          key={name}
          type="button"
          onClick={() => onSelect(name)}
          className={`p-3 flex items-center justify-center rounded-xl transition-all aspect-square ${
            selectedIcon === name 
              ? 'bg-blue-600 text-white shadow-lg scale-105' 
              : (isDarkMode ? 'bg-slate-800 text-gray-400 hover:bg-slate-700' : 'bg-white text-gray-600 hover:bg-gray-100')
          }`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
};
