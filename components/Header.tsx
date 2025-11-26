import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            A
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">AudioScribe AI</h1>
        </div>
        <div className="text-sm text-gray-500 hidden sm:block">
          Powered by Gemini 2.5 Flash
        </div>
      </div>
    </header>
  );
};