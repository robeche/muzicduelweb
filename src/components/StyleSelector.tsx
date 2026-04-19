"use client";

import { MUSIC_STYLES, type MusicStyle } from "@/types";

type StyleSelectorProps = {
  selectedStyles: MusicStyle[];
  onToggleStyle: (style: MusicStyle) => void;
  styleStats: Record<string, number>;
  disabled?: boolean;
};

export function StyleSelector({
  selectedStyles,
  onToggleStyle,
  styleStats,
  disabled = false,
}: StyleSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {MUSIC_STYLES.map((style) => {
        const count = styleStats[style] || 0;
        const isSelected = selectedStyles.includes(style);
        
        return (
          <button
            key={style}
            onClick={() => onToggleStyle(style)}
            disabled={disabled || count === 0}
            className={`
              style-button text-left
              ${isSelected ? 'active' : 'inactive'}
              ${count === 0 ? 'opacity-50 cursor-not-allowed' : ''}
              ${disabled ? 'pointer-events-none' : ''}
            `}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`
                  w-5 h-5 rounded flex items-center justify-center text-xs
                  ${isSelected ? 'bg-cyan-400 text-slate-900' : 'bg-slate-700 text-slate-400'}
                `}>
                  {isSelected ? '✓' : ''}
                </span>
                <span className="font-medium truncate">{style}</span>
              </div>
              <span className={`
                text-xs px-2 py-0.5 rounded-full
                ${isSelected ? 'bg-cyan-400/30 text-cyan-200' : 'bg-slate-700/50 text-slate-400'}
              `}>
                {count}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
