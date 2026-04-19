"use client";

import { useState, useEffect } from "react";

type YearRangeSliderProps = {
  minYear: number;
  maxYear: number;
  yearRange: [number, number];
  onRangeChange: (range: [number, number]) => void;
  songCount: number;
  disabled?: boolean;
};

export function YearRangeSlider({
  minYear,
  maxYear,
  yearRange,
  onRangeChange,
  songCount,
  disabled = false,
}: YearRangeSliderProps) {
  const [localMin, setLocalMin] = useState(yearRange[0]);
  const [localMax, setLocalMax] = useState(yearRange[1]);

  // Sync with parent
  useEffect(() => {
    setLocalMin(yearRange[0]);
    setLocalMax(yearRange[1]);
  }, [yearRange]);

  const handleMinChange = (value: number) => {
    const newMin = Math.min(value, localMax - 1);
    setLocalMin(newMin);
    onRangeChange([newMin, localMax]);
  };

  const handleMaxChange = (value: number) => {
    const newMax = Math.max(value, localMin + 1);
    setLocalMax(newMax);
    onRangeChange([localMin, newMax]);
  };

  // Calculate slider fill percentage
  const minPercent = ((localMin - minYear) / (maxYear - minYear)) * 100;
  const maxPercent = ((localMax - minYear) / (maxYear - minYear)) * 100;

  return (
    <div className={`${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-slate-300">
          Filtrar por años
        </label>
        <span className="text-sm text-slate-400">
          {songCount} canciones en rango
        </span>
      </div>
      
      {/* Year display */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="text-center">
          <input
            type="number"
            value={localMin}
            onChange={(e) => handleMinChange(Number(e.target.value))}
            min={minYear}
            max={localMax - 1}
            className="w-20 px-2 py-1 text-center text-lg font-bold bg-slate-800 border border-slate-600 rounded-lg text-cyan-400 focus:outline-none focus:border-cyan-400"
          />
          <p className="text-xs text-slate-500 mt-1">Desde</p>
        </div>
        <span className="text-slate-500 text-2xl">—</span>
        <div className="text-center">
          <input
            type="number"
            value={localMax}
            onChange={(e) => handleMaxChange(Number(e.target.value))}
            min={localMin + 1}
            max={maxYear}
            className="w-20 px-2 py-1 text-center text-lg font-bold bg-slate-800 border border-slate-600 rounded-lg text-purple-400 focus:outline-none focus:border-purple-400"
          />
          <p className="text-xs text-slate-500 mt-1">Hasta</p>
        </div>
      </div>

      {/* Dual range slider */}
      <div className="relative h-6 pt-2">
        {/* Track background */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 bg-slate-700 rounded-full" />
        
        {/* Track fill */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
          style={{ 
            left: `${minPercent}%`, 
            right: `${100 - maxPercent}%` 
          }}
        />
        
        {/* Min slider */}
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={localMin}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          className="absolute top-0 left-0 w-full h-6 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-cyan-400 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
        />
        
        {/* Max slider */}
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={localMax}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          className="absolute top-0 left-0 w-full h-6 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-purple-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-purple-400 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
        />
      </div>

      {/* Year markers */}
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>{minYear}</span>
        <span>{Math.round((minYear + maxYear) / 2)}</span>
        <span>{maxYear}</span>
      </div>

      {/* Quick presets */}
      <div className="flex flex-wrap gap-2 mt-4">
        {[
          { label: "60s", range: [1960, 1969] as [number, number] },
          { label: "70s", range: [1970, 1979] as [number, number] },
          { label: "80s", range: [1980, 1989] as [number, number] },
          { label: "90s", range: [1990, 1999] as [number, number] },
          { label: "2000s", range: [2000, 2009] as [number, number] },
          { label: "2010s", range: [2010, 2019] as [number, number] },
          { label: "2020s", range: [2020, maxYear] as [number, number] },
          { label: "Todos", range: [minYear, maxYear] as [number, number] },
        ].map(({ label, range }) => (
          <button
            key={label}
            onClick={() => onRangeChange(range)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              localMin === range[0] && localMax === range[1]
                ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/50'
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-300 border border-transparent'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
