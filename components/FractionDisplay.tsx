import React from 'react';
import { FractionType } from '../types';

interface Props {
  fraction: FractionType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const FractionDisplay: React.FC<Props> = ({ fraction, size = 'md', className = '' }) => {
  const textSize = size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-4xl';
  const wholeSize = size === 'sm' ? 'text-xl' : size === 'md' ? 'text-3xl' : 'text-5xl';
  const barHeight = size === 'sm' ? 'h-0.5' : 'h-1';

  return (
    <div className={`flex items-center font-bold text-slate-700 ${className}`}>
      {fraction.whole > 0 && (
        <span className={`${wholeSize} mr-1 md:mr-2`}>{fraction.whole}</span>
      )}
      {(fraction.n > 0 || (fraction.whole === 0 && fraction.n === 0)) ? (
        <div className="flex flex-col items-center mx-1">
          <span className={textSize}>{fraction.n}</span>
          <div className={`w-full ${barHeight} bg-slate-700 rounded-full my-0.5`}></div>
          <span className={textSize}>{fraction.d}</span>
        </div>
      ) : null}
    </div>
  );
};

export default FractionDisplay;