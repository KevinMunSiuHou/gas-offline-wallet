
import React from 'react';
import { ICON_MAP } from '../constants';

interface IconSelectorProps {
  selectedIcon: string;
  onSelect: (iconName: string) => void;
}

export const IconSelector: React.FC<IconSelectorProps> = ({ selectedIcon, onSelect }) => {
  return (
    <div className="grid grid-cols-5 gap-3 max-h-48 overflow-y-auto p-2 border rounded-xl bg-gray-50">
      {Object.entries(ICON_MAP).map(([name, icon]) => (
        <button
          key={name}
          onClick={() => onSelect(name)}
          className={`p-3 flex items-center justify-center rounded-lg transition-all ${
            selectedIcon === name 
              ? 'bg-blue-600 text-white shadow-lg scale-110' 
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
};
