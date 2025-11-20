import React from 'react';
import { Smartphone, Loader2 } from 'lucide-react';

const LoadingFallback: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
        <div className="relative bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
            <Smartphone className="w-10 h-10 text-primary animate-pulse" />
        </div>
      </div>
      
      <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span className="font-medium tracking-wide">Loading SmartPOS...</span>
      </div>
    </div>
  );
};

export default LoadingFallback;